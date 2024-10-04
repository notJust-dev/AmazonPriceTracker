import Octicons from '@expo/vector-icons/Octicons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Text,
  View,
  FlatList,
  Image,
  Pressable,
  Linking,
  ActivityIndicator,
  Button,
} from 'react-native';

import { Tables } from '~/types/supabase';
import { supabase } from '~/utils/supabase';

dayjs.extend(relativeTime);

// const products = dummyProducts.slice(0, 20);

export default function SearchResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [search, setSearch] = useState<Tables<'searches'> | null>(null);
  const [products, setProducts] = useState<Tables<'products'>[]>([]);

  useEffect(() => {
    fetchSearch();
    fetchProducts();
  }, [id]);

  const fetchSearch = () => {
    supabase
      .from('searches')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => setSearch(data));
  };

  const fetchProducts = () => {
    supabase
      .from('product_search')
      .select('*, products(*)')
      .eq('search_id', id)
      .then(({ data, error }) => {
        console.log(data, error);
        setProducts(data?.map((d) => d.products).filter((p) => !!p) as Tables<'products'>[]);
      });
  };

  useEffect(() => {
    // Listen to inserts
    const subscription = supabase
      .channel('supabase_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'searches' },
        (payload) => {
          console.log(JSON.stringify(payload.new, null, 2));
          if (payload.new?.id === parseInt(id, 10)) {
            setSearch(payload.new);
            fetchProducts();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const startScraping = async () => {
    const { data, error } = await supabase.functions.invoke('scrape-start', {
      body: JSON.stringify({ record: search }),
    });
    console.log(data, error);
  };

  const toggleIsTracked = async () => {
    if (!search?.id) {
      return;
    }
    const { data, error } = await supabase
      .from('searches')
      .update({ is_tracked: !search?.is_tracked })
      .eq('id', search?.id)
      .select()
      .single();
    setSearch(data);
  };

  const getProductLastPrices = async (product) => {
    const { data, error } = await supabase
      .from('product_snapshot')
      .select('*')
      .eq('asin', product.asin)
      .order('created_at', { ascending: false })
      .limit(2);
    console.log(error);
    return {
      ...product,
      snapshots: data,
    };
  };

  const priceDrops = async () => {
    const { data: productSearch, error: productSearchError } = await supabase
      .from('product_search')
      .select('*, products(*)')
      .eq('search_id', id);

    if (!productSearch) {
      return;
    }
    const products = await Promise.all(
      productSearch.map((ps) => getProductLastPrices(ps.products))
    );

    const priceDrops = products.filter(
      (product) =>
        product.snapshots.length === 2 &&
        product.snapshots[0].final_price < product.snapshots[1].final_price
    );

    const message = `
      The are ${priceDrops.length} price drops in your search!

      ${priceDrops.map(
        (product) => `
        ${product.name}
        ${product.url}
        From $${product.snapshots[1].final_price} dropped to ${product.snapshots[0].final_price}
      `
      )}
    `;

    console.log(message);

    // const newProducts = products.filter((product) => product.snapshots.length <= 1);
    // console.log('new: ', JSON.stringify(newProducts, null, 2));
    console.log('drops: ', JSON.stringify(priceDrops, null, 2));
  };

  if (!search) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <View className="m-2 flex-row items-center justify-between gap-2 rounded bg-white p-4 shadow-sm">
        <View>
          <Text className="text-xl font-semibold">{search.query}</Text>
          <Text>Scraped {dayjs(search.last_scraped_at).fromNow()}</Text>
          <Text>{search.status}</Text>
        </View>
        <Octicons
          onPress={toggleIsTracked}
          name={search.is_tracked ? 'bell-fill' : 'bell'}
          size={22}
          color="dimgray"
        />
      </View>
      <Button title="Start scraping" onPress={startScraping} />
      <Button title="Test new price drops" onPress={priceDrops} />

      <FlatList
        data={products}
        contentContainerClassName="gap-2 p-2"
        keyExtractor={(item) => item.asin}
        renderItem={({ item }) => (
          <Link href={`/product/${item.asin}`} asChild>
            <Pressable
              // onPress={() => Linking.openURL(item.url)}
              className="flex-row gap-2 bg-white p-3">
              <Image source={{ uri: item.image }} className="h-20 w-20" resizeMode="contain" />
              <Text className="flex-1" numberOfLines={4}>
                {item.name}
              </Text>
              <Text>$ {item.final_price}</Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

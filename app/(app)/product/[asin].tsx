import dayjs from 'dayjs';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View, Image, FlatList, Linking } from 'react-native';

import { Button } from '~/components/Button';
import { Tables } from '~/types/supabase';
import { supabase } from '~/utils/supabase';

export default function ProductDetailsScreen() {
  const [product, setProduct] = useState<Tables<'products'> | null>(null);
  const [productSnapshots, setProductSnapshots] = useState<Tables<'product_snapshot'>[]>([]);

  const { asin } = useLocalSearchParams<{ asin: string }>();

  useEffect(() => {
    supabase
      .from('products')
      .select('*, product_snapshot(*)')
      .eq('asin', asin)
      .single()
      .then(({ data, error }) => {
        console.log(error);
        setProduct(data);
        setProductSnapshots(data?.product_snapshot || []);
      });
  }, []);

  if (!product) {
    return <Text>Product not found</Text>;
  }

  return (
    <>
      <FlatList
        data={productSnapshots}
        contentContainerClassName="gap-2"
        renderItem={({ item }) => (
          <View className="flex flex-row justify-between bg-white p-3">
            <Text>{dayjs(item.created_at).format('MMMM D, YYYY h:mm A')}</Text>
            <Text>$ {item.final_price}</Text>
          </View>
        )}
        ListHeaderComponent={
          <View>
            <View className="flex-row gap-2 bg-white p-3">
              <Image source={{ uri: product.image }} className="h-20 w-20" resizeMode="contain" />
              <Text className="flex-1" numberOfLines={4}>
                {product.name}
              </Text>
              <Text>$ {product.final_price}</Text>
            </View>

            {product.url && (
              <Button
                className="m-3"
                title="Open on Amazon"
                onPress={() => Linking.openURL(product.url)}
              />
            )}

            <Text className="mt-4 p-2 font-semibold">Price history</Text>
          </View>
        }
      />
    </>
  );
}

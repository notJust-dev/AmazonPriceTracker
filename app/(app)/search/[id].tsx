import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View, FlatList, Image, Pressable, Linking, ActivityIndicator } from 'react-native';

import dummyProducts from '~/assets/search.json';
import { supabase } from '~/utils/supabase';

dayjs.extend(relativeTime);

const products = dummyProducts.slice(0, 20);

export default function SearchResultScreen() {
  const { id } = useLocalSearchParams();
  const [search, setSearch] = useState();

  useEffect(() => {
    supabase
      .from('searches')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => setSearch(data));
  }, [id]);

  if (!search) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <View className="m-2 gap-2 rounded bg-white p-2 shadow-sm">
        <Text className="text-xl font-semibold">{search.query}</Text>
        <Text>{dayjs(search.created_at).fromNow()}</Text>
        <Text>{search.status}</Text>
      </View>

      <FlatList
        data={products}
        contentContainerClassName="gap-2 p-2"
        keyExtractor={(item) => item.asin}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => Linking.openURL(item.url)}
            className="flex-row gap-2 bg-white p-3">
            <Image source={{ uri: item.image }} className="h-20 w-20" />
            <Text className="flex-1" numberOfLines={4}>
              {item.name}
            </Text>
            <Text>$ {item.final_price}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

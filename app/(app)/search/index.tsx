import { Text, View, FlatList, Image, Pressable, Linking } from 'react-native';

import dummyProducts from '~/assets/search.json';

const products = dummyProducts.slice(0, 20);

export default function SearchResultScreen() {
  return (
    <View>
      <Text className="text-xl">Search Results</Text>

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

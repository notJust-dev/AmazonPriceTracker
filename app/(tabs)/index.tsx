import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View, Text } from 'react-native';

export default function Home() {
  const [search, setSearch] = useState('');

  const performSearch = () => {
    console.warn('Search: ', search);

    // save this search in database

    // scrape amazon fro this query

    router.push('/search');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Search' }} />

      <View className="flex-row gap-3 p-3">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search for a product"
          className="flex-1 rounded border border-gray-300 bg-white p-3"
        />
        <Pressable onPress={performSearch} className="rounded bg-teal-500 p-3">
          <Text>Search</Text>
        </Pressable>
      </View>
    </>
  );
}

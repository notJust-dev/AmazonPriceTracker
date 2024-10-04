import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link, router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, TextInput, View, Text, FlatList } from 'react-native';

import { useAuth } from '~/contexts/AuthContext';
import { Tables } from '~/types/supabase';
import { supabase } from '~/utils/supabase';

dayjs.extend(relativeTime);

export default function Home() {
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState<Tables<'searches'>[]>([]);
  const { user } = useAuth();

  const fetchHistory = () => {
    if (!user) {
      return;
    }

    supabase
      .from('searches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setHistory(data || []));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const performSearch = async () => {
    if (!user) {
      return;
    }

    // save this search in database
    const { data, error } = await supabase
      .from('searches')
      .insert({
        query: search,
        user_id: user.id,
      })
      .select()
      .single();

    if (data) {
      router.push(`/search/${data.id}`);
    }
  };

  return (
    <View className="flex-1 bg-white">
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

      <FlatList
        data={history}
        contentContainerClassName="p-3 gap-2 "
        onRefresh={fetchHistory}
        refreshing={false}
        renderItem={({ item }) => (
          <Link href={`/search/${item.id}`} asChild>
            <Pressable className=" border-b border-gray-200 pb-2">
              <Text className="text-lg font-semibold">{item.query}</Text>
              <Text className="color-gray">{dayjs(item.created_at).fromNow()}</Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

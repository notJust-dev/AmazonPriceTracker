import { Octicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link } from 'expo-router';
import { Pressable, View, Text } from 'react-native';

import { Tables } from '~/types/supabase';

dayjs.extend(relativeTime);

export default function SearchListItem({ search }: { search: Tables<'searches'> }) {
  return (
    <Link href={`/search/${search.id}`} asChild>
      <Pressable className="flex-row items-center justify-between border-b border-gray-200 pb-2">
        <View>
          <Text className="text-lg font-semibold">{search.query}</Text>
          <Text className="color-gray">Scraped {dayjs(search.last_scraped_at).fromNow()}</Text>
        </View>
        <Octicons name={search.is_tracked ? 'bell-fill' : 'bell'} size={22} color="dimgray" />
      </Pressable>
    </Link>
  );
}

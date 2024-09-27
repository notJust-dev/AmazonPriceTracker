import { StatusBar } from 'expo-status-bar';
import { Platform, Text } from 'react-native';

import { supabase } from '~/utils/supabase';

export default function Modal() {
  return (
    <>
      <Text onPress={() => supabase.auth.signOut()}>Sign out</Text>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}

import '../global.css';

import { Stack } from 'expo-router';

import AuthContextProvider from '~/contexts/AuthContext';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <Stack>
        <Stack.Screen name="(app)/(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)/modal" options={{ presentation: 'modal' }} />
      </Stack>
    </AuthContextProvider>
  );
}

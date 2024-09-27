import { Redirect, Slot } from 'expo-router';

import { useAuth } from '~/contexts/AuthContext';

export default function AuthLayout() {
  const { user } = useAuth();

  if (user) {
    return <Redirect href="/" />;
  }
  return <Slot />;
}

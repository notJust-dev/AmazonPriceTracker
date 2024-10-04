import { AuthSession, Session, User } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { supabase } from '~/utils/supabase';

type AuthContextType = {
  session: AuthSession | null;
  user: User | null;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
});

export default function AuthContextProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsReady(true);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (!isReady) {
    return <ActivityIndicator />;
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user || null }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { UIProvider, useUI } from '@/contexts/UIContext';
import LoadingScreen from '@/components/LoadingScreen';
import ToastContainer from '@/components/Toast';

function GlobalUI() {
  const { isLoading } = useUI();
  return (
    <>
      {isLoading && <LoadingScreen />}
      <ToastContainer />
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider>
      <AuthProvider>
        <GlobalUI />
        {children}
      </AuthProvider>
    </UIProvider>
  );
}

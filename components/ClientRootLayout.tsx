'use client';

import dynamic from 'next/dynamic';

const AuthProviderWrapper = dynamic(
  () => import('./AuthProviderWrapper'),
  { ssr: false }
);

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  return <AuthProviderWrapper>{children}</AuthProviderWrapper>;
} 
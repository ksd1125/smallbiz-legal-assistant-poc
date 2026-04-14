import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: '소상공인 법률정보 도우미',
  description: '소상공인과 예비창업자를 위한 법률정보 도우미 POC'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

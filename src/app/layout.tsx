import type { Metadata } from 'next';
import '../styles/globals.css';
import UserStore from './user-store';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce, ToastContainer } from 'react-toastify';

export const metadata: Metadata = {
  title: 'Wibby',
  description: 'Wibby에서 스터디를 모집하고 효율적으로 일정을 관리해보세요.',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    siteName: 'Wibby',
    images: {
      url: '/apple-touch-icon.png',
    },
  },
  twitter: {
    title: 'Wibby',
    images: {
      url: '/apple-touch-icon.png',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko'>
      <body>
        <UserStore />
        {children}
        <ToastContainer
          toastClassName='tm4 toast-paperlogy'
          position='top-center'
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          theme='light'
          transition={Bounce}
        />
      </body>
    </html>
  );
}

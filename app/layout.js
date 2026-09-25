import './globals.css';
import { AuthProvider } from '../lib/AuthProvider';
import NavBar from '../components/NavBar';

export const metadata = {
  title: 'Espolyaryum Archive',
  description: 'A keepsake vault for photos, videos, music, and memory notes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Special+Elite&family=Cormorant+Garamond:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <NavBar />
          <main className="page-container">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}


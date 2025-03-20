import '../styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import CookieConsent from '../components/CookieConsent';

export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
          card: 'bg-white',
        }
      }}
      {...pageProps}
    >
      <Component {...pageProps} />
      <CookieConsent />
    </ClerkProvider>
  );
} 
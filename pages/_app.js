import { ClerkProvider } from '@clerk/nextjs';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
        }
      }}
      navigate={(to) => window.location.href = to}
    >
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp; 
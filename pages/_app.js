import '../styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import CookieConsent from '../components/CookieConsent';
import { useRouter } from 'next/router';

// Create simple error components
const ErrorPage = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
      <p className="mt-2 text-gray-600">There was an error with the authentication service.</p>
      <p className="mt-4">
        <a href="/" className="text-blue-600 hover:underline">Return to homepage</a>
      </p>
    </div>
  </div>
);

export default function App({ Component, pageProps }) {
  const { push } = useRouter();
  
  return (
    <ClerkProvider
      appearance={{
        baseTheme: 'dark',
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
          card: 'bg-white',
        }
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      navigate={(to) => push(to)}
      errorComponent={ErrorPage}
      {...pageProps}
    >
      <Component {...pageProps} />
      <CookieConsent />
    </ClerkProvider>
  );
} 
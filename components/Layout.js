import Head from 'next/head';
import Link from 'next/link';
import { useUser, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Layout({ children, title = 'RAEGERA - Master German Articles' }) {
  const { user, isLoaded } = useUser();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Master German articles with our specialized practice system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                  R
                </div>
                <span className="ml-2 text-blue-500 text-xl font-bold">RAEGERA</span>
              </Link>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              {user && (
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
              )}
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Terms
              </Link>
            </nav>
            
            {/* Authentication Buttons */}
            <div className="flex items-center space-x-4">
              {isLoaded && (
                user ? (
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  <div className="flex gap-3">
                    <SignInButton mode="modal">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
} 
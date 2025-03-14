import Link from 'next/link';
import { useRouter } from 'next/router';
import { UserButton, useUser } from "@clerk/nextjs";

export default function Layout({ children }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  // Function to determine if a link is active
  const isActive = (path) => router.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side: Logo and Nav */}
            <div className="flex items-center">
              {/* Logo */}
              <Link href="/" legacyBehavior>
                <a className="flex items-center">
                  <div className="bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold">
                    V
                  </div>
                  <span className="ml-2 text-xl font-bold text-blue-500">VOLKARI</span>
                </a>
              </Link>

              {/* Navigation - Show whenever user is authenticated */}
              {user && (
                <nav className="ml-10 flex space-x-8">
                  <Link href="/" legacyBehavior>
                    <a className={`px-3 py-2 text-sm font-medium ${
                      isActive('/') 
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}>
                      Home
                    </a>
                  </Link>
                  
                  <Link href="/dashboard" legacyBehavior>
                    <a className={`px-3 py-2 text-sm font-medium ${
                      isActive('/dashboard')
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}>
                      Dashboard
                    </a>
                  </Link>
                  
                  <Link href="/practice" legacyBehavior>
                    <a className={`px-3 py-2 text-sm font-medium ${
                      isActive('/practice')
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}>
                      Practice
                    </a>
                  </Link>
                  
                  <Link href="/repository" legacyBehavior>
                    <a className={`px-3 py-2 text-sm font-medium ${
                      isActive('/repository')
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}>
                      Repository
                    </a>
                  </Link>
                </nav>
              )}
            </div>

            {/* Right side: Auth buttons */}
            {isLoaded && (
              <div className="flex items-center">
                {user ? (
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        userButtonAvatarBox: {
                          width: '2rem',
                          height: '2rem'
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link href="/signin" legacyBehavior>
                      <a className="text-sm font-medium text-gray-500 hover:text-gray-700">
                        Sign in
                      </a>
                    </Link>
                    <Link href="/signup" legacyBehavior>
                      <a className="text-sm font-medium px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Sign up
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 
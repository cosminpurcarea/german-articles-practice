import { SignUp } from "@clerk/nextjs";
import Layout from '../components/Layout';

export default function SignUpPage() {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
          </div>
          <SignUp 
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-blue-600 hover:bg-blue-700 text-white",
                card: 
                  "bg-white shadow-lg rounded-lg",
              },
            }}
          />
        </div>
      </div>
    </Layout>
  );
} 
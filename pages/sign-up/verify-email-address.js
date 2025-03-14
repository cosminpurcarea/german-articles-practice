import { useSignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function VerifyEmailAddress() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [verificationSent, setVerificationSent] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  // Send verification email on component mount
  useEffect(() => {
    if (!isLoaded) return;

    const sendInitialVerification = async () => {
      try {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        console.log("Initial verification email requested");
      } catch (err) {
        console.error("Error sending initial verification:", err);
        setError("Failed to send initial verification email. Please try resending.");
      }
    };

    sendInitialVerification();
  }, [isLoaded, signUp]);

  // Function to resend verification email
  const resendVerificationEmail = async () => {
    if (!isLoaded || isResending) return;

    try {
      setIsResending(true);
      setError("");
      console.log("Requesting new verification code...");
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      console.log("New verification code requested successfully");
      setVerificationSent(true);
    } catch (err) {
      console.error("Error resending verification:", err);
      setError("Failed to send verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Function to verify the code
  const verifyCode = async (e) => {
    e.preventDefault();
    if (!isLoaded || !code) {
      setError("Please enter a verification code");
      return;
    }

    try {
      setError("");
      console.log("Attempting to verify code...");
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      console.log("Verification response:", completeSignUp);

      if (completeSignUp.status !== "complete") {
        setError("Invalid verification code. Please try again.");
        return;
      }
      
      await setActive({ session: completeSignUp.createdSessionId });
      router.push("/dashboard");
    } catch (err) {
      console.error("Error verifying email:", err);
      setError(err.message || "Failed to verify email. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Verify your email
            </h2>
            <p className="text-gray-600 mb-6">
              Please check your email for a verification code.
              {signUp?.emailAddress && (
                <span className="block mt-1 text-sm text-gray-500">
                  Sent to: {signUp.emailAddress}
                </span>
              )}
            </p>

            {error && (
              <p className="text-red-600 text-sm mb-4">
                {error}
              </p>
            )}
            
            {verificationSent && (
              <p className="text-green-600 text-sm mb-4">
                New verification code has been sent!
              </p>
            )}

            <form onSubmit={verifyCode} className="space-y-6">
              <div>
                <label htmlFor="code" className="sr-only">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter verification code"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Verify Email
              </button>
            </form>

            <div className="mt-4">
              <button
                onClick={resendVerificationEmail}
                disabled={isResending}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${isResending 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {isResending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Resend verification code'
                )}
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <a href="/sign-in" className="text-blue-600 hover:text-blue-500">
                Back to sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consentChoice = localStorage.getItem('cookie-consent');
    
    if (!consentChoice) {
      // Show the banner if no choice has been made
      setShowConsent(true);
    } else {
      // Parse saved preferences
      try {
        setCookiePreferences(JSON.parse(consentChoice));
      } catch (e) {
        console.error('Error parsing cookie preferences', e);
        setShowConsent(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    setCookiePreferences(allAccepted);
    setShowConsent(false);
  };

  const handleRejectAll = () => {
    const allRejected = {
      necessary: true, // Necessary cookies are always accepted
      analytics: false,
      marketing: false,
      preferences: false
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(allRejected));
    setCookiePreferences(allRejected);
    setShowConsent(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(cookiePreferences));
    setShowPreferences(false);
    setShowConsent(false);
  };

  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setCookiePreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t border-gray-200">
      {!showPreferences ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 mb-4 md:mb-0 md:mr-8">
              <h3 className="text-lg font-medium text-gray-900">We value your privacy</h3>
              <p className="mt-1 text-sm text-gray-600">
                We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
              </p>
              <button 
                onClick={() => setShowPreferences(true)}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Cookie Settings
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRejectAll}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptAll}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900">Cookie Preferences</h3>
            <p className="mt-1 text-sm text-gray-600">
              Manage your cookie preferences. Necessary cookies help make the website usable by enabling basic functions.
            </p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="necessary"
                  name="necessary"
                  type="checkbox"
                  checked={cookiePreferences.necessary}
                  disabled={true}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="necessary" className="font-medium text-gray-700">Necessary Cookies</label>
                <p className="text-gray-500">These cookies are required for the website to function and cannot be disabled.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="analytics"
                  name="analytics"
                  type="checkbox"
                  checked={cookiePreferences.analytics}
                  onChange={handlePreferenceChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="analytics" className="font-medium text-gray-700">Analytics Cookies</label>
                <p className="text-gray-500">These cookies help us understand how visitors interact with the website.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="marketing"
                  name="marketing"
                  type="checkbox"
                  checked={cookiePreferences.marketing}
                  onChange={handlePreferenceChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="marketing" className="font-medium text-gray-700">Marketing Cookies</label>
                <p className="text-gray-500">These cookies are used to track visitors across websites for advertising purposes.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="preferences"
                  name="preferences"
                  type="checkbox"
                  checked={cookiePreferences.preferences}
                  onChange={handlePreferenceChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="preferences" className="font-medium text-gray-700">Preferences Cookies</label>
                <p className="text-gray-500">These cookies enable personalized features and remember your preferences.</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowPreferences(false)}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePreferences}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
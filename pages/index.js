import { useState } from 'react';
import { useUser } from "@clerk/nextjs";
import Layout from '../components/Layout';
import Link from 'next/link';

export default function Home() {
  const { user, isLoaded } = useUser();
  
  // Practice example demo state
  const [word] = useState("Haus");
  
  return (
    <Layout>
      <div className="min-h-screen bg-blue-50">
        {/* Hero Section */}
        <div className="py-16 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-6">
                <div className="text-blue-500 text-5xl font-bold mb-2">VOLKARI</div>
                <div className="text-gray-600 italic mb-6">"Finis Coronat Opus"</div>
                
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                  Learn German Articles <span className="text-blue-500">Better <br />Than Natives</span>
                </h1>
                
                <p className="mt-6 text-gray-600">
                  Master der, die, das with our specialized practice system. Build confidence and fluency through daily practice and smart repetition.
                </p>
                
                <div className="mt-8 flex space-x-4">
                  {isLoaded && (
                    user ? (
                      <Link href="/dashboard" legacyBehavior>
                        <a className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                          Go to Dashboard
                        </a>
                      </Link>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/sign-up" legacyBehavior>
                          <a className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                            Get Started Free
                          </a>
                        </Link>
                        <Link href="/sign-in" legacyBehavior>
                          <a className="inline-flex items-center justify-center px-5 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50">
                            Sign In
                          </a>
                        </Link>
                      </div>
                    )
                  )}
                </div>
              </div>
              
              <div className="mt-12 lg:mt-0 lg:col-span-6">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="px-6 py-8">
                    <h2 className="text-center text-lg font-medium text-gray-900 mb-8">
                      Practice Example
                    </h2>
                    
                    <div className="text-center mb-8">
                      <span className="text-3xl font-bold text-gray-900">
                        {word}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <button className="py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        der
                      </button>
                      <button className="py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        die
                      </button>
                      <button className="py-2 px-4 bg-blue-500 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-600">
                        das
                      </button>
                    </div>
                    
                    <p className="mt-6 text-center text-xs text-gray-500">
                      Practice with thousands of nouns
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold text-gray-900">Why VOLKARI Works</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Our specialized approach has helped thousands of German learners master articles with confidence.
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* German Nouns Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">2,000+</div>
                  <div className="mt-1 text-lg font-medium text-gray-900">German Nouns</div>
                  <p className="mt-3 text-sm text-gray-500">
                    Comprehensive database of German nouns with articles
                  </p>
                </div>
              </div>
              
              {/* Success Rate Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">85%</div>
                  <div className="mt-1 text-lg font-medium text-gray-900">Success Rate</div>
                  <p className="mt-3 text-sm text-gray-500">
                    Average improvement in article accuracy after 30 days
                  </p>
                </div>
              </div>
              
              {/* Practice Sessions Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">15,000+</div>
                  <div className="mt-1 text-lg font-medium text-gray-900">Practice Sessions</div>
                  <p className="mt-3 text-sm text-gray-500">
                    Completed by our users every month
                  </p>
                </div>
              </div>
              
              {/* User Satisfaction Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">92%</div>
                  <div className="mt-1 text-lg font-medium text-gray-900">User Satisfaction</div>
                  <p className="mt-3 text-sm text-gray-500">
                    Users report significant improvement in confidence
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Key Features Section */}
        <div className="py-16 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Key Features</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Tools designed to help you learn German articles effectively.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Feature 1 - Daily Practice Reminders */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6 text-center">
                  <div className="h-12 w-12 mx-auto text-blue-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Daily Practice Reminders</h3>
                  <p className="text-gray-600">
                    Receive optional email reminders to help you maintain your learning streak.
                  </p>
                </div>
              </div>
              
              {/* Feature 2 - Spaced Repetition */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6 text-center">
                  <div className="h-12 w-12 mx-auto text-blue-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Spaced Repetition</h3>
                  <p className="text-gray-600">
                    Optimize memory retention with intelligent review scheduling based on your performance.
                  </p>
                </div>
              </div>
              
              {/* Feature 3 - Cross-Device Access */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6 text-center">
                  <div className="h-12 w-12 mx-auto text-blue-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Cross-Device Access</h3>
                  <p className="text-gray-600">
                    Practice seamlessly across all your devices with our responsive web application.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/dashboard" legacyBehavior>
                <a className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                  Get Started Today
                </a>
              </Link>
            </div>
          </div>
        </div>
        
        {/* User Testimonials Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">What Our Users Say</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Join thousands of satisfied users who have mastered German articles with VOLKARI.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Testimonial 1 */}
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-800 font-semibold">SM</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">Sarah M.</h3>
                      <p className="text-sm text-gray-600">Language Enthusiast</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic mb-4">
                    "VOLKARI has completely transformed my German learning experience. I used to struggle with articles, but now I can confidently use 'der', 'die', and 'das' correctly in most situations."
                  </p>
                  <div className="flex text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-800 font-semibold">TW</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">Dr. Thomas Weber</h3>
                      <p className="text-sm text-gray-600">German Language Professor</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic mb-4">
                    "As a German teacher, I recommend VOLKARI to all my students. The spaced repetition system and focused practice on articles is exactly what most learners need."
                  </p>
                  <div className="flex text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 3 */}
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-800 font-semibold">MK</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">Michael K.</h3>
                      <p className="text-sm text-gray-600">Business Professional</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic mb-4">
                    "I've tried many language apps, but VOLKARI is the only one that specifically addresses the challenge of German articles. My accuracy has improved from 60% to over 90% in just two months!"
                  </p>
                  <div className="flex text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-6">Join over 10,000 users who are mastering German articles with VOLKARI.</p>
              <Link href="/dashboard" legacyBehavior>
                <a className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                  Get Started Today
                </a>
              </Link>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="py-16 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Get answers to the most common questions about VOLKARI.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto divide-y divide-gray-200">
              {/* FAQ Item 1 */}
              <div className="py-6">
                <h3 className="text-lg font-medium text-gray-900">How does VOLKARI help with German articles?</h3>
                <p className="mt-2 text-gray-600">
                  VOLKARI uses a specialized spaced repetition system focused solely on German articles. By practicing regularly with our system, you'll develop an intuition for the correct article usage through pattern recognition and consistent practice.
                </p>
              </div>
              
              {/* FAQ Item 2 */}
              <div className="py-6">
                <h3 className="text-lg font-medium text-gray-900">Is VOLKARI suitable for beginners?</h3>
                <p className="mt-2 text-gray-600">
                  Yes! VOLKARI is designed for learners at all levels. Beginners will build a strong foundation by learning articles correctly from the start, while intermediate and advanced learners can fill gaps in their knowledge and improve accuracy.
                </p>
              </div>
              
              {/* FAQ Item 3 */}
              <div className="py-6">
                <h3 className="text-lg font-medium text-gray-900">How much time should I spend practicing daily?</h3>
                <p className="mt-2 text-gray-600">
                  We recommend 10-15 minutes of daily practice for optimal results. Consistent short sessions are more effective than occasional long sessions. Our spaced repetition system will adjust to your learning pace.
                </p>
              </div>
              
              {/* FAQ Item 4 */}
              <div className="py-6">
                <h3 className="text-lg font-medium text-gray-900">Can I use VOLKARI alongside other German learning resources?</h3>
                <p className="mt-2 text-gray-600">
                  Absolutely! VOLKARI is designed to complement your existing German learning resources. While other apps and courses cover grammar and vocabulary broadly, VOLKARI specifically addresses the challenging aspect of article usage.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-white">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1">
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold">
                    V
                  </div>
                  <span className="ml-2 text-xl font-bold text-blue-500">VOLKARI</span>
                </div>
                <p className="mt-4 text-gray-500 text-sm">
                  Mastering German articles, one practice session at a time.
                </p>
              </div>
              
              <div className="md:col-span-1">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Platform</h3>
                <ul className="mt-4 space-y-4">
                  <li><a href="/dashboard" className="text-base text-gray-500 hover:text-gray-900">Dashboard</a></li>
                  <li><a href="/practice" className="text-base text-gray-500 hover:text-gray-900">Practice</a></li>
                  <li><a href="/repository" className="text-base text-gray-500 hover:text-gray-900">Repository</a></li>
                </ul>
              </div>
              
              <div className="md:col-span-1">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
                <ul className="mt-4 space-y-4">
                  <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Blog</a></li>
                  <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Support</a></li>
                  <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Privacy Policy</a></li>
                </ul>
              </div>
              
              <div className="md:col-span-1">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Connect</h3>
                <ul className="mt-4 space-y-4">
                  <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Contact Us</a></li>
                  <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Twitter</a></li>
                  <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">LinkedIn</a></li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-base text-gray-400 text-center">
                &copy; {new Date().getFullYear()} VOLKARI. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
} 
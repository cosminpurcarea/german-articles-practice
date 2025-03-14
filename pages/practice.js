import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import supabase from '../lib/supabase';
import { useUser } from "@clerk/nextjs";
import WordDetailsModal from '../components/WordDetailsModal';

export default function Practice() {
  // Mock user for testing without Clerk
  const mockUser = { id: 'test-user-id' };
  
  const { user } = useUser();
  
  const [config, setConfig] = useState({
    numberOfNouns: 10,
    secondsPerQuestion: 5,
  });
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [currentSession, setCurrentSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [nouns, setNouns] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [sessionResults, setSessionResults] = useState(null);
  const timerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notification, setNotification] = useState({ message: '', isCorrect: false });
  const [selectedWord, setSelectedWord] = useState(null);

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfig({
      ...config,
      [name]: parseInt(value, 10),
    });
  };

  const startSession = async () => {
    try {
      setLoading(true);
      
      // Create new session with only fields that exist in your schema
      const { data: sessionData, error: sessionError } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: user.id,
          total_questions: config.numberOfNouns,
          seconds_per_question: config.secondsPerQuestion,
          status: 'in_progress',
          created_at: new Date().toISOString(),
          correct_count: 0,
          success_rate: 0
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      
      // Fetch nouns with all their details from Supabase
      const { data: nounsData, error: nounsError } = await supabase
        .from('nouns')
        .select(`
          id,
          word,
          article,
          translation,
          rule
        `);

      if (nounsError) throw nounsError;

      if (!nounsData || nounsData.length === 0) {
        alert("No nouns found in the database. Please add some nouns first.");
        return;
      }

      // Shuffle and select nouns
      const shuffledNouns = [...nounsData].sort(() => Math.random() - 0.5);
      const selectedNouns = shuffledNouns.slice(0, config.numberOfNouns);

      // Initialize session state
      setNouns(selectedNouns);
      setCurrentSession(sessionData);
      setCurrentQuestion(0);
      setTimeLeft(config.secondsPerQuestion);
      setAnswers([]);
      setIsConfiguring(false);
    } catch (error) {
      console.error('Error starting session:', error);
      alert(`Failed to start session: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = (article) => {
    // Calculate response time from when the question was shown
    const responseTime = config.secondsPerQuestion - timeLeft;

    // Create answer object
    const answer = {
      noun: nouns[currentQuestion],
      answer: article,
      isCorrect: article === nouns[currentQuestion].article,
      responseTime: responseTime,
      timestamp: new Date().toISOString()
    };

    // Add answer to list
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    // Show notification
    setNotification({
      message: answer.isCorrect ? 'Correct!' : `Incorrect. The correct article is "${nouns[currentQuestion].article}"`,
      isCorrect: answer.isCorrect
    });
    setNotificationVisible(true);
    setTimeout(() => setNotificationVisible(false), 2000);

    // Move to next question or finish
    if (currentQuestion < nouns.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(config.secondsPerQuestion);
    } else {
      finishSession(newAnswers);
    }
  };

  const timeoutAnswer = () => {
    if (currentQuestion >= nouns.length) {
      return; // Prevent processing if we're already at the end
    }
    
    // Create answer object for timeout
    const answer = {
      noun: nouns[currentQuestion],
      answer: null,
      isCorrect: false,
      responseTime: config.secondsPerQuestion,
      timestamp: new Date().toISOString()
    };

    // Add answer to list and move to next question
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    // If this was the last question, finish the session
    if (currentQuestion === nouns.length - 1) {
      finishSession(newAnswers);
    } else {
      // Otherwise move to next question
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(config.secondsPerQuestion);
    }
  };

  const handleTimeout = () => {
    timeoutAnswer();
  };

  const finishSession = async (finalAnswers) => {
    // Add a guard to prevent multiple calls
    if (sessionResults) return;
    
    try {
      // Count correct answers and calculate accuracy
      const correctCount = finalAnswers.filter((a) => a.isCorrect).length;
      const accuracy = Math.round((correctCount / finalAnswers.length) * 100);
      
      // Calculate valid responses (excluding timeouts)
      const validResponses = finalAnswers.filter(a => a.answer !== null);
      const responseTimes = validResponses.map(a => a.responseTime);
      
      // Prepare session update data
      const sessionUpdate = {
        status: 'completed',
        correct_count: correctCount,
        success_rate: accuracy,
        completed_at: new Date().toISOString(),
        average_response_time_ms: responseTimes.length > 0 ? 
          Math.round(responseTimes.reduce((a, b) => a + b, 0) * 1000 / responseTimes.length) : null,
        fastest_time: responseTimes.length > 0 ? Math.min(...responseTimes) : null,
        average_time: responseTimes.length > 0 ? 
          responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : null,
        timeouts: finalAnswers.filter(a => a.answer === null).length
      };

      console.log('Updating session with:', sessionUpdate);

      // Update session in database
      const { data, error } = await supabase
        .from('practice_sessions')
        .update(sessionUpdate)
        .eq('id', currentSession.id)
        .select();

      if (error) {
        console.error("Error updating session:", error);
        throw error;
      }

      // Save individual answers to the session_answers table
      const answersToInsert = finalAnswers.map(answer => ({
        user_id: user.id,
        session_id: currentSession.id,
        noun_id: answer.noun.id,
        user_answer: answer.answer,
        is_correct: answer.isCorrect,
        response_time: answer.responseTime,
        created_at: answer.timestamp
      }));

      const { error: answersError } = await supabase
        .from('session_answers')
        .insert(answersToInsert);

      if (answersError) {
        console.error("Error saving answers:", answersError);
        // Continue with showing results even if answers save fails
      }

      // Set results for display
      setSessionResults({
        correct: correctCount,
        total: finalAnswers.length,
        accuracy: accuracy,
        fastestResponse: responseTimes.length > 0 ? Math.min(...responseTimes).toFixed(3) : "N/A",
        averageTime: responseTimes.length > 0 ? 
          (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(3) : "N/A",
        timeouts: finalAnswers.filter(a => a.answer === null).length
      });

    } catch (error) {
      console.error("Error finishing session:", error);
      // Show error state but still display results
      setSessionResults({
        correct: finalAnswers.filter(a => a.isCorrect).length,
        total: finalAnswers.length,
        accuracy: Math.round((finalAnswers.filter(a => a.isCorrect).length / finalAnswers.length) * 100),
        fastestResponse: "Error",
        averageTime: "Error",
        timeouts: finalAnswers.filter(a => a.answer === null).length
      });
    }
  };

  const resetPractice = () => {
    setIsConfiguring(true);
    setCurrentSession(null);
    setCurrentQuestion(null);
    setNouns([]);
    setAnswers([]);
    setTimeLeft(null);
    setSessionResults(null);
  };

  const handleWordClick = async (answer) => {
    try {
      // Fetch full word details including rules and examples
      const { data, error } = await supabase
        .from('nouns')
        .select('*')
        .eq('id', answer.noun.id)
        .single();
      
      if (error) throw error;
      setSelectedWord(data);
    } catch (error) {
      console.error('Error fetching word details:', error);
    }
  };

  // Timer effect
  useEffect(() => {
    if (currentQuestion === null || sessionResults) {
      return; // Don't run timer if no question or session is complete
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          timeoutAnswer();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion, sessionResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Practice German Articles</h1>

        {/* Notification Banner */}
        {notificationVisible && (
          <div className={`mb-4 p-3 rounded-md shadow-md fixed top-4 right-4 left-4 md:left-auto md:w-1/3 z-50 transform transition-transform duration-300 ease-in-out ${
            notification.isCorrect 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.isCorrect ? (
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {isConfiguring ? (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-1">Session Setup</h2>
            <p className="text-sm text-gray-500 mb-6">Configure your practice session</p>
            
            <div className="mb-4">
              <label htmlFor="numberOfNouns" className="block text-sm font-medium text-gray-700 mb-1">
                Number of nouns
              </label>
              <input
                type="number"
                name="numberOfNouns"
                id="numberOfNouns"
                min="1"
                max="50"
                value={config.numberOfNouns}
                onChange={handleConfigChange}
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="secondsPerQuestion" className="block text-sm font-medium text-gray-700 mb-1">
                Seconds per question
              </label>
              <input
                type="number"
                name="secondsPerQuestion"
                id="secondsPerQuestion"
                min="1"
                max="60"
                value={config.secondsPerQuestion}
                onChange={handleConfigChange}
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={startSession}
                disabled={loading}
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? 'Loading...' : 'Start Session'}
              </button>
            </div>
          </div>
        ) : sessionResults ? (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Session Results</h2>
            
            <div className="mb-8 text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">{sessionResults.accuracy}%</div>
              <p className="text-gray-500">Accuracy</p>
              <p className="mt-2 text-gray-700">
                You got <span className="font-medium">{sessionResults.correct}</span> out of{' '}
                <span className="font-medium">{sessionResults.total}</span> correct
              </p>
            </div>
            
            {/* Detailed Results Table */}
            <div className="space-y-8">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Word</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Answer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Article</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Translation</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {answers.map((answer, index) => (
                      <tr 
                        key={index}
                        onClick={() => handleWordClick(answer)}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          answer.isCorrect ? 'bg-green-50' : 'bg-red-50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {answer.noun.word}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {answer.answer || 'Timed out'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {answer.noun.article}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {answer.noun.translation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add the modal */}
              {selectedWord && (
                <WordDetailsModal 
                  word={selectedWord} 
                  onClose={() => setSelectedWord(null)} 
                />
              )}
            </div>
            
            {/* Performance Stats */}
            <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Fastest Response</p>
                <p className="mt-1 text-2xl font-semibold text-blue-900">
                  {sessionResults.fastestResponse || '—'} s
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Average Time</p>
                <p className="mt-1 text-2xl font-semibold text-blue-900">
                  {sessionResults.averageTime || '—'} s
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Timeouts</p>
                <p className="mt-1 text-2xl font-semibold text-blue-900">
                  {sessionResults.timeouts || 0}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={resetPractice}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Practice Again
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {nouns.length}
              </div>
              <div className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {timeLeft}s remaining
              </div>
            </div>
            
            <div className="mb-8 text-center">
              <div className="text-3xl font-bold mb-2">{nouns[currentQuestion]?.word}</div>
              {nouns[currentQuestion]?.translation && (
                <div className="text-sm text-gray-500">({nouns[currentQuestion].translation})</div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {['der', 'die', 'das'].map((article) => (
                <button
                  key={article}
                  onClick={() => submitAnswer(article)}
                  className="py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  {article}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 
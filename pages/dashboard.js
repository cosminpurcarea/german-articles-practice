import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import supabase from '../lib/supabase';
import Link from 'next/link';
import { useUser } from "@clerk/nextjs";
import WordDetailsModal from '../components/WordDetailsModal';

// Define the SVG icons inline
const ChevronDownIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

export default function Dashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgSuccessRate: 0,
    currentStreak: 0,
    successTrend: [],
    sessionsPerDay: [],
    recentSessions: []
  });
  const [sessionDetails, setSessionDetails] = useState({});
  const [expandedSession, setExpandedSession] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const calculateStreak = (sessions) => {
    if (!sessions.length) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasSessionOnDate = sessions.some(session => {
        const sessionDate = new Date(session.created_at).toISOString().split('T')[0];
        return sessionDate === dateStr;
      });
      
      if (!hasSessionOnDate) break;
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.error("No user ID available");
        return;
      }

      // Fetch completed practice sessions
      const { data: sessions, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      console.log('Fetched sessions:', sessions);

      if (error) {
        console.error("Error fetching sessions:", error);
        throw error;
      }

      if (!sessions || sessions.length === 0) {
        setStats({
          totalSessions: 0,
          avgSuccessRate: 0,
          currentStreak: 0,
          successTrend: [],
          sessionsPerDay: [],
          recentSessions: []
        });
        return;
      }

      // Calculate statistics
      const totalSessions = sessions.length;
      
      // Calculate average success rate
      const avgSuccessRate = Math.round(
        sessions.reduce((sum, session) => sum + (session.success_rate || 0), 0) / sessions.length
      );

      // Calculate streak
      const streak = calculateStreak(sessions);

      // Format recent sessions with IDs
      const recentSessions = sessions.slice(0, 5).map(session => ({
        id: session.id,
        date: new Date(session.created_at).toLocaleDateString(),
        accuracy: session.success_rate || 0,
        total_questions: session.total_questions || 0,
        timeouts: session.timeouts || 0,
        fastest_time: session.fastest_time,
        average_time: session.average_time
      }));

      // Calculate success trend (more optimized for many sessions)
      // Group by date to avoid duplicates
      const sessionsByDate = {};
      sessions.forEach(session => {
        const dateStr = new Date(session.created_at).toISOString().split('T')[0];
        if (!sessionsByDate[dateStr]) {
          sessionsByDate[dateStr] = [];
        }
        sessionsByDate[dateStr].push(session);
      });

      // Get last 30 days with data
      const dates = Object.keys(sessionsByDate).sort().slice(-30);
      
      const successTrend = dates.map(dateStr => {
        const sessionsOnDate = sessionsByDate[dateStr];
        const avgAccuracy = Math.round(
          sessionsOnDate.reduce((sum, s) => sum + (s.success_rate || 0), 0) / 
          sessionsOnDate.length
        );
        
        return {
          date: new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }),
          fullDate: dateStr,
          accuracy: avgAccuracy,
          sessionCount: sessionsOnDate.length
        };
      });

      // Create a complete calendar for the last 3 months
      const today = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      
      const activityCalendar = {};
      let currentDate = new Date(threeMonthsAgo);
      
      while (currentDate <= today) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const sessionsOnDate = sessionsByDate[dateStr] || [];
        
        const monthKey = currentDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (!activityCalendar[monthKey]) {
          activityCalendar[monthKey] = [];
        }
        
        activityCalendar[monthKey].push({
          date: new Date(dateStr),
          count: sessionsOnDate.length,
          avgAccuracy: sessionsOnDate.length ? 
            Math.round(sessionsOnDate.reduce((sum, s) => sum + (s.success_rate || 0), 0) / sessionsOnDate.length) : 
            null
        });
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log('Setting stats:', {
        totalSessions,
        avgSuccessRate,
        currentStreak: streak,
        successTrend,
        activityCalendar,
        recentSessions
      });

      setStats({
        totalSessions,
        avgSuccessRate,
        currentStreak: streak,
        successTrend,
        activityCalendar,
        recentSessions
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetails = async (sessionId) => {
    // Don't fetch if we already have the details
    if (sessionDetails[sessionId]) {
      setExpandedSession(expandedSession === sessionId ? null : sessionId);
      return;
    }

    try {
      setLoadingDetails(true);

      // Fetch session from database
      const { data: session, error: sessionError } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Fetch session answers (you'll need to create this table)
      const { data: answers, error: answersError } = await supabase
        .from('session_answers')
        .select(`
          id,
          noun_id,
          session_id,
          user_answer,
          is_correct,
          response_time,
          nouns (
            id,
            word,
            article,
            translation,
            rule
          )
        `)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (answersError) throw answersError;

      // Store session details
      setSessionDetails({
        ...sessionDetails,
        [sessionId]: {
          ...session,
          answers: answers || []
        }
      });
      
      // Toggle expansion
      setExpandedSession(expandedSession === sessionId ? null : sessionId);
    } catch (error) {
      console.error('Error fetching session details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleWordClick = async (word) => {
    try {
      // Fetch full word details
      const { data, error } = await supabase
        .from('nouns')
        .select('*')
        .eq('id', word.id)
        .single();
      
      if (error) throw error;
      setSelectedWord(data);
    } catch (error) {
      console.error('Error fetching word details:', error);
    }
  };

  const toggleSession = (sessionId) => {
    fetchSessionDetails(sessionId);
  };

  const refreshDashboard = () => {
    if (user?.id) {
      fetchDashboardData();
    }
  };

  return (
    <Layout>
      <div className="px-4 py-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">Track your German articles learning progress</p>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          </div>
        ) : stats.totalSessions === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Welcome to German Articles Practice!</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">Start your first practice session to begin tracking your progress.</p>
            <Link href="/practice" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              Begin Your First Session
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center">
                <span className="text-gray-500 text-sm">Total Sessions</span>
                <span className="text-4xl font-bold text-blue-600 mt-2">{stats.totalSessions}</span>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center">
                <span className="text-gray-500 text-sm">Average Accuracy</span>
                <span className="text-4xl font-bold text-blue-600 mt-2">{stats.avgSuccessRate}%</span>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center">
                <span className="text-gray-500 text-sm">Current Streak</span>
                <span className="text-4xl font-bold text-blue-600 mt-2">{stats.currentStreak} days</span>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Improved Accuracy Trend */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Accuracy Trend</h3>
                {stats.successTrend.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No trend data available</p>
                ) : (
                  <div className="space-y-4">
                    {stats.successTrend.slice(-7).map((day, i) => (
                      <div key={i} className="relative flex items-center">
                        <div className="w-28 flex-shrink-0">
                          <span className="text-sm text-gray-500">{day.date}</span>
                        </div>
                        <div className="flex-grow">
                          <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden relative">
                            <div 
                              className={`h-full absolute left-0 top-0 flex items-center ${
                                day.accuracy >= 80 ? 'bg-green-500' :
                                day.accuracy >= 60 ? 'bg-blue-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${day.accuracy}%` }}
                            >
                              <span className="text-xs text-white font-medium ml-2">
                                {day.accuracy}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-3 w-8 text-sm text-gray-800 font-semibold">
                          {day.sessionCount}×
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Activity Calendar - Monthly View */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Map</h3>
                {!stats.activityCalendar || Object.keys(stats.activityCalendar).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No activity data available</p>
                ) : (
                  <div className="space-y-6">
                    {Object.keys(stats.activityCalendar).slice(-1).map(month => (
                      <div key={month}>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{month}</h4>
                        <div className="grid grid-cols-7 gap-1">
                          {/* Day labels */}
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div key={`label-${i}`} className="text-xs text-center text-gray-400 mb-1">
                              {day}
                            </div>
                          ))}
                          
                          {/* Empty cells for alignment */}
                          {Array.from({length: new Date(stats.activityCalendar[month][0].date).getDay()}).map((_, i) => (
                            <div key={`empty-${i}`} className="w-full aspect-square"></div>
                          ))}
                          
                          {/* Activity cells */}
                          {stats.activityCalendar[month].map((day, i) => (
                            <div 
                              key={i} 
                              className="w-full aspect-square rounded-sm flex items-center justify-center relative"
                              style={{ 
                                backgroundColor: day.count === 0 
                                  ? '#f1f5f9' 
                                  : `rgba(59, 130, 246, ${Math.min(0.3 + (day.count * 0.15), 0.9)})`,
                                cursor: day.count > 0 ? 'pointer' : 'default'
                              }}
                              title={`${day.date.toLocaleDateString()}: ${day.count} sessions${
                                day.avgAccuracy ? `, ${day.avgAccuracy}% avg accuracy` : ''
                              }`}
                            >
                              <span className={`text-xs font-medium ${day.count > 2 ? 'text-white' : 'text-gray-700'}`}>
                                {day.date.getDate()}
                              </span>
                              
                              {day.count > 0 && (
                                <div className="absolute bottom-0.5 right-0.5 flex space-x-0.5">
                                  {Array.from({length: Math.min(day.count, 3)}).map((_, i) => (
                                    <div 
                                      key={i} 
                                      className="w-1 h-1 rounded-full bg-white opacity-80"
                                    ></div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {/* Legend */}
                    <div className="flex items-center justify-end space-x-3 pt-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-100 rounded-sm mr-1"></div>
                        <span className="text-xs text-gray-500">None</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-sm mr-1" style={{backgroundColor: 'rgba(59, 130, 246, 0.4)'}}></div>
                        <span className="text-xs text-gray-500">1-2</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-sm mr-1" style={{backgroundColor: 'rgba(59, 130, 246, 0.7)'}}></div>
                        <span className="text-xs text-gray-500">3-5</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-sm mr-1" style={{backgroundColor: 'rgba(59, 130, 246, 0.9)'}}></div>
                        <span className="text-xs text-gray-500">6+</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Session History */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Recent Sessions</h3>
                <Link href="/practice" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  Practice Now
                </Link>
              </div>
              
              <div className="space-y-4">
                {!stats.recentSessions || stats.recentSessions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent sessions to display</p>
                ) : (
                  stats.recentSessions.map((session, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg overflow-hidden">
                      <div 
                        onClick={() => toggleSession(session.id)}
                        className="cursor-pointer transition-colors hover:bg-gray-50"
                      >
                        <div className="p-4 flex items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                            session.accuracy >= 80 ? 'bg-green-100 text-green-600' :
                            session.accuracy >= 60 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                          }`}>
                            <span className="text-xl font-bold">{session.accuracy}%</span>
                          </div>
                          
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">{session.date}</p>
                            <p className="text-sm text-gray-500">
                              {session.total_questions} words • {session.average_time ? `${session.average_time.toFixed(1)}s avg` : 'No time data'}
                            </p>
                          </div>
                          
                          <div className="ml-4">
                            {expandedSession === session.id ? (
                              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded View - Only load content when expanded */}
                      {expandedSession === session.id && (
                        <div className="border-t border-gray-100 p-4 bg-gray-50">
                          {loadingDetails ? (
                            <div className="py-8 text-center">
                              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                            </div>
                          ) : sessionDetails[session.id]?.answers?.length > 0 ? (
                            <div>
                              <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm mb-4">
                                <table className="min-w-full divide-y divide-gray-200 bg-white">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Word</th>
                                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Your Answer</th>
                                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Correct</th>
                                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Time</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {sessionDetails[session.id].answers.map((answer, i) => (
                                      <tr key={i} onClick={() => handleWordClick(answer.nouns)}
                                          className={`cursor-pointer transition-colors hover:bg-gray-50 
                                            ${answer.is_correct ? 'bg-green-50' : 'bg-red-50'}`}
                                      >
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{answer.nouns.word}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                          {answer.user_answer || <span className="italic text-red-500">Timed out</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-green-600">{answer.nouns.article}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                          {answer.response_time ? `${answer.response_time.toFixed(1)}s` : '—'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
                                  <p className="text-xs font-medium text-gray-500">Accuracy</p>
                                  <p className="text-lg font-medium text-gray-900">{session.accuracy}%</p>
                                </div>
                                <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
                                  <p className="text-xs font-medium text-gray-500">Avg. Response</p>
                                  <p className="text-lg font-medium text-gray-900">
                                    {session.average_time ? `${session.average_time.toFixed(1)}s` : '—'}
                                  </p>
                                </div>
                                <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
                                  <p className="text-xs font-medium text-gray-500">Fastest</p>
                                  <p className="text-lg font-medium text-gray-900">
                                    {session.fastest_time ? `${session.fastest_time.toFixed(1)}s` : '—'}
                                  </p>
                                </div>
                                <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
                                  <p className="text-xs font-medium text-gray-500">Timeouts</p>
                                  <p className="text-lg font-medium text-gray-900">{session.timeouts || 0}</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 py-4">No detailed data available for this session.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Word details modal */}
      {selectedWord && (
        <WordDetailsModal 
          word={selectedWord} 
          onClose={() => setSelectedWord(null)} 
        />
      )}
    </Layout>
  );
}
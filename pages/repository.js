import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import supabase from '../lib/supabase';

export default function Repository() {
  // Mock user for testing without Clerk
  const mockUser = { id: 'test-user-id' };
  
  const [nouns, setNouns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArticle, setFilterArticle] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showPremium, setShowPremium] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchNouns();
    fetchCategories();
  }, [filterArticle, searchTerm, filterCategory, showPremium]);

  async function fetchNouns() {
    try {
      setLoading(true);
      console.log("Fetching nouns from Supabase...");
      
      // List all tables to find the correct one
      const { data: tablesList, error: tablesError } = await supabase
        .rpc('get_tables');
        
      console.log("Available tables:", tablesList);
      
      // Try with 'nouns' table first
      let query = supabase
        .from('nouns')  // Changed from 'german_nouns' to 'nouns'
        .select('*')
        .limit(5);  // Just get a few records to test
        
      let { data, error } = await query;
      
      if (error) {
        console.error("Error with 'nouns' table:", error);
        
        // Try with original table name as fallback
        query = supabase
          .from('german_nouns')
          .select('*')
          .limit(5);
          
        const result = await query;
        data = result.data;
        error = result.error;
        
        if (error) {
          console.error("Error with 'german_nouns' table:", error);
          throw error;
        }
      }
      
      console.log("Successfully connected! Sample data:", data);
      
      // Now fetch the actual filtered data with the correct table name
      const tableName = error ? 'german_nouns' : 'nouns';
      console.log(`Using table: ${tableName}`);
      
      query = supabase
        .from(tableName)
        .select('*')
        .order('word');
      
      // Apply filters as before
      if (filterArticle) {
        query = query.eq('article', filterArticle);
      }
      
      if (searchTerm) {
        query = query.ilike('word', `%${searchTerm}%`);
      }
      
      if (filterCategory) {
        query = query.eq('category', filterCategory);
      }
      
      // For "showPremium" filter, we need to check if the column exists
      if (!showPremium && data.length > 0 && 'is_premium' in data[0]) {
        query = query.eq('is_premium', false);
      }
      
      const { data: filteredData, error: filteredError } = await query;
      
      if (filteredError) {
        console.error("Query error:", filteredError);
        throw filteredError;
      }
      
      console.log("Fetched data:", filteredData);
      
      // Add empty user_progress to match expected structure
      const nounsWithProgress = filteredData ? filteredData.map(noun => ({
        ...noun,
        user_progress: []
      })) : [];
      
      setNouns(nounsWithProgress);
    } catch (error) {
      console.error('Error fetching nouns:', error);
      alert(`Error connecting to database: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('german_nouns')
        .select('category')
        .not('category', 'is', null)
        .order('category');
        
      if (error) throw error;
      
      // Get unique categories
      const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];
      setCategories(uniqueCategories);
      console.log("Available categories:", uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  // Calculate accuracy for a noun
  const calculateAccuracy = (noun) => {
    if (!noun.user_progress || noun.user_progress.length === 0) {
      return null;
    }
    
    const progress = noun.user_progress[0];
    const total = progress.correct_attempts + progress.incorrect_attempts;
    
    if (total === 0) return null;
    
    return Math.round((progress.correct_attempts / total) * 100);
  };

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">German Noun Repository</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search Box */}
              <div className="w-full md:w-1/3">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search words..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Article Filter */}
              <div className="w-full md:w-auto">
                <label htmlFor="filter" className="sr-only">Filter by article</label>
                <select
                  id="filter"
                  name="filter"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filterArticle}
                  onChange={(e) => setFilterArticle(e.target.value)}
                >
                  <option value="">All articles</option>
                  <option value="der">der</option>
                  <option value="die">die</option>
                  <option value="das">das</option>
                </select>
              </div>
              
              {/* Category Filter */}
              <div className="w-full md:w-auto">
                <label htmlFor="category" className="sr-only">Filter by category</label>
                <select
                  id="category"
                  name="category"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">All categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Show Premium Filter */}
              <div className="w-full md:w-auto">
                <label htmlFor="showPremium" className="sr-only">Show only premium words</label>
                <select
                  id="showPremium"
                  name="showPremium"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={showPremium ? 'true' : 'false'}
                  onChange={(e) => setShowPremium(e.target.value === 'true')}
                >
                  <option value="true">Show only premium words</option>
                  <option value="false">Show all words</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Nouns Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-500">Loading words...</p>
            </div>
          ) : nouns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No nouns found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Article
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Noun
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Translation
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Example
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rule
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {nouns.map((noun) => (
                    <tr key={noun.id} className="hover:bg-gray-50">
                      {/* Article */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          noun.article === 'der' ? 'bg-blue-100 text-blue-800' :
                          noun.article === 'die' ? 'bg-pink-100 text-pink-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {noun.article}
                        </span>
                      </td>

                      {/* Noun */}
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {noun.word}
                        </div>
                      </td>

                      {/* Translation */}
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-500">
                          {noun.translation || '—'}
                        </div>
                      </td>

                      {/* Example */}
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-500">
                          {noun.example ? (
                            <div>
                              <p className="font-medium text-gray-900">{noun.example}</p>
                              {noun.example_translation && (
                                <p className="text-xs text-gray-500 mt-1">{noun.example_translation}</p>
                              )}
                            </div>
                          ) : '—'}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        {noun.category ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {noun.category}
                          </span>
                        ) : '—'}
                      </td>

                      {/* Rule */}
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-500">
                          {noun.rule ? (
                            <div className="group relative">
                              <button className="text-blue-600 hover:text-blue-800">
                                View Rule
                              </button>
                              <div className="hidden group-hover:block absolute z-10 w-96 p-4 bg-white rounded-lg shadow-lg border border-gray-200 left-full top-0 ml-2">
                                {/* Arrow pointer on the left side */}
                                <div className="absolute top-3 -left-2 w-3 h-3 bg-white border-l border-b border-gray-200 transform rotate-45"></div>
                                
                                {/* Content */}
                                <div className="relative">
                                  <p className="text-sm text-gray-700 whitespace-normal break-words">{noun.rule}</p>
                                  {noun.explanation && (
                                    <>
                                      <div className="my-2 border-t border-gray-200"></div>
                                      <p className="text-xs text-gray-600 whitespace-normal break-words">{noun.explanation}</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : '—'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 
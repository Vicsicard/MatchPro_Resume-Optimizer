import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';

export default function AuthTest() {
  const [testResults, setTestResults] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const addTestResult = (test, result, error = null) => {
    setTestResults(prev => [...prev, {
      test,
      result,
      error,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTests = async () => {
    setLoading(true);
    setError(null);
    setTestResults([]);

    try {
      // Test 1: Connection and Table Existence
      addTestResult('Testing Supabase Connection', 'Starting...');
      const { data: users, error: selectError } = await supabase
        .from('auth_users')
        .select('email')
        .limit(1);

      if (selectError) throw selectError;
      addTestResult('Supabase Connection', 'Success! Connected to database');
      addTestResult('Found Users', `Retrieved ${users.length} users`);
      console.log('Users:', users);

      // Test 2: Table Structure
      const { data: tableInfo, error: structureError } = await supabase
        .from('auth_users')
        .select('id, email, password, created_at, last_login')
        .limit(1);

      if (structureError) throw structureError;
      addTestResult('Table Structure', 'Success! Table structure is correct');
      console.log('Table structure:', tableInfo);

      // Test 3: Try to create a test user
      const testEmail = `test${Date.now()}@example.com`;
      const { data: newUser, error: insertError } = await supabase
        .from('auth_users')
        .insert([
          {
            email: testEmail,
            password: 'test123' // In production, this would be hashed
          }
        ])
        .select();

      if (insertError) throw insertError;
      addTestResult('Create User', `Success! Created test user: ${testEmail}`);
      console.log('Created user:', newUser);

      // Test 4: Try to fetch the created user
      const { data: fetchedUser, error: fetchError } = await supabase
        .from('auth_users')
        .select('*')
        .eq('email', testEmail)
        .single();

      if (fetchError) throw fetchError;
      addTestResult('Fetch User', 'Success! Retrieved created user');
      console.log('Fetched user:', fetchedUser);

    } catch (err) {
      console.error('Test error:', err);
      setError(err.message);
      addTestResult('Error Occurred', err.message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Auth System Test</h2>
        <button
          onClick={runTests}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run Tests Again'}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              result.error
                ? 'bg-red-50 border-red-300'
                : 'bg-green-50 border-green-300'
            }`}
          >
            <div className="flex justify-between">
              <strong>{result.test}</strong>
              <span className="text-sm text-gray-500">{result.timestamp}</span>
            </div>
            <p className={result.error ? 'text-red-600' : 'text-green-600'}>
              {result.result}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

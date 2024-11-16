import React, { useState, useEffect } from 'react';
import { baseResumeService } from '../../services/baseResumeService';
import { supabase } from '../../config/supabaseClient';

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [testResult, setTestResult] = useState('');
  const [error, setError] = useState(null);

  // Test Supabase connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('user_base_resumes').select('count').single();
      if (error) throw error;
      setConnectionStatus('Connected successfully to Supabase!');
    } catch (err) {
      setConnectionStatus(`Connection error: ${err.message}`);
    }
  };

  // Test resume creation
  const testResumeCreation = async () => {
    try {
      setTestResult('Testing resume creation...');
      
      const testResume = {
        userId: 'test-user-id',
        resumeName: 'Test Resume',
        resumeContent: 'This is a test resume content',
        fileType: 'text'
      };

      const result = await baseResumeService.uploadBaseResume(
        testResume.userId,
        testResume.resumeName,
        testResume.resumeContent,
        testResume.fileType
      );

      setTestResult('Resume created successfully! ID: ' + result.id);
      
      // Clean up test data
      await baseResumeService.deleteBaseResume(result.id, testResume.userId);
      setTestResult(prev => prev + '\nTest data cleaned up successfully!');
    } catch (err) {
      setError(`Test failed: ${err.message}`);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Supabase Connection Test</h2>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>Connection Status:</h3>
        <p style={{ color: connectionStatus.includes('error') ? 'red' : 'green' }}>
          {connectionStatus}
        </p>
      </div>

      <button 
        onClick={testResumeCreation}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3ECF8E',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Resume Creation
      </button>

      {testResult && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>Test Result:</h3>
          <pre>{testResult}</pre>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #f00', color: 'red' }}>
          <h3>Error:</h3>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
};

export default SupabaseTest;

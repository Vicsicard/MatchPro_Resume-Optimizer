import React from 'react';

const EnvTest = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Environment Variables Test</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Supabase Configuration</h3>
          <p>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Not set'}</p>
          <p>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</p>
          
          <div className="mt-2 text-sm text-gray-600">
            <p>URL Length: {import.meta.env.VITE_SUPABASE_URL?.length || 0}</p>
            <p>Key Length: {import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvTest;

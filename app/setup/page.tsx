'use client';

import { useState } from 'react';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const setupAdmin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Admin user created! You can now login.');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="card-glow p-8 text-center max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Setup Admin</h1>
        <p className="text-gray-300 mb-6">
          Click to create admin user with credentials:
          <br />
          <strong>Email:</strong> tiwariadarsh1804@gmail.com
          <br />
          <strong>Password:</strong> Adarsh0704##
        </p>
        
        <button
          onClick={setupAdmin}
          disabled={loading}
          className="btn-glow disabled:opacity-50 mb-4"
        >
          {loading ? 'Creating Admin...' : 'Setup Admin User'}
        </button>
        
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('created') 
              ? 'bg-green-900/30 text-green-300 border border-green-400/30'
              : 'bg-red-900/30 text-red-300 border border-red-400/30'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Change the logic below to validate
    console.log('Email:', email);
    console.log('Password:', password);
  
    navigate('/home');
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-100">
      <header className="w-full bg-blue-500 text-white py-4 text-left text-2xl">
        <text className="ml-4">CertATheon</text>
      </header>
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-sm mx-auto p-6 border border-gray-300 rounded-lg shadow-md bg-white mt-6">
          <h2 className="text-center text-2xl mb-6">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const url = 'http://localhost:5282';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Concatenate the `url` variable with the endpoint
      const response = await axios.post(`${url}/api/Auth/login`, {
        email,
        password,
      });

      if (response.status === 200) {
        if (response.data.mustChangePassword) {
          navigate('/changepassword'); // Redirect to change password page
        } else {
          navigate('/home'); // Redirect to home page
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-100">
      <header className="w-full bg-blue-500 text-white py-4 text-left text-2xl">
        <text className="ml-4">CertATheon</text>
      </header>
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-sm mx-auto p-6 border border-gray-300 rounded-lg shadow-md bg-white mt-6">
          <h2 className="text-center text-2xl mb-6">Login</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
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
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-500 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
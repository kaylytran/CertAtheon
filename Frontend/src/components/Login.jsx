import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
<<<<<<< HEAD
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const url = 'http://localhost:5282';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Clear existing data first
            localStorage.clear();

            const response = await axios.post(`${url}/api/Auth/login`, {
                email: email,
                password: password
            });

            // Extract data directly from response (no nested data)
            const userData = response.data;

            // Store token for authorization
            localStorage.setItem('token', userData.token);

            // Set the authorization header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;

            // Store user info
            localStorage.setItem('firstName', userData.firstName);
            localStorage.setItem('lastName', userData.lastName);
            localStorage.setItem('email', userData.email);
            localStorage.setItem('userRole', userData.appRole);
            localStorage.setItem('isLoggedIn', 'true');

            // Store the entire response for reference
            localStorage.setItem('authResponse', JSON.stringify(userData));

            // Check user role and navigate accordingly
            if (userData.appRole !== 'Employee') {
                navigate('/admin');
            } else if (userData.mustChangePassword) {
                navigate('/changepassword');
            } else {
                navigate('/home');
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Invalid email or password.');
            } else {
                setError('An error occurred. Please try again later.');
            }
            console.error("Login error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col bg-gray-100">
            <header className="w-full bg-blue-500 text-white py-4 text-left text-2xl">
                <span className="ml-4">CertATheon</span>
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
                        <button
                            type="submit"
                            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
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
=======
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
>>>>>>> 009b9306121086374f9edf64a6c8c57c401b9217
        </div>
    );
};

export default Login;
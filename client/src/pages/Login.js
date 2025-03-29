import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Username dan password harus diisi');
      return;
    }
    
    try {
      console.log('Attempting login with:', { username }); // Debug info
      setIsLoading(true);
      
      const result = await login(username, password);
      console.log('Login result:', result); // Debug info
      
      // Periksa token setelah login
      const token = localStorage.getItem('token');
      console.log('Token stored:', token ? 'Yes' : 'No'); // Debug info
      
      // Log user data
      const userData = localStorage.getItem('currentUser');
      console.log('User data stored:', userData); // Debug info
      
      // Redirect ke dashboard
      console.log('Redirecting to dashboard...'); // Debug info
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error); // Debug info
      toast.error(error.response?.data?.message || 'Login gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
            <span className="text-3xl font-bold">K</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">Kenzie Gaming</h1>
          <p className="mt-2 text-gray-400">Sistem Rental PlayStation</p>
        </div>
        
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-white">Login</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-400 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
                placeholder="Masukkan username"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-400 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
                placeholder="Masukkan password"
                required
              />
            </div>
            
            {error && (
              <div className="mb-4 text-red-500 text-sm">{error}</div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium ${
                isLoading
                  ? "bg-blue-800 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Memproses..." : "Login"}
            </button>
          </form>
        </div>
        
        <div className="mt-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Kenzie Gaming. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
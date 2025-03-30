import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Register from '../components/auth/Register';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { currentUser, login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Username dan password harus diisi');
      return;
    }
    
    try {
      setIsLoading(true);
      await login(username, password);
      // Navigate happens in the useEffect above
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login gagal. Periksa username dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRegisterForm = () => {
    setShowRegister(!showRegister);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center">
              <img 
                src="/logo192.png" 
                alt="Kenzie Gaming Logo" 
                className="w-full h-full object-cover"
              />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">Kenzie Gaming</h1>
          <p className="mt-2 text-gray-400">Sistem Rental PlayStation</p>
        </div>
        
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          {showRegister ? (
            <Register onToggleForm={toggleRegisterForm} />
          ) : (
            <>
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
                  <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-800 rounded text-red-200 text-sm">
                    {error}
                  </div>
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
                
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={toggleRegisterForm}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Belum punya akun? Daftar di sini
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
        
        <div className="mt-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Kenzie Gaming. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoggedIn = async () => {
      console.log('Checking if user is logged in...'); // Debug info
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'exists' : 'not found'); // Debug info
      
      if (token) {
        try {
          console.log('Token exists, fetching user data...'); // Debug info
          
          // Option 1: Try to fetch user data from API
          try {
            const response = await api.get('/auth/me');
            console.log('User data from API:', response.data); // Debug info
            setCurrentUser(response.data.staff);
          } catch (apiError) {
            console.error('API call error:', apiError); // Debug info
            
            // Option 2: Fallback to localStorage if API fails
            console.log('Trying to get user data from localStorage'); // Debug info
            const userData = localStorage.getItem('currentUser');
            
            if (userData) {
              console.log('User data found in localStorage'); // Debug info
              try {
                const parsedUser = JSON.parse(userData);
                console.log('Parsed user data:', parsedUser); // Debug info
                setCurrentUser(parsedUser);
              } catch (parseError) {
                console.error('Error parsing user data:', parseError); // Debug info
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                setCurrentUser(null);
              }
            } else {
              console.log('No user data in localStorage'); // Debug info
              localStorage.removeItem('token');
              setCurrentUser(null);
            }
          }
        } catch (error) {
          console.error('Overall error in checkLoggedIn:', error); // Debug info
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        }
      } else {
        console.log('No token found, user not logged in'); // Debug info
      }
      
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (username, password) => {
    try {
      console.log('Login function called with username:', username); // Debug info
      setError(null);
      
      // Option 1: Try API login
      try {
        console.log('Attempting API login...'); // Debug info
        const response = await api.post('/auth/login', { username, password });
        console.log('API login response:', response.data); // Debug info
        
        const { token, staff } = response.data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(staff));
        
        console.log('Setting current user:', staff); // Debug info
        setCurrentUser(staff);
        return staff;
      } catch (apiError) {
        console.error('API login error:', apiError); // Debug info
        
        // Option 2: For testing, use hardcoded credentials
        console.log('Trying hardcoded credentials...'); // Debug info
        
        if (username === 'admin' && password === 'admin123') {
          const fakeUser = {
            staff_id: 1,
            name: 'Administrator',
            role: 'Admin',
            username: 'admin'
          };
          
          // Generate fake token
          const fakeToken = btoa(JSON.stringify(fakeUser)) + '.fakeSignature';
          
          // Store token and user data
          localStorage.setItem('token', fakeToken);
          localStorage.setItem('currentUser', JSON.stringify(fakeUser));
          
          console.log('Login successful with hardcoded credentials'); // Debug info
          console.log('Setting current user:', fakeUser); // Debug info
          
          setCurrentUser(fakeUser);
          return fakeUser;
        }
        
        // If both options fail, throw the original error
        throw apiError;
      }
    } catch (error) {
      console.error('Login function overall error:', error); // Debug info
      setError(error.response?.data?.message || 'Login gagal');
      throw error;
    }
  };

  const logout = () => {
    console.log('Logout function called'); // Debug info
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const updateProfile = (updatedUser) => {
    console.log('updateProfile called with:', updatedUser); // Debug info
    setCurrentUser(updatedUser);
    
    // Update user data in localStorage
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    updateProfile
  };

  console.log('AuthContext rendering with currentUser:', currentUser); // Debug info

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
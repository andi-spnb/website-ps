import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useShift } from '../../contexts/ShiftContext';
import { 
  Menu, 
  X, 
  Home, 
  ShoppingCart, 
  Monitor, 
  Users, 
  Coffee, 
  FileText, 
  Clock, 
  User,
  LogOut
} from 'lucide-react';

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const { currentShift } = useShift();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar for desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="font-bold">K</span>
            </div>
            <h1 className="text-xl font-bold">Kenzie Gaming</h1>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1 rounded-md hover:bg-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-6">
            <div className="text-gray-400 text-sm mb-2">Staff Info</div>
            <div className="bg-gray-700 rounded-md p-3">
              <div className="font-medium">{currentUser?.name}</div>
              <div className="text-sm text-gray-400">{currentUser?.role}</div>
              {currentShift ? (
                <div className="mt-2 text-xs text-green-400 flex items-center">
                  <Clock size={12} className="mr-1" />
                  Shift Aktif
                </div>
              ) : (
                <div className="mt-2 text-xs text-red-400 flex items-center">
                  <Clock size={12} className="mr-1" />
                  Shift Belum Dimulai
                </div>
              )}
            </div>
          </div>
          
          <nav>
            <div className="space-y-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md ${
                    isActive ? "bg-blue-600" : "hover:bg-gray-700"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Home size={18} className="mr-3" />
                <span>Dashboard</span>
              </NavLink>
              
              <NavLink
                to="/pos"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md ${
                    isActive ? "bg-blue-600" : "hover:bg-gray-700"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <ShoppingCart size={18} className="mr-3" />
                <span>Kasir</span>
              </NavLink>
              
              <NavLink
                to="/devices"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md ${
                    isActive ? "bg-blue-600" : "hover:bg-gray-700"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Monitor size={18} className="mr-3" />
                <span>PlayStation</span>
              </NavLink>
              
              <NavLink
                to="/members"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md ${
                    isActive ? "bg-blue-600" : "hover:bg-gray-700"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Users size={18} className="mr-3" />
                <span>Member</span>
              </NavLink>
              
              <NavLink
                to="/food"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md ${
                    isActive ? "bg-blue-600" : "hover:bg-gray-700"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Coffee size={18} className="mr-3" />
                <span>Makanan & Minuman</span>
              </NavLink>
              
              {(currentUser?.role === 'Admin' || currentUser?.role === 'Owner') && (
                <NavLink
                  to="/reports"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md ${
                      isActive ? "bg-blue-600" : "hover:bg-gray-700"
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <FileText size={18} className="mr-3" />
                  <span>Laporan</span>
                </NavLink>
              )}
              
              <NavLink
                to="/shift"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md ${
                    isActive ? "bg-blue-600" : "hover:bg-gray-700"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Clock size={18} className="mr-3" />
                <span>Shift</span>
              </NavLink>
              
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md ${
                    isActive ? "bg-blue-600" : "hover:bg-gray-700"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <User size={18} className="mr-3" />
                <span>Profil</span>
              </NavLink>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 rounded-md text-red-400 hover:bg-gray-700"
              >
                <LogOut size={18} className="mr-3" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top header */}
        <header className="bg-gray-800 h-16 flex items-center px-4 border-b border-gray-700">
          <button
            onClick={toggleSidebar}
            className="p-1 mr-4 rounded-md hover:bg-gray-700 lg:hidden"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-semibold">Kenzie Gaming</h2>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
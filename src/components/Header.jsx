import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  LogOut,
  Globe,
  Bell,
  ShoppingCart
} from 'lucide-react';

// Props now include cart to display the item count
const Header = ({ cart = [] }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Calculate total items in cart
  const cartItemCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  // Handle clicks outside of the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    // Add event listener if dropdown is shown
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex-1 flex items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-600 leading-tight">Vendor-Buddy</h1>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Only show user menu if logged in */}
          {user && (
            <>
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Globe className="h-4 w-4" />
                {language === 'en' ? 'English' : 'हिंदी'}
              </button>

              {/* Notifications */}
              {user?.role === 'SUPPLIER' && (
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <Bell className="h-5 w-5" />
                </button>
              )}

              {/* Cart */}
              <button
                onClick={() => navigate('/cart')}
                className="relative p-2 group"
              >
                <ShoppingCart className="h-5 w-5 text-gray-900 group-hover:text-primary-600 transition-colors" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* User menu */}
              <div className="relative flex items-center gap-x-4" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-900 focus:outline-none"
                >
                  <User className="h-5 w-5" />
                  {user?.name || user?.email || 'Account'}
                </button>
                {user?.role && (
                  <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                )}
                {/* Dropdown menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-10 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      {user?.role === 'SUPPLIER' && (
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            navigate('/dashboard');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          My Dashboard
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate('/orders');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Order History
                      </button>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserIcon,
  LightBulbIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { AppContext } from '../context/AppContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AppContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: HomeIcon,
      path: '/dashboard',
    },
    {
      name: 'Profile',
      icon: UserIcon,
      path: '/profile',
    },
    {
      name: 'Sleep Tips',
      icon: LightBulbIcon,
      path: '/sleep-tips',
    },
    {
      name: 'Help & Support',
      icon: QuestionMarkCircleIcon,
      path: '/help',
    },
  ];

  const NavItem = ({ item }) => (
    <button
      onClick={() => navigate(item.path)}
      className={`w-full flex items-center ${
        isCollapsed ? 'justify-center' : 'justify-start gap-3'
      } px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-300 group relative
        ${
          location.pathname === item.path
            ? 'bg-gradient-to-r from-blue-500/20 to-blue-400/10 text-blue-400 border-l-4 border-blue-500'
            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white border-l-4 border-transparent'
        }`}
    >
      <div
        className={`flex items-center justify-center rounded-lg transition-all duration-300 group-hover:bg-blue-500/10
          ${location.pathname === item.path ? 'bg-blue-500/20' : ''}
          w-9 h-9 sm:w-10 sm:h-10
        `}
      >
        <item.icon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110" />
      </div>

      {!isCollapsed && (
        <span className="font-medium text-xs sm:text-sm truncate">{item.name}</span>
      )}
    </button>
  );

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 bg-gray-900/95 border-r border-gray-800/50 backdrop-blur-xl transition-all duration-300 ease-in-out z-30
        flex flex-col
        ${isCollapsed ? 'w-16 sm:w-20' : 'w-52 sm:w-64'}
      `}
    >
      {/* Logo Section */}
      <div className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 border-b border-gray-800/50">
        {!isCollapsed && (
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 font-semibold text-sm">S</span>
            </div>
            <span className="text-white font-medium text-sm sm:text-base whitespace-nowrap">
              SOMNiA
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors flex-shrink-0"
        >
          {isCollapsed ? (
            <ChevronDoubleRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <ChevronDoubleLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] py-3 sm:py-4 overflow-y-auto">
        <div className="flex-1 space-y-1 px-1.5 sm:px-2">
          {navigationItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>

        {/* Logout Button */}
        <div className="px-1.5 sm:px-2 pb-3 sm:pb-4">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-start gap-3'
            } px-3 sm:px-4 py-2.5 sm:py-3 
              text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-300 
              group relative border-l-4 border-transparent hover:border-red-500`}
          >
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg transition-all duration-300 group-hover:bg-red-500/10">
              <ArrowRightOnRectangleIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110" />
            </div>

            {!isCollapsed && (
              <span className="font-medium text-xs sm:text-sm">Logout</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

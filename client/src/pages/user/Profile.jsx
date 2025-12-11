import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import {
  UserCircleIcon,
  DevicePhoneMobileIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '../../components/sidebar.jsx';

// Frontend-only age calculator
const calculateAge = (birthdate) => {
  if (!birthdate) return null;

  const birth = new Date(birthdate);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const Profile = () => {
  const { userData } = useContext(AppContext);

  const SettingItem = ({
    icon: Icon,
    title,
    description,
    action,
    type = 'link',
    to,
  }) => (
    <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-xl hover:bg-gray-900/50 transition-colors group">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <p className="text-white">{title}</p>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      {type === 'toggle' ? (
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" defaultChecked />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      ) : to ? (
        <Link
          to={to}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <span className="text-sm">{action}</span>
        </Link>
      ) : (
        <button className="text-gray-400 hover:text-white transition-colors">
          <span className="text-sm">{action}</span>
        </button>
      )}
    </div>
  );

  // While user data is loading
  if (!userData) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Loading profile...
        </div>
      </div>
    );
  }

  const isVerified =
    userData?.isAccountVerified ||
    userData?.isVerified ||
    userData?.emailVerified;

  const age = calculateAge(userData?.birthdate);
  const gender = userData?.gender || 'Not set';

  return (
    <div className="min-h-screen bg-[#0A1628] flex">
      {/* Sidebar (fixed / overlay) */}
      <Sidebar />

      {/* Main content – add left padding so it never hides under sidebar */}
      <div
        className="
          flex-1 relative
          pl-20 pr-3          /* mobile: leave room for sidebar */
          sm:pl-24 sm:pr-6    /* tablet */
          lg:pl-55 lg:pr-12   /* desktop */
          py-4 sm:py-8
          overflow-y-auto
        "
      >
        {/* Background gradients */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-6xl w-full mx-auto space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-light text-white">
              Profile Settings
            </h1>
          </div>

          {/* Profile Card */}
          <div className="bg-gray-900/50 rounded-2xl p-5 sm:p-6 lg:p-8 border border-gray-800/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Avatar + name */}
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <UserCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl sm:text-2xl text-white font-light">
                      {userData.name}
                    </h2>

                    {isVerified ? (
                      <span className="px-3 py-1 bg-emerald-500/15 text-emerald-400 text-xs rounded-lg border border-emerald-500/40">
                        Verified
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-lg border border-gray-500/30">
                        Not Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-gray-400">
                    Manage your personal information and account security.
                  </p>
                </div>
              </div>

              {/* Verify button (top-right on larger screens, stacked on mobile) */}
              {!isVerified && (
                <div className="md:self-start">
                  <Link
                    to="/verify-email"
                    className="inline-flex items-center justify-center px-4 sm:px-5 py-1.5 bg-blue-500/20 text-blue-400 text-xs sm:text-sm rounded-lg border border-blue-500/40 hover:bg-blue-500/30 hover:border-blue-400/60 transition-all duration-200 font-medium"
                  >
                    Verify Email
                  </Link>
                </div>
              )}
            </div>

            {/* Info grid: Email / Age / Gender */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Email */}
              <div className="bg-gray-900/60 rounded-xl border border-gray-800/60 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                  Email
                </p>
                <p className="text-sm text-gray-100 break-all">
                  {userData.email}
                </p>
              </div>

              {/* Age */}
              <div className="bg-gray-900/60 rounded-xl border border-gray-800/60 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                  Age
                </p>
                <p className="text-sm text-gray-100">
                  {age !== null ? `${age} years` : '—'}
                </p>
              </div>

              {/* Gender */}
              <div className="bg-gray-900/60 rounded-xl border border-gray-800/60 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                  Gender
                </p>
                <p className="text-sm text-gray-100">{gender}</p>
              </div>
            </div>
          </div>

          {/* Account Settings Card */}
          <div className="bg-gray-900/50 rounded-2xl p-5 sm:p-6 lg:p-8 border border-gray-800/50">
            <h3 className="text-lg sm:text-xl text-white font-light mb-4">
              Account Settings
            </h3>
            <div className="space-y-4">
              <SettingItem
                icon={KeyIcon}
                title="Change Password"
                description="Update your account password"
                action="Change >"
                to="/reset-password"
              />
              {/*
              <SettingItem
                icon={DevicePhoneMobileIcon}
                title="Connected Devices"
                description="Manage your connected devices"
                action="Manage >"
              />
              */}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;

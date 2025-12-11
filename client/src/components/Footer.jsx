import React from 'react';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const Footer = () => {
  return (
    <footer className="bg-gray-900/40 backdrop-blur-xl border-t border-gray-800/50 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-10 sm:mb-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-md"
          >
            <h3 className="text-2xl font-light text-white mb-4 sm:mb-6">
              SOMNiA
            </h3>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Transform your sleep with AI-powered analysis and personalized
              insights. Experience better rest through advanced sleep monitoring
              and pattern recognition.
            </p>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:pl-2 lg:pl-8"
          >
            <h4 className="text-lg font-light text-white mb-4 sm:mb-6">
              Resources
            </h4>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <a
                  href="#"
                  className="group flex items-center space-x-3 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <DocumentTextIcon className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                  <span>Documentation</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="group flex items-center space-x-3 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <QuestionMarkCircleIcon className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                  <span>FAQ</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="group flex items-center space-x-3 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <UserGroupIcon className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                  <span>Community</span>
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Legal & Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:pl-2 lg:pl-8"
          >
            <h4 className="text-lg font-light text-white mb-4 sm:mb-6">
              Legal & Support
            </h4>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Terms of Service
                </a>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <EnvelopeIcon className="w-5 h-5 text-blue-400" />
                <span>support@somnia.com</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-gray-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0 text-center md:text-left">
            <p className="text-gray-400 text-xs sm:text-sm">
              © {new Date().getFullYear()} SOMNiA. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-6 gap-y-2">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm"
              >
                About Us
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm"
              >
                Contact
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm"
              >
                Blog
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

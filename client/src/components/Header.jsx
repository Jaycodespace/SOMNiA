import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import background from '../assets/background.jpeg';
import logo from '../assets/SOMNiA_LOGO.png';

const Header = () => {
  const { userData } = useContext(AppContext);

  return (
    <div
      className="w-full min-h-[70vh] sm:min-h-screen bg-cover bg-center flex items-center justify-center px-4 sm:px-6 md:px-8 py-16 text-white"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div
        className="w-full max-w-xl sm:max-w-2xl bg-blue-950 bg-opacity-100 rounded-2xl sm:rounded-3xl text-center p-6 sm:p-8 md:p-10"
        style={{
          backgroundColor: 'rgba(15, 32, 78, 0.8)',
          boxShadow: '0 0 25px 5px rgba(255, 255, 255, 0.6)',
        }}
      >
        <img
          src={logo}
          alt="Somnia Logo"
          className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))',
          }}
        />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          Welcome to SOMNIA
          {userData?.name ? `, ${userData.name}` : ', Developer!'}
        </h1>
        <p className="mt-3 sm:mt-4 text-sm sm:text-lg font-light leading-relaxed">
          SOMNiA: An AI-driven system for predicting the probability of having
          insomnia.
        </p>
      </div>
    </div>
  );
};

export default Header;

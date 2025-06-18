import React from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../background.webp';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };
  
  return (
    <div
      className="h-screen w-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-black/30 p-8 text-center shadow-lg backdrop-blur-lg">
        <h1 className="mt-8 text-4xl font-bold text-white md:text-5xl">
          Welcome to <span className="text-cyan-400">GlycoSight AI</span>
        </h1>
        <p className="mt-5 text-lg text-gray-200">
          Unlock insights into your health.
        </p>
        <p className="mt-8 text-lg text-gray-200">
          Your AI for preliminary Type-2 Diabetes risk assessment using medical files.
        </p>
        <button
          onClick={handleGetStarted} // Added onClick handler
          className="mt-8 mb-5 rounded-full bg-cyan-600 px-8 py-3 font-bold text-white transition-colors duration-300 hover:bg-cyan-700"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
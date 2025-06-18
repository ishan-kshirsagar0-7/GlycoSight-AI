import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import backgroundImage from '../background.webp';
import logo from '../assets/logo.png';

// Google Icon component remains the same
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.522-3.441-11.127-8.161l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.244,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Sign up successful! Please check your email to verify your account.");
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if(error) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex flex-col items-center p-4"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <header className="w-full max-w-5xl p-4 flex items-center">
        <img src={logo} alt="GlycoSight AI Logo" className="w-8 h-8" />
        <h1 className="ml-3 text-2xl font-bold text-white">GlycoSight AI</h1>
      </header>
      
      <main className="flex-grow flex items-center justify-center w-full">
        <div className="w-full max-w-md rounded-2xl border border-white/20 bg-gray-900/40 p-8 shadow-lg backdrop-blur-lg">
          <h2 className="text-3xl font-bold text-center text-cyan-400 mb-6">
            {isSignUp ? 'Sign Up' : 'Log In'}
          </h2>
          <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full p-3 rounded-md bg-gray-800/50 border border-gray-700 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full p-3 rounded-md bg-gray-800/50 border border-gray-700 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  placeholder="********"
                />
              </div>
              {isSignUp && (
                <div>
                  <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="mt-1 w-full p-3 rounded-md bg-gray-800/50 border border-gray-700 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    placeholder="********"
                  />
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-full bg-cyan-600 p-3 font-bold text-white transition-colors duration-300 hover:bg-cyan-700 disabled:bg-gray-500"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-4">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-cyan-400 hover:underline ml-1">
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-600"/>
            <span className="mx-4 text-xs font-medium text-gray-500">OR</span>
            <hr className="flex-grow border-gray-600"/>
          </div>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center rounded-full bg-gray-700 p-3 font-bold text-white transition-colors duration-300 hover:bg-gray-600 disabled:bg-gray-500"
          >
            <GoogleIcon />
            Sign in with Google
          </button>
        </div>
      </main>
    </div>
  );
};

export default Auth;
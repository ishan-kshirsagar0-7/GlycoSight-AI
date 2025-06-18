import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';
import logo from '../assets/logo.png';
import darkBackground from '../assets/dark_background.webp';
import defaultPfp from '../assets/defaultpfp.svg';
import Uploader from './Uploader';
import ResultsView from './ResultsView';

const Dashboard: React.FC = () => {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [apiIsLoading, setApiIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(defaultPfp);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setAvatarSrc(session?.user?.user_metadata?.avatar_url || defaultPfp);

    const userId = session?.user?.id;
    if (userId) {
      try {
        const { data, error } = await supabase
          .from('user_health_profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        setUserProfile(data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    }
    setLoadingProfile(false);
  };

  useEffect(() => {
    fetchProfile();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDiagnose = async (file: File) => {
    setApiIsLoading(true);

    const getFileExtension = (fileName: string) => fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
    const extension = getFileExtension(file.name);
    let inputType = '';
    if (['pdf'].includes(extension)) inputType = 'pdf';
    else if (['png', 'jpg', 'jpeg'].includes(extension)) inputType = 'image';
    else if (['dcm'].includes(extension)) inputType = 'dicom';

    const loadingMessages = [
      `File identified as - ${inputType.toUpperCase()}`,
      "Taking a thorough look at your file's contents...",
      "Extracting crucial parameters from your data...",
      "Analyzing your data by referring to our corpus...",
      "Diagnosing your condition...",
      "Almost there..."
    ];
    let messageIndex = 0;
    setLoadingMessage(loadingMessages[messageIndex]);
    
    const interval = setInterval(() => {
      messageIndex++;
      if (messageIndex < loadingMessages.length) {
        setLoadingMessage(loadingMessages[messageIndex]);
      } else {
        clearInterval(interval);
      }
    }, 12000);

    const userId = session?.user?.id;
    if (!userId) {
      alert("Authentication error. Please log in again.");
      setApiIsLoading(false);
      clearInterval(interval);
      return;
    }

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('input_type', inputType);
    formData.append('file', file);

    try {
      const response = await fetch('https://glycosightapi.vercel.app/diagnose', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || 'API Error');
      await fetchProfile();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setApiIsLoading(false);
      clearInterval(interval);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex flex-col items-center p-4 text-white"
      style={{ backgroundImage: `url(${darkBackground})` }}
    >
      <header className="w-full max-w-6xl p-4 flex items-center justify-between">
        <div className="flex items-center">
          <img src={logo} alt="GlycoSight AI Logo" className="w-8 h-8" />
          <h1 className="ml-3 text-2xl font-bold text-white">GlycoSight AI</h1>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-1 rounded-full bg-gray-800/50 hover:bg-gray-700/70 transition-colors flex items-center justify-center"
          >
            <img 
              src={avatarSrc}
              alt="User Avatar" 
              className="w-8 h-8 rounded-full" 
              onError={() => setAvatarSrc(defaultPfp)}
            />
          </button>
          {isDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50"
            >
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/50">
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center w-full">
        {apiIsLoading ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 border-4 border-t-transparent border-cyan-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
          </div>
        ) : loadingProfile ? (
          <div className="w-10 h-10 border-4 border-t-transparent border-cyan-500 rounded-full animate-spin"></div>
        ) : userProfile ? (
          <ResultsView profileData={userProfile} onReDiagnose={handleDiagnose} isLoading={apiIsLoading} />
        ) : (
          <Uploader onDiagnose={handleDiagnose} isLoading={apiIsLoading} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
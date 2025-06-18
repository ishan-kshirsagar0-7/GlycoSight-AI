import React, { useState } from 'react';
import { FiHelpCircle, FiInfo, FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Modal from './ui/Modal';
import Uploader from './Uploader';

interface ResultsViewProps {
  profileData: any;
  onReDiagnose: (file: File) => void;
  isLoading: boolean;
}

const alertMap: { [key: string]: { text: string; ledColor: string; cardColor: string } } = {
  red: { text: 'Diabetic', ledColor: 'bg-red-500 shadow-[0_0_15px_5px_rgba(239,68,68,0.6)]', cardColor: 'bg-red-900/20' },
  yellow: { text: 'Prediabetic', ledColor: 'bg-yellow-400 shadow-[0_0_15px_5px_rgba(250,204,21,0.6)]', cardColor: 'bg-yellow-800/20' },
  green: { text: 'Non-Diabetic', ledColor: 'bg-green-500 shadow-[0_0_15px_5px_rgba(34,197,94,0.6)]', cardColor: 'bg-green-900/20' },
};

const urlMap: { [key: string]: string } = {
  ADA: "https://ia600704.us.archive.org/21/items/glyco_rag/ADA.pdf",
  vRAG: "https://ia800704.us.archive.org/21/items/glyco_rag/VisualRAG.pdf",
};

const ResultsView: React.FC<ResultsViewProps> = ({ profileData, onReDiagnose, isLoading }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isJustificationModalOpen, setJustificationModalOpen] = useState(false);
  const [isBibModalOpen, setBibModalOpen] = useState(false);
  const [isReUploadModalOpen, setReUploadModalOpen] = useState(false);

  const response = profileData?.latest_diagnostic_response;
  if (!response) return <div className="text-white">Error: No diagnostic response found in profile.</div>;

  const analysisItems = response.analysis || [];
  const citations = response.citations || [];
  const alertInfo = alertMap[response.alert_color] || { text: 'Unknown', ledColor: 'bg-gray-500', cardColor: 'bg-gray-800/20' };

  const handleCitationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setBibModalOpen(true);
  };

  const parseAndLinkCitations = (text: string) => {
    return text.split(/(\[\d+\])/g).map((part, index) => {
      if (part.match(/\[(\d+)\]/)) {
        return (
          <button
            key={index}
            onClick={handleCitationClick}
            className="font-bold text-cyan-400 hover:underline"
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };
  
  const handleReDiagnose = (file: File) => {
    onReDiagnose(file);
    setReUploadModalOpen(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        <div className="md:col-span-1 row-span-2 rounded-2xl border border-white/20 bg-gray-900/40 p-6 shadow-lg backdrop-blur-lg flex flex-col items-center justify-between">
            <div className="w-full flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">Confidence</h3>
              <button onClick={() => setJustificationModalOpen(true)}>
                <FiHelpCircle className="text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>
            <div className="relative w-16 h-48 bg-gray-800/50 rounded-full my-4 overflow-hidden">
                <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-yellow-400 via-cyan-400 to-purple-500"
                    style={{ height: `${response.confidence_score.score}%`}}
                ></div>
            </div>
            <p className="text-3xl font-bold text-white">{response.confidence_score.score}%</p>
        </div>

        <div className="md:col-span-2 rounded-2xl border border-white/20 bg-gray-900/40 p-6 shadow-lg backdrop-blur-lg">
            <h3 className="font-bold text-white text-lg mb-2">Patient Summary</h3>
            <p className="text-gray-300">{response.summary}</p>
        </div>
        
        <div className="md:col-span-2 rounded-2xl border border-white/20 bg-gray-900/40 p-6 shadow-lg backdrop-blur-lg flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="font-bold text-white text-lg">Technical Analysis</h3>
                <div className="flex items-center space-x-4">
                    <button onClick={() => setBibModalOpen(true)} className="flex items-center text-gray-400 hover:text-white transition-colors">
                      <FiInfo className="mr-1" /> Citations
                    </button>
                    <span className="text-gray-400 text-sm">{currentSlide + 1} of {analysisItems.length || 1}</span>
                    <div className="flex space-x-2">
                        <button onClick={() => setCurrentSlide(s => Math.max(0, s - 1))} disabled={currentSlide === 0} className="disabled:opacity-50"><FiChevronLeft /></button>
                        <button onClick={() => setCurrentSlide(s => Math.min(analysisItems.length - 1, s + 1))} disabled={currentSlide >= analysisItems.length - 1} className="disabled:opacity-50"><FiChevronRight /></button>
                    </div>
                </div>
            </div>
            <div className="relative overflow-hidden h-full min-h-[8rem]">
              {analysisItems.length > 0 ? analysisItems.map((item: any, index: number) => (
                  <div key={index} 
                       className="absolute w-full h-full transition-opacity duration-500 ease-in-out flex" 
                       style={{ opacity: index === currentSlide ? 1 : 0, zIndex: index === currentSlide ? 10 : 1 }}>
                      <div className="w-1.5 bg-blue-500 rounded-full mr-4 shrink-0"></div>
                      <div className="overflow-y-auto w-full">
                          <h4 className="font-bold text-blue-400">{item.parameter_name}</h4>
                          <p className="text-gray-300 mt-1">{parseAndLinkCitations(item.analysis_text)}</p>
                      </div>
                  </div>
              )) : (<p className="text-gray-500">No detailed analysis provided.</p>)}
            </div>
        </div>

        <div className="md:col-span-2 rounded-2xl border border-white/20 bg-gray-900/40 p-6 shadow-lg backdrop-blur-lg">
            <h3 className="font-bold text-white text-lg mb-2">Final Diagnosis*</h3>
            <p className="text-gray-300">{response.final_diagnosis}</p>
        </div>

        <div className={`md:col-span-1 rounded-2xl border border-white/20 p-6 shadow-lg backdrop-blur-lg flex flex-col items-center justify-center ${alertInfo.cardColor}`}>
            <h3 className="font-bold text-white text-lg mb-4">System Alert</h3>
            <div className="relative w-20 h-20">
                <div className={`absolute inset-0 rounded-full ${alertInfo.ledColor}`}></div>
                <div className="absolute inset-1.5 rounded-full bg-gradient-to-b from-white/80 to-transparent"></div>
            </div>
            <p className="mt-4 text-2xl font-bold text-white">{alertInfo.text}</p>
        </div>
      </div>
      <p className="text-center text-xs text-gray-500 mt-6 w-full max-w-6xl">*This is a preliminary diagnosis based on the provided data and should be confirmed by a healthcare professional.</p>
    
      <button 
        onClick={() => setReUploadModalOpen(true)}
        className="fixed bottom-8 right-8 bg-cyan-600 rounded-full p-4 text-white shadow-lg hover:bg-cyan-700 transition-colors z-40">
          <FiPlus size={24}/>
      </button>

      <Modal isOpen={isJustificationModalOpen} onClose={() => setJustificationModalOpen(false)} title="Confidence Justification">
        <p className="text-gray-300">{response.confidence_score.justification}</p>
      </Modal>

      <Modal isOpen={isBibModalOpen} onClose={() => setBibModalOpen(false)} title="Bibliography">
        <ul className="space-y-2 text-gray-300">
          {citations.length > 0 ? citations.map((c: any) => (
            <li key={c.id}>
              <span className="font-bold mr-2">[{c.id}]</span>
              <a href={urlMap[c.url]} target="_blank" rel="noopener noreferrer" className="hover:underline text-cyan-400">
                {c.reference}
              </a>
            </li>
          )) : (<li>No citations provided.</li>)}
        </ul>
      </Modal>

      <Modal isOpen={isReUploadModalOpen} onClose={() => setReUploadModalOpen(false)} title="Upload New File">
        <div className="mt-4">
          <Uploader onDiagnose={handleReDiagnose} isLoading={isLoading} />
        </div>
      </Modal>
    </div>
  );
};

export default ResultsView;
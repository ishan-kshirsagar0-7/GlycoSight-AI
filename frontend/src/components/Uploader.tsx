import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud } from 'react-icons/fi';

interface UploaderProps {
  onDiagnose: (file: File) => void;
  isLoading: boolean;
}

const Uploader: React.FC<UploaderProps> = ({ onDiagnose, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections && fileRejections.length > 0) {
      setError(fileRejections[0].errors[0].message);
      setFile(null);
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      setError(null);
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/dicom': ['.dcm'],
    },
    multiple: false,
    maxSize: 4.5 * 1024 * 1024,
  });

  const handleDiagnoseClick = () => {
    if (file) {
      onDiagnose(file);
    }
  };

  return (
    <div className="w-full max-w-4xl rounded-2xl border border-white/20 bg-gray-900/40 p-8 shadow-lg backdrop-blur-lg text-center">
      <h2 className="text-3xl font-bold text-cyan-400 mb-4">AI Diagnosis</h2>
      <p className="text-gray-300 max-w-xl mx-auto">
        Provide your scans, medical records or blood reports – any data that can help us determine if you have Type-2 Diabetes.
      </p>

      <div
        {...getRootProps()}
        className={`mt-8 mx-auto w-full max-w-lg p-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${
          isDragActive ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-600 hover:border-cyan-600'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-gray-400">
          <FiUploadCloud className="w-16 h-16 mb-4" />
          {file ? (
            <p className="font-semibold text-white">{file.name}</p>
          ) : (
            <>
              <p className="font-semibold text-white">Drag & Drop or Click to Upload</p>
              <p className="text-sm mt-1">Only one file at a time</p>
              <p className="text-xs mt-4 text-gray-500">(Supported: .pdf, .png, .jpg, .jpeg, .dcm | Max Size: 4.5MB)</p>
            </>
          )}
        </div>
      </div>
      
      {error && <p className="mt-4 text-red-500">{error}</p>}

      <div className="mt-8 h-12">
        {file && !isLoading && (
          <button
            onClick={handleDiagnoseClick}
            className="rounded-full bg-gradient-to-r from-red-500 to-red-700 px-10 py-3 font-bold text-white shadow-lg backdrop-blur-md border border-red-400/50 hover:from-red-600 hover:to-red-800 transition-all duration-300"
          >
            Diagnose
          </button>
        )}
        {!file && !isLoading && (
           <p className="text-gray-500">Upload a file to get started with the AI Diagnosis.</p>
        )}
      </div>
    </div>
  );
};

export default Uploader;
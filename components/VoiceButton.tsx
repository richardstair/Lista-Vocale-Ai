
import React from 'react';

interface VoiceButtonProps {
  isListening: boolean;
  onClick: () => void;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ isListening, onClick }) => {
  const buttonClasses = isListening
    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
    : 'bg-teal-500 hover:bg-teal-600 text-white';

  return (
    <button
      onClick={onClick}
      className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 focus:ring-teal-300 ${buttonClasses}`}
      aria-label={isListening ? 'Ferma registrazione' : 'Inizia registrazione'}
    >
      <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'} text-3xl`}></i>
    </button>
  );
};

export default VoiceButton;

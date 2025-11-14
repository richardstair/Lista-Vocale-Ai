
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingListData, Suggestion, AppState } from './types';
import { generateShoppingList } from './services/geminiService';
import VoiceButton from './components/VoiceButton';
import ShoppingList from './components/ShoppingList';
import Suggestions from './components/Suggestions';
import { LoadingSpinner } from './components/icons/LoadingSpinner';
import { LogoIcon } from './components/icons/LogoIcon';

// FIX: Add type definitions for the Web Speech API to fix TypeScript errors.
// These types are not included in standard DOM typings.
interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: { transcript: string };
}
interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}
declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [transcript, setTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [listData, setListData] = useState<ShoppingListData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Riconoscimento vocale non supportato in questo browser.');
      setAppState(AppState.ERROR);
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'it-IT';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(interimTranscript);
      if(final){
        setFinalTranscript(prev => prev + final);
      }
    };

    recognition.onend = () => {
      if (appState === AppState.LISTENING) {
         setAppState(AppState.PROCESSING);
      }
    };
    
    recognition.onerror = (event) => {
        setError(`Errore di riconoscimento vocale: ${event.error}`);
        setAppState(AppState.ERROR);
    };

    recognitionRef.current = recognition;
  }, [appState]);

  useEffect(() => {
      if (appState === AppState.PROCESSING && finalTranscript) {
          processTranscript();
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState, finalTranscript]);

  const processTranscript = async () => {
    try {
      const result = await generateShoppingList(finalTranscript);
      setListData(result);
      setAppState(AppState.RESULT);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Impossibile generare la lista. Per favore riprova.');
      setAppState(AppState.ERROR);
    }
  };

  const toggleListen = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (appState === AppState.LISTENING) {
      recognition.stop();
      setAppState(AppState.PROCESSING);
    } else {
      setListData(null);
      setError(null);
      setTranscript('');
      setFinalTranscript('');
      recognition.start();
      setAppState(AppState.LISTENING);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setListData(null);
    setError(null);
    setTranscript('');
    setFinalTranscript('');
    if(recognitionRef.current && appState === AppState.LISTENING) {
        recognitionRef.current.stop();
    }
  }

  const renderContent = () => {
    switch (appState) {
      case AppState.LISTENING:
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-semibold text-slate-700 mb-4">In ascolto...</h2>
            <p className="text-slate-500 h-24">{transcript || 'Parla ora...'}</p>
          </div>
        );
      case AppState.PROCESSING:
        return (
          <div className="text-center p-8 flex flex-col items-center justify-center">
            <LoadingSpinner />
            <h2 className="text-2xl font-semibold text-slate-700 mt-4">Elaborazione...</h2>
            <p className="text-slate-500 mt-2">Sto creando la tua lista della spesa intelligente!</p>
          </div>
        );
      case AppState.RESULT:
        if (!listData) return null;
        return (
          <div className="space-y-8 p-4 md:p-6">
            <ShoppingList categories={listData.shoppingList} />
            <Suggestions title="Ricette Suggerite" items={listData.recipeSuggestions} type="recipe" />
            <Suggestions title="Potresti aver dimenticato" items={listData.forgottenItemSuggestions} type="item" />
          </div>
        );
      case AppState.ERROR:
        return (
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-2xl font-semibold text-red-700 mb-2">Oops! Qualcosa è andato storto.</h2>
            <p className="text-red-600">{error}</p>
          </div>
        );
      case AppState.IDLE:
      default:
        return (
          <div className="text-center p-8 flex flex-col items-center">
            <LogoIcon className="w-24 h-24 text-teal-500 mb-4" />
            <h1 className="text-3xl font-bold text-slate-800">Benvenuto su Lista Vocale AI</h1>
            <p className="text-slate-600 mt-2">Premi il microfono per iniziare a dettare la tua lista della spesa.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LogoIcon className="w-8 h-8 text-teal-500"/>
            <h1 className="text-2xl font-bold text-slate-800">Lista Vocale AI</h1>
          </div>
          {(appState === AppState.RESULT || appState === AppState.ERROR) && (
             <button onClick={handleReset} className="text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors">Crea Nuova Lista</button>
          )}
        </div>
      </header>
      
      <main className="flex-grow container mx-auto max-w-2xl w-full flex flex-col justify-center items-center p-4">
        {renderContent()}
      </main>
      
      <footer className="sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 border-t border-slate-200">
        <div className="container mx-auto flex justify-center">
          <VoiceButton isListening={appState === AppState.LISTENING} onClick={toggleListen} />
        </div>
      </footer>
    </div>
  );
};

export default App;
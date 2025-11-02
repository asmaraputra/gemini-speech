import React, { useState, useCallback, useMemo } from 'react';
import { VOICES } from './constants';
import { Voice, VoiceStyle } from './types';
import { generateSpeech } from './services/geminiService';
import { decode, decodeAudioData, createWavBlob } from './utils/audioUtils';

interface AppError {
  title: string;
  message: string;
}

const Header: React.FC = () => (
  <header className="text-center mb-8">
    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-500">
      Gemini Text-to-Speech
    </h1>
    <p className="text-slate-400 mt-2">
      Bring your text to life. Indonesian supported!
    </p>
  </header>
);

const SpinnerIcon: React.FC = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const PlayIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DownloadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);


const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<string>(VOICES[0].value);
  const [selectedStyle, setSelectedStyle] = useState<string>(VOICES[0].styles[0].value);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const currentVoiceStyles = useMemo(() => {
    return VOICES.find(v => v.value === selectedVoice)?.styles || [];
  }, [selectedVoice]);

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVoiceValue = e.target.value;
    setSelectedVoice(newVoiceValue);
    const newVoice = VOICES.find(v => v.value === newVoiceValue);
    if (newVoice && newVoice.styles.length > 0) {
      setSelectedStyle(newVoice.styles[0].value);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!text.trim()) {
      setError({
        title: 'Input Required',
        message: 'Please enter some text to generate speech.',
      });
      return;
    }
    setIsLoading(true);
    setError(null);
    setAudioData(null);
    try {
      const prompt = selectedStyle ? `${selectedStyle}${text}` : text;
      const data = await generateSpeech(prompt, selectedVoice);
      setAudioData(data);
    } catch (err) {
      setError({
        title: 'Generation Failed',
        message: err instanceof Error ? err.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [text, selectedVoice, selectedStyle]);

  const playAudio = useCallback(async () => {
    if (!audioData || isPlaying) return;

    setIsPlaying(true);
    setError(null);
    try {
      // @ts-ignore
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      const decodedData = decode(audioData);
      const audioBuffer = await decodeAudioData(decodedData, audioContext, 24000, 1);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      
      source.onended = () => {
        setIsPlaying(false);
        audioContext.close();
      };
    } catch (err) {
      console.error("Error playing audio:", err);
      setError({
        title: 'Playback Error',
        message: 'Could not play audio. The data may be invalid or your browser does not support the required audio features.',
      });
      setIsPlaying(false);
    }
  }, [audioData, isPlaying]);

  const handleDownload = useCallback(() => {
    if (!audioData) return;
    setError(null);
    try {
      const pcmData = decode(audioData);
      const wavBlob = createWavBlob(pcmData, 24000, 1);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'gemini-speech.wav';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error("Error creating download:", err);
      setError({
        title: 'Download Error',
        message: 'Could not create the download file. Please try generating the speech again.',
      });
    }
  }, [audioData]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <Header />
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-2xl space-y-6 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="voice-selector" className="block text-sm font-medium text-slate-300 mb-2">
                Select a Voice
              </label>
              <select
                id="voice-selector"
                value={selectedVoice}
                onChange={handleVoiceChange}
                className="w-full bg-slate-700 border-slate-600 text-white rounded-md px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              >
                {VOICES.map((voice: Voice) => (
                  <option key={voice.value} value={voice.value}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
               <label htmlFor="style-selector" className="block text-sm font-medium text-slate-300 mb-2">
                Select a Style
              </label>
              <select
                id="style-selector"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full bg-slate-700 border-slate-600 text-white rounded-md px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              >
                {currentVoiceStyles.map((style: VoiceStyle) => (
                  <option key={style.name} value={style.value}>
                    {style.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="text-input" className="block text-sm font-medium text-slate-300 mb-2">
              Enter Text
            </label>
            <textarea
              id="text-input"
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ketik teks di sini... (e.g., 'Halo, selamat datang di Indonesia!')"
              className="w-full bg-slate-700 border-slate-600 text-white rounded-md p-3 focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
            <p className="text-right text-xs text-slate-500 mt-1">
              {text.length} characters
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !text.trim()}
              className="w-full flex-grow justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition duration-150 ease-in-out flex"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon />
                  Generating...
                </>
              ) : 'Generate Speech'}
            </button>
            {audioData && (
              <>
                <button
                  onClick={playAudio}
                  disabled={isPlaying}
                  className="w-full sm:w-auto flex-shrink-0 flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-emerald-500 to-lime-600 hover:from-emerald-600 hover:to-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-emerald-500 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                >
                  <PlayIcon />
                  {isPlaying ? 'Playing...' : 'Play Audio'}
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full sm:w-auto flex-shrink-0 flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-500 transition duration-150 ease-in-out"
                >
                  <DownloadIcon />
                  Download
                </button>
              </>
            )}
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-md text-sm">
              <p><strong>{error.title}:</strong> {error.message}</p>
            </div>
          )}
        </div>
        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Powered by Google Gemini. For demonstration purposes only.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;

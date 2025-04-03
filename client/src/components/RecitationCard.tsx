import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { HelpCircle, RefreshCcw, Play, Sparkles } from "lucide-react";
import GurmukthiText from "./GurmukthiText";
import AudioControlButtons from "./AudioControlButtons";
import AudioWaveform from "./AudioWaveform";
import { useRecitation } from "../hooks/useRecitation";
import { useSettings } from "../context/SettingsContext";
import { useAudioRecording } from "../context/AudioRecordingContext";
import { useEffect, useState } from "react";

export default function RecitationCard() {
  const [isTestingProgress, setIsTestingProgress] = useState(false);
  
  const { 
    recitationState, 
    progressPercentage,
    restartRecitation,
    processRecognizedText
  } = useRecitation();
  
  const { 
    openHelp 
  } = useSettings();
  
  const {
    recordedText,
    isRecording,
    isPlaying,
    setRecordedText
  } = useAudioRecording();
  
  // Listen for the custom audio playback event
  useEffect(() => {
    const handlePlaybackStarted = (event: any) => {
      const { recordedText } = event.detail;
      if (recordedText) {
        console.log("🎵 Custom event: audio-playback-started with text:", 
          recordedText.substring(0, 50) + "...");
        processRecognizedText(recordedText);
      }
    };
    
    window.addEventListener('audio-playback-started', handlePlaybackStarted);
    
    return () => {
      window.removeEventListener('audio-playback-started', handlePlaybackStarted);
    };
  }, [processRecognizedText]);
  
  // Handle highlighting during playback and audio state changes
  useEffect(() => {
    if (isPlaying && recordedText) {
      console.log("🎵 Playing back with text:", recordedText);
      // When playback starts, process recorded text to highlight words
      processRecognizedText(recordedText);
    }
  }, [isPlaying, recordedText, processRecognizedText]);
  
  // Make sure we process text even when it changes during recording
  useEffect(() => {
    if (recordedText && (isRecording || isPlaying)) {
      console.log("🎵 Text updated during recording/playback, processing text:", 
        recordedText.substring(0, 50) + "...");
      processRecognizedText(recordedText);
    }
  }, [recordedText, isRecording, isPlaying, processRecognizedText]);
  
  // Force text processing when the component mounts
  useEffect(() => {
    console.log("🎵 Component mounted - initializing with test text for visual feedback");
    
    // Wait a moment to make sure recitation state is initialized first
    const timeout = setTimeout(() => {
      if (recitationState.paras.length === 0) {
        console.log("🎵 No recitation state found, using direct approach");
        
        // Process a test string to show visual highlighting
        const testText = "ੴ ਸਤਿ ਨਾਮੁ";
        processRecognizedText(testText);
        
        // Create a demo feedback item for users to see
        testProgress();
      } else {
        console.log("🎵 Recitation state already initialized:", 
          recitationState.paras.length, "paragraphs with", 
          recitationState.paras.reduce((sum, p) => sum + p.words.length, 0), "words total");
      }
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, [recitationState.paras.length]);
  
  // For demonstration and test purposes
  const testProgress = () => {
    console.log("🧪 Testing progress update and highlighting");
    
    // Reset recitation first
    restartRecitation();
    
    // Sample text for testing
    const sampleTexts = [
      "ੴ ਸਤਿ ਨਾਮੁ",
      "ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ",
      "ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ",
      "ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ"
    ];
    
    // Process each sample text with delay
    sampleTexts.forEach((text, index) => {
      setTimeout(() => {
        processRecognizedText(text);
      }, index * 2500);
    });
    
    // Reset after test
    restartRecitation();
    
    // Process each word with a delay to simulate real-time highlighting
    const testWords = [
      "ੴ", "ਸਤਿ", "ਨਾਮੁ", "ਕਰਤਾ", "ਪੁਰਖੁ", "ਨਿਰਭਉ", 
      "ਨਿਰਵੈਰੁ", "ਅਕਾਲ", "ਮੂਰਤਿ", "ਅਜੂਨੀ", "ਸੈਭੰ", "ਗੁਰ", "ਪ੍ਰਸਾਦਿ"
    ];
    
    // First process a couple words together to initialize
    const initialText = testWords.slice(0, 3).join(" ");
    processRecognizedText(initialText);
    setRecordedText(initialText);
    
    // Then process more words with a delay between them
    let currentIndex = 3;
    const processNextWord = () => {
      if (currentIndex < testWords.length) {
        const currentText = testWords.slice(0, currentIndex + 1).join(" ");
        processRecognizedText(currentText);
        setRecordedText(currentText);
        
        currentIndex++;
        setTimeout(processNextWord, 800); // Speed of highlighting
      }
    };
    
    // Start the sequential processing
    setTimeout(processNextWord, 500);
  };

  return (
    <Card className="bg-white rounded-xl shadow-md p-6 mb-6 flex-grow flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recitation</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={openHelp}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={restartRecitation}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
          >
            <RefreshCcw className="h-5 w-5" />
          </Button>
          {/* Test button for progress */}
          <Button
            variant={isTestingProgress ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setIsTestingProgress(true);
              testProgress();
              // Reset testing state after animation completes
              setTimeout(() => setIsTestingProgress(false), 11000);
            }}
            className="text-xs flex items-center gap-1"
            disabled={isTestingProgress}
          >
            {isTestingProgress ? (
              <>
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Testing...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                Test Progress
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-slate-500 mb-1">
          <span>Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Audio Control Buttons - Centered below progress bar */}
      <AudioControlButtons />
      
      {/* Gurmukhi Text Display */}
      <div className="my-6 flex-grow overflow-y-auto">
        <GurmukthiText recitationState={recitationState} />
      </div>
      
      {/* Audio Waveform */}
      <div className="mt-auto">
        <AudioWaveform />
      </div>
    </Card>
  );
}

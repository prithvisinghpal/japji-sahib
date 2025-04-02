import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from '@/lib/utils';

// Sources of reference audio
const AUDIO_SOURCES = [
  {
    id: 'source1',
    name: 'Bhai Harjinder Singh',
    url: 'https://old.sgpc.net/CDN/audio/JAPJI%20SAHIB.mp3',
    type: 'audio/mp3'
  },
  {
    id: 'source2',
    name: 'Bhai Jarnail Singh',
    url: 'https://www.gurmatveechar.com//audios/Katha/01_Puratan_Katha/Sant_Gurbachan_Singh_%28Bhindran_wale%29/Japji_Sahib/Japji_Sahib_01.mp3',
    type: 'audio/mp3'
  },
  {
    id: 'source3',
    name: 'Classical Style',
    url: 'https://www.sikhnet.com/files/sohila/track1.mp3',
    type: 'audio/mp3'
  }
];

export default function ReferenceAudioPlayer() {
  const [currentAudioSource, setCurrentAudioSource] = useState(AUDIO_SOURCES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add effect to initialize audio element
  useEffect(() => {
    console.log("🎧 Audio component mounted, initializing audio");
    
    // Make sure the audio element is set up properly
    if (audioRef.current) {
      audioRef.current.volume = volume;
      
      // Add error handling
      const handleError = (e: any) => {
        console.error("🎧 Audio error:", e);
        setIsLoading(false);
        setIsPlaying(false);
        alert("There was an error with the audio source. Please try a different audio source.");
      };
      
      audioRef.current.addEventListener('error', handleError);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('error', handleError);
        }
      };
    }
  }, []);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Handle play/pause toggle
  const togglePlayPause = async () => {
    if (!audioRef.current) return;
    
    try {
      console.log("🎧 Toggle play/pause clicked");
      
      if (isPlaying) {
        console.log("🎧 Pausing audio");
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        console.log("🎧 Playing audio");
        // Force reload the audio element before playing
        audioRef.current.load();
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("🎧 Error toggling audio playback:", error);
      alert("There was an error playing the audio. Please try a different source or refresh the page.");
    }
  };
  
  // Handle audio source change
  const changeAudioSource = (sourceId: string) => {
    const newSource = AUDIO_SOURCES.find(source => source.id === sourceId);
    if (!newSource) return;
    
    setCurrentAudioSource(newSource);
    setIsLoading(true);
    setCurrentTime(0);
    
    // Reset playback when changing source
    if (isPlaying) {
      setIsPlaying(false);
    }
  };
  
  // Handle time update
  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    
    setCurrentTime(audioRef.current.currentTime);
  };
  
  // Handle seeking
  const onSeek = (newValue: number[]) => {
    if (!audioRef.current) return;
    
    const newTime = newValue[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  // Handle volume change
  const onVolumeChange = (newValue: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = newValue[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };
  
  // Handle mute toggle
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };
  
  // Handle metadata loaded (when audio is ready)
  const onLoadedMetadata = () => {
    if (!audioRef.current) return;
    
    setDuration(audioRef.current.duration);
    setIsLoading(false);
  };
  
  // Handle audio ended
  const onEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };
  
  // Format time for display (mm:ss)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Handle skip forward
  const skipForward = () => {
    if (!audioRef.current) return;
    
    const newTime = Math.min(audioRef.current.currentTime + 10, duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  // Handle skip backward
  const skipBackward = () => {
    if (!audioRef.current) return;
    
    const newTime = Math.max(audioRef.current.currentTime - 10, 0);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-medium mb-2">Reference Audio</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Listen to authentic recitations to improve your pronunciation
      </p>
      
      {/* Audio Source Selection */}
      <div className="mb-4">
        <label htmlFor="audio-source" className="block text-sm font-medium mb-1">
          Select Recitation Style:
        </label>
        <select 
          id="audio-source"
          value={currentAudioSource.id}
          onChange={(e) => changeAudioSource(e.target.value)}
          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
          disabled={isPlaying}
        >
          {AUDIO_SOURCES.map(source => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Audio Element */}
      <audio 
        ref={audioRef}
        src={currentAudioSource.url}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        preload="metadata"
      />
      
      {/* Playback Controls */}
      <div className="flex items-center justify-between mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={skipBackward}
          disabled={isLoading}
        >
          <SkipBack size={18} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-10 w-10 rounded-full",
            isPlaying ? "bg-primary text-primary-foreground" : ""
          )}
          onClick={togglePlayPause}
          disabled={isLoading}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={skipForward}
          disabled={isLoading}
        >
          <SkipForward size={18} />
        </Button>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{formatTime(currentTime)}</span>
          <span>{isLoading ? "--:--" : formatTime(duration)}</span>
        </div>
        <Slider
          disabled={isLoading}
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={1}
          onValueChange={onSeek}
        />
      </div>
      
      {/* Volume Control */}
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleMute}
          className="mr-2"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={onVolumeChange}
          className="w-24"
        />
      </div>
      
      {isLoading && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Loading audio...
        </div>
      )}
    </div>
  );
}
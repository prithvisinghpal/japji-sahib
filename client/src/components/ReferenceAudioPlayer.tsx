import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from '@/lib/utils';

// Sources of reference audio
const AUDIO_SOURCES = [
  {
    id: 'source1',
    name: 'Soothing Male Voice',
    url: 'https://www.sikhnet.com/files/JapjiSahib.mp3',
    type: 'audio/mp3'
  },
  {
    id: 'source2',
    name: 'Classical Style',
    url: 'https://www.sikhnet.com/files/Japji%20Sahib%20-%20Bhai%20Tarlochan%20Singh%20Ji%20Ragi%20Singhs%20on%20SikhNet.mp3',
    type: 'audio/mp3'
  },
  {
    id: 'source3',
    name: 'Harmonium Accompaniment',
    url: 'https://www.sikhnet.com/files/Japji%20sahib%20-%20Bhai%20Davinder%20Singh%20Sodhi%20on%20SikhNet.mp3',
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Handle play/pause toggle
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
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
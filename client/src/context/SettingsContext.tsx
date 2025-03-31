import React, { createContext, useContext, useState } from "react";

// Define the settings type
type Settings = {
  micSensitivity: "low" | "medium" | "high";
  noiseReduction: boolean;
  fontSize: "small" | "medium" | "large";
  darkMode: boolean;
  strictnessLevel: "relaxed" | "standard" | "strict";
  realtimeFeedback: boolean;
  debugMode: boolean;
};

// Define the context type
type SettingsContextType = {
  settings: Settings;
  isSettingsOpen: boolean;
  isHelpOpen: boolean;
  updateSettings: (update: Partial<Settings>) => void;
  resetSettings: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openHelp: () => void;
  closeHelp: () => void;
};

// Default settings
const defaultSettings: Settings = {
  micSensitivity: "medium",
  noiseReduction: true,
  fontSize: "medium",
  darkMode: false,
  strictnessLevel: "standard",
  realtimeFeedback: true,
  debugMode: false
};

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const updateSettings = (update: Partial<Settings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...update
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const openHelp = () => {
    setIsHelpOpen(true);
  };

  const closeHelp = () => {
    setIsHelpOpen(false);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isSettingsOpen,
        isHelpOpen,
        updateSettings,
        resetSettings,
        openSettings,
        closeSettings,
        openHelp,
        closeHelp
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// Hook for using the settings context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

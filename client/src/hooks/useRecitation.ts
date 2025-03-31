import { useState, useEffect } from "react";
import { compareText } from "../lib/textComparison";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

// Define a sample text as a fallback
const FALLBACK_TEXT = `ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥
॥ ਜਪੁ ॥ 
ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ ॥
ਹੈ ਭੀ ਸਚੁ ਨਾਨਕ ਹੋਸੀ ਭੀ ਸਚੁ ॥੧॥`;

export enum WordStatus {
  PENDING = "pending",
  CURRENT = "current",
  CORRECT = "correct",
  ERROR = "error"
}

export type Word = {
  text: string;
  status: WordStatus;
};

export type Para = {
  words: Word[];
};

export type RecitationState = {
  paras: Para[];
  currentPosition: {
    paraIndex: number;
    wordIndex: number;
  };
};

export type FeedbackItem = {
  type: 'error' | 'warning';
  title: string;
  description: string;
};

export function useRecitation() {
  // Fetch the reference text from the server
  const { data: referenceText } = useQuery({
    queryKey: ['/api/japji-sahib/text'],
    refetchOnWindowFocus: false,
  });

  // Initialize state
  const [recitationState, setRecitationState] = useState<RecitationState>({
    paras: [],
    currentPosition: {
      paraIndex: 0,
      wordIndex: 0,
    },
  });

  const [progressPercentage, setProgressPercentage] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);

  // Initialize with reference text
  useEffect(() => {
    // Use server-provided text if available, otherwise use fallback
    const textToUse = (referenceText as string) || FALLBACK_TEXT;
    initializeRecitationState(textToUse);
  }, [referenceText]);

  function initializeRecitationState(text: string) {
    const paras = text.split("\n").map(paraText => {
      return {
        words: paraText.split(" ").map(word => ({
          text: word,
          status: WordStatus.PENDING
        }))
      };
    });

    // Set the first word as current
    if (paras.length > 0 && paras[0].words.length > 0) {
      paras[0].words[0].status = WordStatus.CURRENT;
    }

    setRecitationState({
      paras,
      currentPosition: {
        paraIndex: 0,
        wordIndex: 0,
      },
    });
  }

  // Process recognized text to update the recitation state
  async function processRecognizedText(recognizedText: string) {
    console.log('🔴 processRecognizedText called with:', recognizedText);
    
    if (!recognizedText || recognizedText.trim() === '') {
      console.log('🔴 Empty recognized text, skipping processing');
      return;
    }
    
    // Get the reference text to compare against
    const referenceTextToUse = flattenRecitationText();
    console.log('🔴 Reference text for comparison:', referenceTextToUse);
    
    // Send recognized text to server for comparison
    try {
      console.log('🔴 Attempting to call API endpoint');
      
      // We will use client-side comparison as the primary method since
      // we've been having issues with the API endpoints
      console.log('🔴 Using client-side text comparison');
      const comparisonResult = compareText(
        recognizedText, 
        referenceTextToUse
      );
      
      console.log('🔴 Client-side comparison result:', comparisonResult);
      
      if (comparisonResult && comparisonResult.words) {
        console.log('🔴 Words detected in comparison result, updating state');
        updateRecitationState(comparisonResult.words);
      } else {
        console.log('🔴 No words in comparison result:', comparisonResult);
      }
      
      // Generate feedback based on the comparison
      if (comparisonResult) {
        console.log('🔴 Generating feedback from comparison result');
        generateFeedback(comparisonResult);
      }
      
      // Try API as a fallback or additional validation
      try {
        // First try the new endpoint
        console.log('🔴 Also calling API at /api/japji-sahib/compare (for validation)');
        let response = await fetch('/api/japji-sahib/compare', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            recognizedText: recognizedText,
            referenceText: referenceTextToUse
          })
        });
        
        // If that fails, try the older endpoint
        if (!response.ok) {
          console.log('🔴 First API endpoint failed, trying /api/compare-recitation');
          response = await fetch('/api/compare-recitation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              recitedText: recognizedText,
              referenceText: referenceTextToUse
            })
          });
        }
        
        if (response.ok) {
          const result = await response.json();
          console.log('🔴 API comparison result:', result);
          
          // Update state based on API results if we have any
          if (result && result.words) {
            console.log('🔴 API returned words data, updating state again');
            updateRecitationState(result.words);
          }
          
          if (result && result.feedback) {
            console.log('🔴 API returned feedback data, updating feedback');
            setFeedback(result.feedback);
          }
        } else {
          console.log(`🔴 API error: ${response.status} ${response.statusText} - continuing with client-side results`);
        }
      } catch (apiError) {
        console.error('🔴 API call failed:', apiError);
        console.log('🔴 Continuing with client-side comparison results');
      }
      
    } catch (error) {
      console.error('🔴 Error in processRecognizedText:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  // Helper to flatten recitation text
  function flattenRecitationText(): string {
    return recitationState.paras
      .map(para => para.words.map(word => word.text).join(" "))
      .join(" ");
  }

  // Update recitation state with comparison results
  function updateRecitationState(comparedWords: { text: string, isCorrect: boolean }[]) {
    console.log('🔵 updateRecitationState called with', comparedWords.length, 'words');
    
    if (comparedWords.length === 0) {
      console.log('🔵 No compared words provided, skipping update');
      return;
    }
    
    // Create a deep copy of the recitation state
    const newRecitationState = {
      paras: JSON.parse(JSON.stringify(recitationState.paras)),
      currentPosition: { ...recitationState.currentPosition }
    };
    
    let wordCount = 0;
    let wordsProcessed = 0;
    
    // Calculate total words for progress
    const totalWords = newRecitationState.paras.reduce(
      (count: number, para: Para) => count + para.words.length, 
      0
    );
    
    console.log('🔵 Total words in text:', totalWords);
    
    // Create a flattened list of all words
    const allWords: { word: Word, paraIndex: number, wordIndex: number }[] = [];
    newRecitationState.paras.forEach((para: Para, paraIndex: number) => {
      para.words.forEach((word: Word, wordIndex: number) => {
        allWords.push({ word, paraIndex, wordIndex });
      });
    });
    
    console.log('🔵 Total flattened words:', allWords.length);
    
    // Map the compared words to our text
    for (let i = 0; i < comparedWords.length && i < allWords.length; i++) {
      const comparedWord = comparedWords[i];
      const targetWord = allWords[i];
      
      if (comparedWord && targetWord) {
        const paraIndex = targetWord.paraIndex;
        const wordIndex = targetWord.wordIndex;
        
        // Update the word status
        if (comparedWord.isCorrect) {
          newRecitationState.paras[paraIndex].words[wordIndex].status = WordStatus.CORRECT;
        } else {
          newRecitationState.paras[paraIndex].words[wordIndex].status = WordStatus.ERROR;
        }
        
        wordsProcessed++;
      }
    }
    
    console.log('🔵 Words processed:', wordsProcessed);
    
    // Find the next pending word and set it as current
    const currentPos = findNextPendingWord(newRecitationState);
    if (currentPos) {
      console.log('🔵 Next pending word found at para:', currentPos.paraIndex, 'word:', currentPos.wordIndex);
      newRecitationState.currentPosition = currentPos;
      newRecitationState.paras[currentPos.paraIndex].words[currentPos.wordIndex].status = WordStatus.CURRENT;
    } else {
      console.log('🔵 No pending words found');
    }
    
    // Calculate and update progress percentage
    const calculatedPercentage = Math.floor((wordsProcessed / totalWords) * 100);
    console.log('🔵 Progress percentage calculated:', calculatedPercentage);
    
    // Update the progress percentage state
    setProgressPercentage(calculatedPercentage);
    
    // Update the recitation state
    console.log('🔵 Setting new recitation state');
    setRecitationState(newRecitationState);
  }

  // Find the next pending word
  function findNextPendingWord(state: RecitationState) {
    for (let paraIndex = 0; paraIndex < state.paras.length; paraIndex++) {
      const para = state.paras[paraIndex];
      
      for (let wordIndex = 0; wordIndex < para.words.length; wordIndex++) {
        if (para.words[wordIndex].status === WordStatus.PENDING) {
          return { paraIndex, wordIndex };
        }
      }
    }
    
    return null;
  }

  // Generate feedback from comparison results
  function generateFeedback(comparisonResult: any) {
    const newFeedback: FeedbackItem[] = [];
    
    if (comparisonResult.errors && comparisonResult.errors.length > 0) {
      comparisonResult.errors.forEach((error: any) => {
        newFeedback.push({
          type: 'error',
          title: `Pronunciation error at word: "${error.word}"`,
          description: `Correct pronunciation: "${error.correctWord}"`
        });
      });
    }
    
    if (comparisonResult.warnings && comparisonResult.warnings.length > 0) {
      comparisonResult.warnings.forEach((warning: any) => {
        newFeedback.push({
          type: 'warning',
          title: warning.title,
          description: warning.description
        });
      });
    }
    
    setFeedback(newFeedback);
  }

  // Restart recitation
  function restartRecitation() {
    // Reset all word statuses to pending
    const resetState = {
      paras: recitationState.paras.map(para => ({
        words: para.words.map(word => ({
          text: word.text,
          status: WordStatus.PENDING
        }))
      })),
      currentPosition: {
        paraIndex: 0,
        wordIndex: 0,
      },
    };
    
    // Set the first word as current
    if (resetState.paras.length > 0 && resetState.paras[0].words.length > 0) {
      resetState.paras[0].words[0].status = WordStatus.CURRENT;
    }
    
    setRecitationState(resetState);
    setProgressPercentage(0);
    setFeedback([]);
  }

  return {
    recitationState,
    progressPercentage,
    feedback,
    processRecognizedText,
    restartRecitation
  };
}

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
    // Send recognized text to server for comparison
    try {
      const response = await apiRequest(
        'POST', 
        '/api/japji-sahib/compare', 
        { recognizedText }
      );
      
      const result = await response.json();
      
      // Update state based on comparison results
      updateRecitationState(result.words);
      setFeedback(result.feedback);
    } catch (error) {
      // Fallback to client-side comparison if server fails
      const comparisonResult = compareText(
        recognizedText, 
        flattenRecitationText()
      );
      
      updateRecitationState(comparisonResult.words);
      generateFeedback(comparisonResult);
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
    const newRecitationState = { ...recitationState };
    let wordCount = 0;
    let wordsProcessed = 0;
    
    // Calculate total words for progress
    const totalWords = newRecitationState.paras.reduce(
      (count, para) => count + para.words.length, 
      0
    );
    
    // Find words and update status
    for (let paraIndex = 0; paraIndex < newRecitationState.paras.length; paraIndex++) {
      const para = newRecitationState.paras[paraIndex];
      
      for (let wordIndex = 0; wordIndex < para.words.length; wordIndex++) {
        if (wordCount < comparedWords.length) {
          const comparedWord = comparedWords[wordCount];
          
          if (comparedWord) {
            // Update status
            if (comparedWord.isCorrect) {
              para.words[wordIndex].status = WordStatus.CORRECT;
              wordsProcessed++;
            } else {
              para.words[wordIndex].status = WordStatus.ERROR;
              wordsProcessed++;
            }
          }
          
          wordCount++;
        }
      }
    }
    
    // Update current position to the next pending word
    const currentPos = findNextPendingWord(newRecitationState);
    if (currentPos) {
      newRecitationState.currentPosition = currentPos;
      newRecitationState.paras[currentPos.paraIndex].words[currentPos.wordIndex].status = WordStatus.CURRENT;
    }
    
    // Update progress percentage
    setProgressPercentage(Math.floor((wordsProcessed / totalWords) * 100));
    
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

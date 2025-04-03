import { compareRecitation, ComparisonResult } from "@shared/schema";
import { japjiSahibText } from "@shared/japjiSahibText";

// Interface for storage operations
export interface IStorage {
  getJapjiSahibText(): string;
  compareText(recitedText: string, referenceText: string): Promise<ComparisonResult>;
}

export class MemStorage implements IStorage {
  private japjiSahibText: string;

  constructor() {
    // Initialize with default text
    this.japjiSahibText = japjiSahibText;
  }

  // Get Japji Sahib reference text
  getJapjiSahibText(): string {
    return this.japjiSahibText;
  }

  // Compare recited text with reference text
  async compareText(recitedText: string, referenceText: string): Promise<ComparisonResult> {
    // Normalize text for comparison
    const normalizedRecited = this.normalizeText(recitedText);
    const normalizedReference = this.normalizeText(referenceText);
    
    // Split into words
    const recitedWords = normalizedRecited.split(/\s+/).filter(Boolean);
    const referenceWords = normalizedReference.split(/\s+/).filter(Boolean);
    
    // Results
    const words: { text: string; isCorrect: boolean }[] = [];
    const errors: { word: string; correctWord: string; index: number }[] = [];
    const warnings: { title: string; description: string }[] = [];
    
    // Track matches, errors, hesitations
    let hesitationDetected = false;
    let consecutiveErrors = 0;
    
    // Compare recited words against reference
    for (let i = 0; i < recitedWords.length; i++) {
      const recitedWord = recitedWords[i];
      
      // Check if we've gone beyond the reference text
      if (i >= referenceWords.length) {
        words.push({ text: recitedWord, isCorrect: false });
        continue;
      }
      
      const referenceWord = referenceWords[i];
      
      // Detect hesitations (repeated words or filler sounds)
      if (
        recitedWord === referenceWords[i-1] || 
        ['uh', 'um', 'ah', 'er', 'hmm'].includes(recitedWord.toLowerCase())
      ) {
        hesitationDetected = true;
        continue;
      }
      
      // Check if the word is correct
      if (this.isWordMatch(recitedWord, referenceWord)) {
        words.push({ text: recitedWord, isCorrect: true });
        consecutiveErrors = 0;
      } else {
        // Try to match with nearby words (to handle small skips)
        let foundNearby = false;
        
        // Check next few words in reference
        for (let j = 1; j <= 3 && i+j < referenceWords.length; j++) {
          if (this.isWordMatch(recitedWord, referenceWords[i+j])) {
            // We found a match ahead, so mark words in between as errors
            for (let k = 0; k < j; k++) {
              errors.push({ 
                word: "(missed)", 
                correctWord: referenceWords[i+k], 
                index: words.length + k 
              });
              words.push({ text: "(missed)", isCorrect: false });
            }
            
            // Add the correct match
            words.push({ text: recitedWord, isCorrect: true });
            i += j; // Skip ahead in the reference text
            foundNearby = true;
            break;
          }
        }
        
        if (!foundNearby) {
          // Word is an error
          words.push({ text: recitedWord, isCorrect: false });
          errors.push({ 
            word: recitedWord, 
            correctWord: referenceWord, 
            index: words.length - 1 
          });
          consecutiveErrors++;
        }
      }
    }
    
    // Generate warnings
    if (hesitationDetected) {
      warnings.push({
        title: "Slight hesitation detected", 
        description: "Try to maintain a consistent pace during recitation"
      });
    }
    
    if (consecutiveErrors >= 3) {
      warnings.push({
        title: "Multiple consecutive errors",
        description: "You may need to review this section of the text"
      });
    }
    
    if (recitedWords.length < referenceWords.length * 0.8) {
      warnings.push({
        title: "Significant omission detected",
        description: "Large portions of the text were not recited"
      });
    }
    
    // Generate feedback items based on errors and warnings
    const feedback = [
      ...errors.map(error => ({
        type: 'error' as const,
        title: `Pronunciation error at word: "${error.word}"`,
        description: `Correct pronunciation: "${error.correctWord}"`
      })),
      ...warnings.map(warning => ({
        type: 'warning' as const,
        title: warning.title,
        description: warning.description
      }))
    ];
    
    return { words, errors, warnings, feedback };
  }

  // Helper method to normalize text for comparison
  private normalizeText(text: string): string {
    return text
      .replace(/[\u0964\u0965।॥]/g, '') // Remove danda and double danda
      .replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, '') // Remove punctuation but keep letters, numbers and Gurmukhi characters
      .replace(/\s+/g, ' ')            // Standardize whitespace
      .trim();
  }

  // Helper method to check if words match, accounting for small variations
  private isWordMatch(word1: string, word2: string): boolean {
    // Exact match
    if (word1 === word2) return true;
    
    // Handle common Gurmukhi pronunciation variations
    if (this.normalizeGurmukhiPronunciation(word1) === this.normalizeGurmukhiPronunciation(word2)) return true;
    
    // For short words (3 characters or less), use exact matching only
    if (word1.length <= 3 || word2.length <= 3) {
      return word1 === word2;
    }
    
    // For longer words, allow more variations based on word length
    const threshold = Math.max(1, Math.floor(Math.max(word1.length, word2.length) / 4));
    if (this.levenshteinDistance(word1, word2) <= threshold) return true;
    
    return false;
  }
  
  // Helper method to normalize common Gurmukhi pronunciation variations
  private normalizeGurmukhiPronunciation(word: string): string {
    return word
      // Handle similar-sounding characters
      .replace(/ੳ|ਉ|ਊ/g, 'ਓ')
      .replace(/ਅ|ਆ/g, 'ਆ')
      .replace(/ਇ|ਈ/g, 'ਈ')
      .replace(/ੲ|ਏ/g, 'ਏ')
      // Normalize ਂ (bindi) variations
      .replace(/ਂ/g, '')
      // Normalize ੰ (tippi) variations
      .replace(/ੰ/g, '')
      // Normalize ੱ (adhak) variations
      .replace(/ੱ/g, '')
      // Remove vowel modifiers for lenient matching
      // Fixed the character class - previously had incorrect syntax with pipes inside []
      .replace(/[ਾਿੀੁੂੇੈੋੌ]/g, '');
  }

  // Levenshtein distance implementation for fuzzy matching
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    
    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i-1) === a.charAt(j-1)) {
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i-1][j-1] + 1, // substitution
            matrix[i][j-1] + 1,   // insertion
            matrix[i-1][j] + 1    // deletion
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }
}

export const storage = new MemStorage();

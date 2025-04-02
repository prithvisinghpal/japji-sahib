// Function to compare recited text with reference text
export function compareText(recitedText: string, referenceText: string) {
  // Normalize text for comparison (remove extra spaces, standardize characters)
  const normalizedRecited = normalizeText(recitedText);
  const normalizedReference = normalizeText(referenceText);
  
  // Split into words
  const recitedWords = normalizedRecited.split(/\s+/).filter(Boolean);
  const referenceWords = normalizedReference.split(/\s+/).filter(Boolean);
  
  // Results object
  const result = {
    words: [] as { text: string, isCorrect: boolean }[],
    errors: [] as { word: string, correctWord: string, index: number }[],
    warnings: [] as { title: string, description: string }[],
  };
  
  // Track matches, errors, hesitations
  let hesitationDetected = false;
  let consecutiveErrors = 0;
  
  // Compare recited words against reference
  for (let i = 0; i < recitedWords.length; i++) {
    const recitedWord = recitedWords[i];
    
    // Check if we've gone beyond the reference text
    if (i >= referenceWords.length) {
      result.words.push({ text: recitedWord, isCorrect: false });
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
    if (isWordMatch(recitedWord, referenceWord)) {
      result.words.push({ text: recitedWord, isCorrect: true });
      consecutiveErrors = 0;
    } else {
      // Try to match with nearby words (to handle small skips)
      let foundNearby = false;
      
      // Check next few words in reference
      for (let j = 1; j <= 3 && i+j < referenceWords.length; j++) {
        if (isWordMatch(recitedWord, referenceWords[i+j])) {
          // We found a match ahead, so mark words in between as errors
          for (let k = 0; k < j; k++) {
            result.errors.push({ 
              word: "(missed)", 
              correctWord: referenceWords[i+k], 
              index: result.words.length + k 
            });
            result.words.push({ text: "(missed)", isCorrect: false });
          }
          
          // Add the correct match
          result.words.push({ text: recitedWord, isCorrect: true });
          i += j; // Skip ahead in the reference text
          foundNearby = true;
          break;
        }
      }
      
      if (!foundNearby) {
        // Word is an error
        result.words.push({ text: recitedWord, isCorrect: false });
        result.errors.push({ 
          word: recitedWord, 
          correctWord: referenceWord, 
          index: result.words.length - 1 
        });
        consecutiveErrors++;
      }
    }
  }
  
  // Generate warnings
  if (hesitationDetected) {
    result.warnings.push({
      title: "Slight hesitation detected", 
      description: "Try to maintain a consistent pace during recitation"
    });
  }
  
  if (consecutiveErrors >= 3) {
    result.warnings.push({
      title: "Multiple consecutive errors",
      description: "You may need to review this section of the text"
    });
  }
  
  if (recitedWords.length < referenceWords.length * 0.8) {
    result.warnings.push({
      title: "Significant omission detected",
      description: "Large portions of the text were not recited"
    });
  }
  
  return result;
}

// Helper function to normalize text for comparison
function normalizeText(text: string): string {
  return text
    .replace(/[\u0964\u0965।॥]/g, '') // Remove danda and double danda
    .replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, '') // Remove punctuation but keep letters, numbers and Gurmukhi characters
    .replace(/\s+/g, ' ')            // Standardize whitespace
    .trim();
}

// Helper function to check if words match, accounting for small variations
function isWordMatch(word1: string, word2: string): boolean {
  // Exact match
  if (word1 === word2) return true;
  
  // Handle common Gurmukhi pronunciation variations
  if (normalizeGurmukhiPronunciation(word1) === normalizeGurmukhiPronunciation(word2)) return true;
  
  // For short words (3 characters or less), use exact matching only
  if (word1.length <= 3 || word2.length <= 3) {
    return word1 === word2;
  }
  
  // For longer words, allow more variations
  const threshold = Math.max(1, Math.floor(Math.max(word1.length, word2.length) / 4));
  if (levenshteinDistance(word1, word2) <= threshold) return true;
  
  return false;
}

// Helper function to normalize common Gurmukhi pronunciation variations
function normalizeGurmukhiPronunciation(word: string): string {
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
    .replace(/[ਾ|ਿ|ੀ|ੁ|ੂ|ੇ|ੈ|ੋ|ੌ]/g, '');
}

// Levenshtein distance implementation for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
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

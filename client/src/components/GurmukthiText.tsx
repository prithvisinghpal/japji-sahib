import { useEffect, useState } from "react";
import { RecitationState, WordStatus } from "../hooks/useRecitation";

type GurmukthiTextProps = {
  recitationState: RecitationState;
};

export default function GurmukthiText({ recitationState }: GurmukthiTextProps) {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  useEffect(() => {
    console.log("📄 GurmukthiText rendered with recitationState:", {
      paraCount: recitationState.paras.length,
      paraLengths: recitationState.paras.map(p => p.words.length),
      firstWords: recitationState.paras.map(p => p.words.slice(0, 2).map(w => w.text)),
      currentPosition: recitationState.currentPosition
    });
  }, [recitationState]);
  
  return (
    <div className="flex-grow overflow-y-auto custom-scrollbar mb-4 text-lg leading-relaxed relative p-4 bg-white dark:bg-gray-900 border rounded-lg shadow-md">
      {/* Debug toggle button */}
      <button 
        className="absolute top-2 right-2 text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md"
        onClick={() => setShowDebugInfo(!showDebugInfo)}
      >
        {showDebugInfo ? "Hide Debug" : "Show Debug"}
      </button>
      
      {/* Debug Info */}
      {showDebugInfo && (
        <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900 rounded text-xs">
          <p>Paragraphs: {recitationState.paras.length}</p>
          <p>Current Position: Para {recitationState.currentPosition.paraIndex}, Word {recitationState.currentPosition.wordIndex}</p>
          <p>Total Words: {recitationState.paras.reduce((sum, para) => sum + para.words.length, 0)}</p>
        </div>
      )}
      
      <div className="space-y-6 gurmukhi-text">
        {recitationState.paras.length > 0 ? (
          recitationState.paras.map((para, paraIndex) => (
            <p 
              key={`para-${paraIndex}`} 
              className={`text-black dark:text-white relative ${paraIndex === recitationState.currentPosition.paraIndex ? "bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg" : ""}`}
            >
              {para.words.map((word, wordIndex) => {
                let className = "gurmukhi-word"; // Base class using our new styles
                
                if (word.status === WordStatus.CORRECT) {
                  className += " correct";
                } else if (word.status === WordStatus.ERROR) {
                  className += " error";
                } else if (word.status === WordStatus.CURRENT) {
                  className += " current highlighted";
                }
                
                // Add extra debug highlight for current word
                if (paraIndex === recitationState.currentPosition.paraIndex && 
                    wordIndex === recitationState.currentPosition.wordIndex) {
                  className += " debug-border";
                }
                
                return (
                  <span 
                    key={`word-${paraIndex}-${wordIndex}`} 
                    className={className}
                  >
                    {word.text}
                  </span>
                );
              })}
            </p>
          ))
        ) : (
          // Show a placeholder text if no paragraphs are available
          <div className="text-center text-gray-500 dark:text-gray-400 py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-lg font-medium">Loading Japji Sahib text...</p>
            <p className="text-sm mt-2">If this message persists, there may be an issue with loading the text.</p>
          </div>
        )}
      </div>
    </div>
  );
}

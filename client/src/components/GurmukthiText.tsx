import { RecitationState, WordStatus } from "../hooks/useRecitation";

type GurmukthiTextProps = {
  recitationState: RecitationState;
};

export default function GurmukthiText({ recitationState }: GurmukthiTextProps) {
  return (
    <div className="flex-grow overflow-y-auto custom-scrollbar mb-4 font-mukta text-lg leading-relaxed relative">
      <div className="space-y-4">
        {recitationState.paras.map((para, paraIndex) => (
          <p key={`para-${paraIndex}`} className="relative">
            {para.words.map((word, wordIndex) => {
              let className = "";
              
              if (word.status === WordStatus.CORRECT) {
                className = "correct";
              } else if (word.status === WordStatus.ERROR) {
                className = "error";
              } else if (word.status === WordStatus.CURRENT) {
                className = "current highlighted";
              }
              
              return (
                <span 
                  key={`word-${paraIndex}-${wordIndex}`} 
                  className={className}
                >
                  {word.text}{' '}
                </span>
              );
            })}
          </p>
        ))}
      </div>
      
      {/* Styles moved to index.css */}
    </div>
  );
}

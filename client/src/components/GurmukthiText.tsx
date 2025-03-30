import { RecitationState, WordStatus } from "@/hooks/useRecitation";

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
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F1F5F9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #CBD5E1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94A3B8;
        }
        .highlighted {
          background-color: rgba(230, 180, 34, 0.3);
          border-radius: 0.25rem;
        }
        .error {
          background-color: rgba(239, 68, 68, 0.2);
          border-radius: 0.25rem;
          text-decoration: line-through;
          text-decoration-color: #EF4444;
        }
        .correct {
          background-color: rgba(16, 185, 129, 0.2);
          border-radius: 0.25rem;
        }
        .current {
          border-bottom: 2px solid #5D28A0;
        }
      `}</style>
    </div>
  );
}

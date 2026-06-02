import React from 'react';

interface ReactionCounterProps {
  reactions: Record<string, string[]>;
}

export const ReactionCounter: React.FC<ReactionCounterProps> = ({ reactions }) => {
  if (!reactions || Object.keys(reactions).length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1 z-10 absolute -bottom-3 left-2 right-2">
      {Object.entries(reactions).map(([emoji, uidsArr]) => {
        const uids = uidsArr as string[];
        if (!uids || uids.length === 0) return null;
        return (
          <div key={emoji} className="bg-white border border-slate-200 shadow-sm rounded-full px-1.5 py-0.5 text-[10px] flex items-center font-medium gap-1 text-slate-600">
            <span>{emoji}</span>
            {uids.length > 1 && <span>{uids.length}</span>}
          </div>
        );
      })}
    </div>
  );
};

import { useGameStore } from '../store/useGameStore';
import { GameMode } from '../types';
import { Swords, Puzzle, BookOpen, Microscope } from 'lucide-react';
import { motion } from 'framer-motion';

const modes: { id: GameMode; label: string; icon: React.ElementType }[] = [
  { id: 'play', label: '対局', icon: Swords },
  { id: 'puzzle', label: '問題', icon: Puzzle },
  { id: 'opening', label: '定石', icon: BookOpen },
  { id: 'analysis', label: '解析', icon: Microscope },
];

export function ModeSelector() {
  const { mode, setMode } = useGameStore();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        モード
      </h2>
      <div className="grid grid-cols-4 gap-1">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          
          return (
            <motion.button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`p-2 rounded-md flex flex-col items-center gap-1 transition-all ${
                isActive 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-medium">{m.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

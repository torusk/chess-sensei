import { useGameStore } from '../store/useGameStore';
import { GameMode } from '../types';
import { Swords, Puzzle, BookOpen, Microscope } from 'lucide-react';
import { motion } from 'framer-motion';

const modes: { id: GameMode; label: string; description: string; icon: React.ElementType }[] = [
  { 
    id: 'play', 
    label: '対局モード', 
    description: 'AIと対戦',
    icon: Swords 
  },
  { 
    id: 'puzzle', 
    label: '詰め問題', 
    description: 'テクニック向上',
    icon: Puzzle 
  },
  { 
    id: 'opening', 
    label: 'オープニング', 
    description: '定石を学習',
    icon: BookOpen 
  },
  { 
    id: 'analysis', 
    label: '解析モード', 
    description: '棋譜を分析',
    icon: Microscope 
  },
];

export function ModeSelector() {
  const { mode, setMode } = useGameStore();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        学習モード
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          
          return (
            <motion.button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                isActive 
                  ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-300' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-6 h-6" />
              <div className="text-center">
                <div className="text-sm font-semibold leading-tight">{m.label}</div>
                <div className={`text-[10px] mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                  {m.description}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

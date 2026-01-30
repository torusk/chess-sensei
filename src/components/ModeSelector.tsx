import { useGameStore } from '../store/useGameStore';
import { GameMode } from '../types';
import { 
  Swords, 
  Puzzle, 
  BookOpen, 
  Microscope,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const modes: { id: GameMode; label: string; icon: React.ElementType; description: string }[] = [
  { 
    id: 'play', 
    label: '対局モード', 
    icon: Swords,
    description: 'AIと対戦して実力を試す'
  },
  { 
    id: 'puzzle', 
    label: '詰め問題', 
    icon: Puzzle,
    description: 'テクニックを磨く問題集'
  },
  { 
    id: 'opening', 
    label: 'オープニング', 
    icon: BookOpen,
    description: '定石を学んで序盤を制す'
  },
  { 
    id: 'analysis', 
    label: '解析モード', 
    icon: Microscope,
    description: '棋譜を詳しく検討する'
  },
];

export function ModeSelector() {
  const { mode, setMode } = useGameStore();

  return (
    <div className="panel p-4">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
        学習モード
      </h2>
      <div className="space-y-2">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          
          return (
            <motion.button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
                isActive 
                  ? 'bg-accent text-white shadow-lg' 
                  : 'hover:bg-bg-secondary text-text-primary'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-accent'}`} />
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{m.label}</p>
                <p className={`text-xs ${isActive ? 'text-white/80' : 'text-text-secondary'}`}>
                  {m.description}
                </p>
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

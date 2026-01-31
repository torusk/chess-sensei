import { useState, useCallback, useRef } from 'react';

interface StockfishEngine {
  evaluate: (fen: string, depth?: number) => Promise<{ bestMove: string; evaluation: number }>;
  isReady: boolean;
}

export function useStockfish(): StockfishEngine {
  const [isReady, setIsReady] = useState(false);
  const engineRef = useRef<any>(null);

  const initEngine = useCallback(async () => {
    if (engineRef.current) return;
    
    try {
      // Stockfish WASMを動的にインポート
      // @ts-ignore - stockfish is an optional dependency
      const Stockfish = await import('stockfish');
      const engine = Stockfish.default || Stockfish;
      
      engineRef.current = engine;
      
      engine.onmessage = (event: any) => {
        const msg = typeof event === 'string' ? event : event.data;
        if (msg === 'readyok') {
          setIsReady(true);
        }
      };
      
      engine.postMessage('uci');
      engine.postMessage('isready');
    } catch (error) {
      console.error('Stockfish initialization failed:', error);
    }
  }, []);

  const evaluate = useCallback(async (fen: string, depth: number = 15): Promise<{ bestMove: string; evaluation: number }> => {
    if (!engineRef.current) {
      await initEngine();
    }

    return new Promise((resolve, reject) => {
      const engine = engineRef.current;
      let bestMove = '';
      let evaluation = 0;

      const handleMessage = (event: any) => {
        const msg = typeof event === 'string' ? event : event.data;
        
        if (msg.startsWith('bestmove')) {
          bestMove = msg.split(' ')[1];
          engine.removeEventListener('message', handleMessage);
          resolve({ bestMove, evaluation });
        } else if (msg.includes('score cp')) {
          const match = msg.match(/score cp (-?\d+)/);
          if (match) {
            evaluation = parseInt(match[1]) / 100; // centipawn to pawn
          }
        } else if (msg.includes('score mate')) {
          const match = msg.match(/score mate (-?\d+)/);
          if (match) {
            const mateIn = parseInt(match[1]);
            evaluation = mateIn > 0 ? 1000 : -1000;
          }
        }
      };

      engine.addEventListener('message', handleMessage);
      engine.postMessage(`position fen ${fen}`);
      engine.postMessage(`go depth ${depth}`);

      // タイムアウト処理
      setTimeout(() => {
        engine.removeEventListener('message', handleMessage);
        reject(new Error('Stockfish evaluation timeout'));
      }, 10000);
    });
  }, [initEngine]);

  return { evaluate, isReady };
}

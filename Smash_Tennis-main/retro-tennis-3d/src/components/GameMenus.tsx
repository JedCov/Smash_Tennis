import { GameState, type PlayerType } from '../types';
import { playScoreSound } from '../sounds';

interface GameMenusProps {
  gameState: GameState;
  winner: PlayerType | null;
  startGame: () => void;
}

export function GameMenus({ gameState, winner, startGame }: GameMenusProps) {
  return (
    <>
      {gameState === GameState.START && (
        <div className="absolute inset-0 flex items-center justify-center bg-orange-600/20 backdrop-blur-sm">
          <div className="bg-orange-500 p-12 text-center border-8 border-white shadow-[16px_16px_0px_0px_rgba(0,0,0,0.5)] transform -rotate-1">
            <h1 className="text-7xl text-white font-black mb-8 italic tracking-tighter drop-shadow-lg">ARCADE TENNIS</h1>
            <p className="text-white text-xl mb-10 font-bold opacity-90 underline decoration-4 underline-offset-8">THE ULTIMATE 3D SMASH</p>
            <button
              onClick={() => {
                playScoreSound();
                startGame();
              }}
              className="bg-white text-orange-600 px-12 py-6 text-3xl font-black hover:scale-105 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-2 cursor-pointer"
            >
              START GAME
            </button>
          </div>
        </div>
      )}

      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="text-center">
            <h2 className="text-8xl text-white font-black mb-4 uppercase italic">
              {winner === 'PLAYER' ? 'YOU WIN!' : 'GAME OVER'}
            </h2>
            <button
              onClick={startGame}
              className="mt-8 text-2xl text-orange-400 hover:text-white transition-colors cursor-pointer border-b-4 border-current pb-2"
            >
              REPLAY?
            </button>
          </div>
        </div>
      )}
    </>
  );
}

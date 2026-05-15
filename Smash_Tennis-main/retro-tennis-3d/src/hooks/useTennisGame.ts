import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Score, TENNIS_SCORES } from '../types';

export function useTennisGame() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState<Score>({
    player: 0,
    ai: 0,
    playerGames: 0,
    aiGames: 0,
    playerSets: 0,
    aiSets: 0
  });
  const [servingPlayer, setServingPlayer] = useState<'PLAYER' | 'AI'>('PLAYER');
  const [winner, setWinner] = useState<'PLAYER' | 'AI' | null>(null);
  const [isTiebreak, setIsTiebreak] = useState(false);
  const [serveSide, setServeSide] = useState<'DEUCE' | 'AD'>('DEUCE');
  const [targetRallyLength, setTargetRallyLength] = useState(3);
  const [totalPointsPlayed, setTotalPointsPlayed] = useState(0);
  const [lastPointWinner, setLastPointWinner] = useState<'PLAYER' | 'AI' | null>(null);
  const scoringTimeoutRef = useRef<number | null>(null);

  const clearScoringTimeout = useCallback(() => {
    if (scoringTimeoutRef.current !== null) {
      window.clearTimeout(scoringTimeoutRef.current);
      scoringTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearScoringTimeout, [clearScoringTimeout]);

  // Difficulty scaling logic
  const totalGames = score.playerGames + score.aiGames + (score.playerSets + score.aiSets) * 6;
  const gameDifficultyMultiplier = 1.0 + (totalGames * 0.05); // +5% speed/difficulty per game
  const pointDifficultyMultiplier = 1.0 + (totalPointsPlayed * 0.01); // +1% speed per point played

  // Racket accuracy shrinks as games progress
  const racketAccuracyRadius = Math.max(1.5, 2.5 - (totalGames * 0.15));

  const formatScore = (p: number, a: number) => {
    if (isTiebreak) return `${p}-${a}`;

    if (p >= 3 && a >= 3) {
        if (p === a) return 'Deuce';
        if (p > a) return 'Adv. Player';
        return 'Adv. AI';
    }

    const pStr = TENNIS_SCORES[p] || '0';
    const aStr = TENNIS_SCORES[a] || '0';
    return `${pStr}-${aStr}`;
  };

  const checkSetWin = (pGames: number, aGames: number) => {
    if (isTiebreak) {
        if (pGames >= 7 && pGames - aGames >= 2) return 'PLAYER';
        if (aGames >= 7 && aGames - pGames >= 2) return 'AI';
        return null;
    }

    if (pGames >= 6 && pGames - aGames >= 2) return 'PLAYER';
    if (aGames >= 6 && aGames - pGames >= 2) return 'AI';
    if (pGames === 7 && aGames === 5) return 'PLAYER';
    if (aGames === 7 && pGames === 5) return 'AI';

    return null;
  };

  const addPoint = useCallback((who: 'PLAYER' | 'AI') => {
    clearScoringTimeout();
    const next: Score = { ...score };
    let nextIsTiebreak = isTiebreak;
    let matchWinner: 'PLAYER' | 'AI' | null = null;
    let shouldRotateServer = false;
    let shouldResetServeSide = false;
    let shouldResetRallyTarget = false;

    const handleSetWin = (winnerSide: 'PLAYER' | 'AI') => {
        if (winnerSide === 'PLAYER') next.playerSets++;
        else next.aiSets++;

        next.playerGames = 0;
        next.aiGames = 0;
        next.player = 0;
        next.ai = 0;
        nextIsTiebreak = false;

        // Best of 3 sets
        if (next.playerSets === 2) {
            matchWinner = 'PLAYER';
        } else if (next.aiSets === 2) {
            matchWinner = 'AI';
        }
    };

    setLastPointWinner(who);
    setServeSide(curr => curr === 'DEUCE' ? 'AD' : 'DEUCE');
    setTargetRallyLength(curr => curr + 1);
    setTotalPointsPlayed(curr => curr + 1);

    if (who === 'PLAYER') next.player++;
    else next.ai++;

    // Tiebreak Logic
    if (isTiebreak) {
        // In arcade tiebreak, server rotates every 2 points (starting after 1st)
        const totalPoints = next.player + next.ai;
        if (totalPoints % 2 === 1) {
            shouldRotateServer = true;
        }

        if (next.player >= 7 && next.player - next.ai >= 2) {
            next.playerGames++; // Ends at 7-6
            handleSetWin('PLAYER');
        } else if (next.ai >= 7 && next.ai - next.player >= 2) {
            next.aiGames++;
            handleSetWin('AI');
        }
    } else {
        // Standard Game Logic
        const p = next.player;
        const a = next.ai;

        const gameWon = (p >= 4 && p - a >= 2) || (a >= 4 && a - p >= 2);

        if (gameWon) {
            const gameWinner = p > a ? 'PLAYER' : 'AI';
            next.player = 0;
            next.ai = 0;

            if (gameWinner === 'PLAYER') next.playerGames++;
            else next.aiGames++;

            // Rotate server after every game
            shouldRotateServer = true;
            shouldResetServeSide = true;
            shouldResetRallyTarget = true;

            // Check for Tiebreak
            if (next.playerGames === 6 && next.aiGames === 6) {
                nextIsTiebreak = true;
            } else {
                const setWin = checkSetWin(next.playerGames, next.aiGames);
                if (setWin) {
                    handleSetWin(setWin);
                }
            }
        }
    }

    setScore(next);
    setIsTiebreak(nextIsTiebreak);

    if (shouldRotateServer) {
      setServingPlayer(curr => curr === 'PLAYER' ? 'AI' : 'PLAYER');
    }
    if (shouldResetServeSide) {
      setServeSide('DEUCE');
    }
    if (shouldResetRallyTarget) {
      setTargetRallyLength(3);
    }

    if (matchWinner) {
      setWinner(matchWinner);
      setGameState(GameState.GAME_OVER);
    } else {
      setGameState(GameState.SCORING);
      scoringTimeoutRef.current = window.setTimeout(() => {
        scoringTimeoutRef.current = null;
        setGameState(GameState.SERVING);
      }, 900);
    }
  }, [checkSetWin, clearScoringTimeout, isTiebreak, score]);

  const startGame = () => {
    clearScoringTimeout();
    setScore({
        player: 0, ai: 0,
        playerGames: 0, aiGames: 0,
        playerSets: 0, aiSets: 0
    });
    setIsTiebreak(false);
    setServeSide('DEUCE');
    setTargetRallyLength(3);
    setTotalPointsPlayed(0);
    setServingPlayer('PLAYER');
    setGameState(GameState.SERVING);
    setWinner(null);
    setLastPointWinner(null);
  };

  return {
    gameState,
    setGameState,
    score,
    formatScore,
    addPoint,
    servingPlayer,
    setServingPlayer,
    serveSide,
    isTiebreak,
    targetRallyLength,
    difficultyStats: {
        gameDifficultyMultiplier,
        pointDifficultyMultiplier,
        racketAccuracyRadius
    },
    winner,
    lastPointWinner,
    startGame
  };
}

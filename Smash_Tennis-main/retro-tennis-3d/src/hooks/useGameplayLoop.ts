import { useCallback, useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { BallHandle } from '../components/Ball';
import { calculateLegalShot, type ServeSide, type ShotDifficultyStats } from '../gameplay/shotPhysics';
import { playHitSound, playMissSound, playScoreSound } from '../sounds';
import { GameState, type PlayerType } from '../types';

export interface GameplayDifficultyStats extends ShotDifficultyStats {
  racketAccuracyRadius: number;
}

interface UseGameplayLoopOptions {
  onScore: (winner: PlayerType) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  servingPlayer: PlayerType;
  serveSide: ServeSide;
  targetRallyLength: number;
  difficultyStats: GameplayDifficultyStats;
}

export function useGameplayLoop({
  onScore,
  gameState,
  setGameState,
  servingPlayer,
  serveSide,
  targetRallyLength,
  difficultyStats
}: UseGameplayLoopOptions) {
  const ballRef = useRef<BallHandle>(null);
  const playerPos = useRef(new THREE.Vector3(0, 0, 9));
  const aiPos = useRef(new THREE.Vector3(0, 0, -9));
  const keys = useRef<{ [key: string]: boolean }>({});
  const mousePos = useRef({ x: 0, y: 0 });
  const { camera } = useThree();

  const [lastHitter, setLastHitter] = useState<PlayerType | null>(null);
  const [isVisualSwinging, setIsVisualSwinging] = useState(false);
  const consecutiveReturns = useRef(0);
  const previousBallZ = useRef(0);
  const pointEndedRef = useRef(false);
  const aiServeReadyAt = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'Space') {
        setIsVisualSwinging(true);
        setTimeout(() => setIsVisualSwinging(false), 200);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.code] = false);

    const handleMouseDown = () => {
      keys.current['MouseDown'] = true;
      setIsVisualSwinging(true);
      setTimeout(() => setIsVisualSwinging(false), 200);
    };
    const handleMouseUp = () => (keys.current['MouseDown'] = false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const resetBall = useCallback((server: PlayerType) => {
    if (!ballRef.current) return;
    if (server === 'PLAYER') {
      ballRef.current.reset([playerPos.current.x + 0.4, 1.5, playerPos.current.z - 0.2], [0, 0, 0]);
    } else {
      ballRef.current.reset([aiPos.current.x - 0.4, 1.5, aiPos.current.z + 0.2], [0, 0, 0]);
    }
    setLastHitter(null);
    previousBallZ.current = server === 'PLAYER' ? playerPos.current.z - 0.2 : aiPos.current.z + 0.2;
    pointEndedRef.current = false;
    aiServeReadyAt.current = 0;
    consecutiveReturns.current = 0;
  }, []);

  // Handle game start/reset.
  useEffect(() => {
    if (gameState === GameState.SERVING) {
      resetBall(servingPlayer);
    }
  }, [gameState, resetBall, servingPlayer]);

  useFrame((state, delta) => {
    if (gameState !== GameState.PLAYING && gameState !== GameState.SERVING) return;

    // Use R3F state.mouse for accurate relative cursor position.
    mousePos.current.x = state.mouse.x;
    mousePos.current.y = state.mouse.y;

    const ballPos = ballRef.current?.getPosition() || new THREE.Vector3();
    const isSwinging = keys.current['Space'] || keys.current['MouseDown'];

    // Player Movement (High-response Mouse follow)
    let targetX = mousePos.current.x * 12.0;
    let targetZ = 6.0 + -mousePos.current.y * 10.0;

    if (gameState === GameState.SERVING && servingPlayer === 'PLAYER') {
      // Hard pin player behind baseline for service on correct side.
      targetZ = 11.3;
      targetX = serveSide === 'DEUCE' ? 3.0 : -3.0;
    }

    playerPos.current.x = THREE.MathUtils.lerp(playerPos.current.x, targetX, 0.95);
    playerPos.current.z = THREE.MathUtils.lerp(playerPos.current.z, targetZ, 0.95);

    playerPos.current.x = THREE.MathUtils.clamp(playerPos.current.x, -5.5, 5.5);
    playerPos.current.z = THREE.MathUtils.clamp(playerPos.current.z, 2, 11.5);

    // Serve Mechanics
    if (gameState === GameState.SERVING) {
      if (servingPlayer === 'PLAYER') {
        ballRef.current?.reset([playerPos.current.x + 0.4, 1.5, playerPos.current.z - 0.2], [0, 0, 0]);
        if (isSwinging) {
          const serveVel = calculateLegalShot(
            new THREE.Vector3(playerPos.current.x + 0.4, 1.5, playerPos.current.z - 0.2),
            true,
            serveSide,
            difficultyStats,
            'AI'
          );
          ballRef.current?.setVelocity(serveVel);
          setGameState(GameState.PLAYING);
          setLastHitter('PLAYER');
          playHitSound();
          keys.current['MouseDown'] = false;
        }
      } else {
        // AI Serving logic
        aiPos.current.z = -10.5; // Behind baseline
        aiPos.current.x = serveSide === 'DEUCE' ? -3.0 : 3.0; // AI's deuce side is server's left (negative X)

        ballRef.current?.reset([aiPos.current.x - 0.4, 1.5, aiPos.current.z + 0.2], [0, 0, 0]);
        // Wait briefly before AI serves so the player can read the next point.
        if (aiServeReadyAt.current === 0) {
          aiServeReadyAt.current = state.clock.getElapsedTime() + 1.2;
        }
        if (state.clock.getElapsedTime() >= aiServeReadyAt.current) {
          const serveVel = calculateLegalShot(
            new THREE.Vector3(aiPos.current.x - 0.4, 1.5, aiPos.current.z + 0.2),
            true,
            serveSide,
            difficultyStats,
            'PLAYER'
          );
          ballRef.current?.setVelocity(serveVel);
          setGameState(GameState.PLAYING);
          setLastHitter('AI');
          playHitSound();
        }
      }
      return;
    }

    // AI movement (Slower and more arcade-like)
    const isMercyMiss = consecutiveReturns.current >= targetRallyLength;
    const aiBaseSpeed = isMercyMiss ? 1.5 : 3.5;
    const aiSpeed = aiBaseSpeed * difficultyStats.gameDifficultyMultiplier * delta;
    // When missing, target a position that is always just out of reach (offset by 2.5 units)
    const missOffset = ballPos.x > 0 ? -2.5 : 2.5;
    const aiTargetX = ballPos.z < 0 ? (isMercyMiss ? ballPos.x + missOffset : ballPos.x) : 0;
    const aiTargetZ = -9 + Math.sin(state.clock.getElapsedTime()) * 1;

    aiPos.current.x += Math.sign(aiTargetX - aiPos.current.x) * Math.min(Math.abs(aiTargetX - aiPos.current.x), aiSpeed);
    aiPos.current.z += Math.sign(aiTargetZ - aiPos.current.z) * Math.min(Math.abs(aiTargetZ - aiPos.current.z), aiSpeed);

    // AI Hit Detection
    if (ballPos.z < -8 && ballPos.z > -9.5 && lastHitter === 'PLAYER' && ballPos.y < 3.5 && !isMercyMiss) {
      if (Math.abs(ballPos.x - aiPos.current.x) < 2.0) {
        const tZ = 5 + Math.random() * 4;
        const tX = (Math.random() - 0.5) * 8;
        const vy = 1.8 * difficultyStats.pointDifficultyMultiplier;
        const t = (vy + Math.sqrt(vy * vy + 2 * 1.5 * (ballPos.y - 0.1))) / 1.5;

        const aiReturnVel = new THREE.Vector3((tX - ballPos.x) / t, vy, (tZ - ballPos.z) / t);
        ballRef.current?.setVelocity(aiReturnVel.multiplyScalar(difficultyStats.gameDifficultyMultiplier));
        setLastHitter('AI');
        playHitSound();
      }
    }

    // Player Hit Detection (Guaranteed legal shot)
    if (isSwinging && ballPos.z > 3.0 && ballPos.z < 11.0 && lastHitter !== 'PLAYER' && ballPos.y < 4.0) {
      // Hit radius shrinks as games progress.
      if (Math.abs(ballPos.x - playerPos.current.x) < difficultyStats.racketAccuracyRadius * 2.8) {
        const playerReturnVel = calculateLegalShot(ballPos, false, serveSide, difficultyStats);
        ballRef.current?.setVelocity(playerReturnVel);
        setLastHitter('PLAYER');
        consecutiveReturns.current++;
        playHitSound();

        keys.current['MouseDown'] = false;
      }
    }

    const awardPoint = (winner: PlayerType, positiveForPlayer: boolean) => {
      if (pointEndedRef.current) return;
      pointEndedRef.current = true;
      onScore(winner);
      if (positiveForPlayer) playScoreSound();
      else playMissSound();
    };

    // Net collision: if the ball crosses the net too low, the hitter loses the point.
    const crossedNet = (previousBallZ.current <= 0 && ballPos.z > 0) || (previousBallZ.current >= 0 && ballPos.z < 0);
    if (crossedNet && ballPos.y < 1.05 && lastHitter) {
      awardPoint(lastHitter === 'PLAYER' ? 'AI' : 'PLAYER', lastHitter === 'AI');
    } else if (ballPos.z > 14) {
      awardPoint('AI', false);
    } else if (ballPos.z < -14) {
      awardPoint('PLAYER', true);
    } else if (Math.abs(ballPos.x) > 7) {
      // Out of bounds
      awardPoint(lastHitter === 'PLAYER' ? 'AI' : 'PLAYER', lastHitter !== 'PLAYER');
    }
    previousBallZ.current = ballPos.z;

    // Camera follow (Fixed-Height Arcade perspective)
    const cameraSpeed = 0.1;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerPos.current.x * 0.4, cameraSpeed);
    camera.position.y = 7;
    camera.position.z = playerPos.current.z + 8;
    camera.lookAt(0, 0, -3);
  });

  return {
    ballRef,
    playerPos,
    aiPos,
    isVisualSwinging
  };
}

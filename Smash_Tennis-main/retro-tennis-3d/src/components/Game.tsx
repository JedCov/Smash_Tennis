import { useRef, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import { Court } from './Court';
import { Character } from './Character';
import { Ball, type BallHandle } from './Ball';
import { GameHud } from './GameHud';
import { GameMenus } from './GameMenus';
import { useGameplayLoop } from '../hooks/useGameplayLoop';
import { useTennisGame } from '../hooks/useTennisGame';
import { GameState, type PlayerType } from '../types';


type SmashOpportunity = {
  active: boolean;
  startedAt: number;
  expiresAt: number;
  targetX: number;
  targetZ: number;
};

const OVERHEAD_SMASH_CONFIG = {
  netDistanceThreshold: 3.5,
  smashHeightThreshold: 2.6,
  maxSmashHeight: 6.2,
  playerForwardWindow: 3.0,
  playerBackWindow: 1.2,
  lateralWindow: 2.5,
  timingWindow: 0.95,
  slowdownAmount: 0.45,
  autoAlignmentStrength: 0.16,
  assistedPositionStrength: 0.12,
  assistedMaxStep: 0.09,
  smashSpeedMultiplier: 2.3,
  smashDownwardVelocity: -2.8,
  weakReturnSpeedMultiplier: 0.72,
  failWeakReturnRadius: 1.8,
  cameraShakeDuration: 0.32,
  cameraShakeIntensity: 0.18,
  retriggerCooldown: 0.9
};

const createEmptySmashOpportunity = (): SmashOpportunity => ({
  active: false,
  startedAt: 0,
  expiresAt: 0,
  targetX: 0,
  targetZ: 0
});

function triggerGameplayEvent(name: string) {
  window.dispatchEvent(new CustomEvent(name));
}


function getPointLabels(player: number, ai: number, isTiebreak: boolean) {
  if (isTiebreak) return { player: String(player), ai: String(ai) };

  if (player >= 3 && ai >= 3) {
    if (player === ai) return { player: '40', ai: '40' };
    return player > ai ? { player: 'AD', ai: '40' } : { player: '40', ai: 'AD' };
  }

  return {
    player: TENNIS_SCORES[player] || '0',
    ai: TENNIS_SCORES[ai] || '0'
  };
}

function LandingMarker({ ballRef, visible }: { ballRef: RefObject<BallHandle | null>, visible: boolean }) {
function LandingMarker({ ballRef, visible }: { ballRef: RefObject<BallHandle | null>; visible: boolean }) {
  const markerRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!markerRef.current || !ballRef.current) return;
    const ballPos = ballRef.current.getPosition();
    const ballVel = ballRef.current.getVelocity();
    markerRef.current.visible = visible;
    markerRef.current.position.set(
      ballPos.x,
      0.05,
      Math.max(-10, Math.min(10, ballPos.z + ballVel.z * 0.5))
    );
  });

  return (
    <mesh ref={markerRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.3, 0.4, 32]} />
      <meshBasicMaterial color="white" transparent opacity={0.3} />
    </mesh>
  );
}

function GameScene({
  onScore,
  gameState,
  setGameState,
  servingPlayer,
  serveSide,
  targetRallyLength,
  difficultyStats
}: {
  onScore: (winner: PlayerType) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  servingPlayer: PlayerType;
  serveSide: 'DEUCE' | 'AD';
  targetRallyLength: number;
  difficultyStats: {
    gameDifficultyMultiplier: number;
    pointDifficultyMultiplier: number;
    racketAccuracyRadius: number;
  };
}) {
  const { ballRef, playerPos, aiPos, isVisualSwinging } = useGameplayLoop({
    onScore,
    gameState,
    setGameState,
    servingPlayer,
    serveSide,
    targetRallyLength,
    difficultyStats
}: { 
    onScore: (winner: 'PLAYER' | 'AI') => void,
    gameState: GameState,
    setGameState: (state: GameState) => void,
    servingPlayer: 'PLAYER' | 'AI',
    serveSide: 'DEUCE' | 'AD',
    targetRallyLength: number,
    difficultyStats: {
        gameDifficultyMultiplier: number;
        pointDifficultyMultiplier: number;
        racketAccuracyRadius: number;
    }
}) {
  const ballRef = useRef<BallHandle>(null);
  const playerPos = useRef(new THREE.Vector3(0, 0, 9));
  const aiPos = useRef(new THREE.Vector3(0, 0, -9));
  const keys = useRef<{ [key: string]: boolean }>({});
  const mousePos = useRef({ x: 0, y: 0 });
  const { camera } = useThree();
  const playerFacingY = useRef(Math.PI);
  const smashOpportunity = useRef<SmashOpportunity>(createEmptySmashOpportunity());
  const smashCooldownUntil = useRef(0);
  const cameraShakeUntil = useRef(0);

  const [isSmashOpportunityVisible, setIsSmashOpportunityVisible] = useState(false);
  const [lastHitter, setLastHitter] = useState<'PLAYER' | 'AI' | null>(null);
  const [isVisualSwinging, setIsVisualSwinging] = useState(false);
  const [isVisualSmashing, setIsVisualSmashing] = useState(false);
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

  const calculateLegalShot = (fromPos: THREE.Vector3, isServe: boolean, toSide: 'PLAYER' | 'AI' = 'AI') => {
    // Target area depends on which side we are hitting to
    let targetZ = toSide === 'AI' ? (-4 - Math.random() * 5) : (4 + Math.random() * 5);
    let targetX = (Math.random() - 0.5) * 8;

    if (isServe) {
        // Enforce diagonal serve cross-court
        if (toSide === 'AI') {
            targetZ = -4.5; // In service box (approx -1 to -7 range)
            targetX = serveSide === 'DEUCE' ? -2.5 : 2.5; 
        } else {
            targetZ = 4.5; // In service box (approx 1 to 7 range)
            targetX = serveSide === 'DEUCE' ? 2.5 : -2.5;
        }
        // Add slight randomness to serve target
        targetX += (Math.random() - 0.5) * 2.0;
    }
    
    const dy = fromPos.y - 0.1; 
    // Scale vertical and horizontal velocity by point multipliers
    const baseVy = isServe ? 2.0 : 1.5;
    const vy = baseVy * difficultyStats.pointDifficultyMultiplier; 
    const g = 1.5; 
    
    const t = (vy + Math.sqrt(vy * vy + 2 * g * dy)) / g;
    
    const finalVel = new THREE.Vector3(
        (targetX - fromPos.x) / t,
        vy,
        (targetZ - fromPos.z) / t
    );

    // Apply game-level speed boost
    return finalVel.multiplyScalar(difficultyStats.gameDifficultyMultiplier);
  };

  const resetBall = useCallback((server: 'PLAYER' | 'AI') => {
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
    smashOpportunity.current = createEmptySmashOpportunity();
    setIsSmashOpportunityVisible(false);
    setIsVisualSmashing(false);
    playerFacingY.current = Math.PI;
  }, []);


  const startSmashOpportunity = (now: number, ballPos: THREE.Vector3) => {
    smashOpportunity.current = {
      active: true,
      startedAt: now,
      expiresAt: now + OVERHEAD_SMASH_CONFIG.timingWindow,
      targetX: ballPos.x,
      targetZ: THREE.MathUtils.clamp(ballPos.z, 2.1, OVERHEAD_SMASH_CONFIG.netDistanceThreshold)
    };
    setIsSmashOpportunityVisible(true);
    triggerGameplayEvent('smash:opportunity');
  };

  const endSmashOpportunity = () => {
    smashOpportunity.current = createEmptySmashOpportunity();
    setIsSmashOpportunityVisible(false);
  };

  const performOverheadSmash = (ballPos: THREE.Vector3, now: number) => {
    const targetX = THREE.MathUtils.clamp((Math.random() - 0.5) * 7.5, -4.5, 4.5);
    const targetZ = -9.5;
    const travelTime = 0.58;
    const smashVelocity = new THREE.Vector3(
      (targetX - ballPos.x) / travelTime,
      OVERHEAD_SMASH_CONFIG.smashDownwardVelocity,
      (targetZ - ballPos.z) / travelTime
    ).multiplyScalar(OVERHEAD_SMASH_CONFIG.smashSpeedMultiplier * difficultyStats.gameDifficultyMultiplier);

    ballRef.current?.setVelocity(smashVelocity);
    setLastHitter('PLAYER');
    consecutiveReturns.current++;
    cameraShakeUntil.current = now + OVERHEAD_SMASH_CONFIG.cameraShakeDuration;
    smashCooldownUntil.current = now + OVERHEAD_SMASH_CONFIG.retriggerCooldown;
    setIsVisualSmashing(true);
    setTimeout(() => setIsVisualSmashing(false), 320);
    endSmashOpportunity();
    triggerGameplayEvent('smash:activated');
    triggerGameplayEvent('vfx:overhead-smash');
    triggerGameplayEvent('audio:overhead-smash');
    playHitSound();
    keys.current['MouseDown'] = false;
    keys.current['Space'] = false;
  };

  const performWeakSmashFailReturn = (ballPos: THREE.Vector3) => {
    const weakReturnVel = calculateLegalShot(ballPos, false).multiplyScalar(OVERHEAD_SMASH_CONFIG.weakReturnSpeedMultiplier);
    ballRef.current?.setVelocity(weakReturnVel);
    setLastHitter('PLAYER');
    consecutiveReturns.current++;
    triggerGameplayEvent('smash:weak-return');
    playHitSound();
  };

  // Handle game start/reset
  useEffect(() => {
    if (gameState === GameState.SERVING) {
        resetBall(servingPlayer);
    }
  }, [gameState, resetBall, servingPlayer]);

  useFrame((state, delta) => {
    if (gameState !== GameState.PLAYING && gameState !== GameState.SERVING) return;

    // Use R3F state.mouse for accurate relative cursor position
    mousePos.current.x = state.mouse.x;
    mousePos.current.y = state.mouse.y;

    const ballPos = ballRef.current?.getPosition() || new THREE.Vector3();
    const ballVel = ballRef.current?.getVelocity() || new THREE.Vector3();
    const isSwinging = keys.current['Space'] || keys.current['MouseDown'];
    const now = state.clock.getElapsedTime();

    // Player Movement (High-response Mouse follow)
    let targetX = mousePos.current.x * 12.0;
    let targetZ = 6.0 + (-mousePos.current.y * 10.0); 

    if (gameState === GameState.SERVING && servingPlayer === 'PLAYER') {
        // Hard pin player behind baseline for service on correct side
        targetZ = 11.3; 
        targetX = serveSide === 'DEUCE' ? 3.0 : -3.0;
    }
    
    playerPos.current.x = THREE.MathUtils.lerp(playerPos.current.x, targetX, 0.95);
    playerPos.current.z = THREE.MathUtils.lerp(playerPos.current.z, targetZ, 0.95);

    playerPos.current.x = THREE.MathUtils.clamp(playerPos.current.x, -5.5, 5.5);
    playerPos.current.z = THREE.MathUtils.clamp(playerPos.current.z, 2, 11.5);

    if (gameState === GameState.PLAYING) {
        const activeSmash = smashOpportunity.current;
        const nearNet = playerPos.current.z <= OVERHEAD_SMASH_CONFIG.netDistanceThreshold;
        const ballIsHigh = ballPos.y >= OVERHEAD_SMASH_CONFIG.smashHeightThreshold && ballPos.y <= OVERHEAD_SMASH_CONFIG.maxSmashHeight;
        const ballIsIncoming = lastHitter === 'AI' && ballVel.z > 0.35;
        const ballIsInFront = ballPos.z >= playerPos.current.z - OVERHEAD_SMASH_CONFIG.playerBackWindow && ballPos.z <= playerPos.current.z + OVERHEAD_SMASH_CONFIG.playerForwardWindow;
        const ballIsReachableSideways = Math.abs(ballPos.x - playerPos.current.x) <= OVERHEAD_SMASH_CONFIG.lateralWindow;
        const canStartSmash = !activeSmash.active && now >= smashCooldownUntil.current && nearNet && ballIsHigh && ballIsIncoming && ballIsInFront && ballIsReachableSideways;

        if (canStartSmash) {
            startSmashOpportunity(now, ballPos);
        }

        if (smashOpportunity.current.active) {
            const smashTarget = smashOpportunity.current;
            const assistedX = THREE.MathUtils.clamp(smashTarget.targetX, -5.3, 5.3);
            const assistedZ = THREE.MathUtils.clamp(smashTarget.targetZ + 0.25, 2, OVERHEAD_SMASH_CONFIG.netDistanceThreshold);
            const nextAssistX = THREE.MathUtils.lerp(playerPos.current.x, assistedX, OVERHEAD_SMASH_CONFIG.assistedPositionStrength);
            const nextAssistZ = THREE.MathUtils.lerp(playerPos.current.z, assistedZ, OVERHEAD_SMASH_CONFIG.assistedPositionStrength);
            playerPos.current.x += THREE.MathUtils.clamp(nextAssistX - playerPos.current.x, -OVERHEAD_SMASH_CONFIG.assistedMaxStep, OVERHEAD_SMASH_CONFIG.assistedMaxStep);
            playerPos.current.z += THREE.MathUtils.clamp(nextAssistZ - playerPos.current.z, -OVERHEAD_SMASH_CONFIG.assistedMaxStep, OVERHEAD_SMASH_CONFIG.assistedMaxStep);

            const targetFacing = Math.PI + THREE.MathUtils.clamp((playerPos.current.x - ballPos.x) * 0.14, -0.35, 0.35);
            playerFacingY.current = THREE.MathUtils.lerp(playerFacingY.current, targetFacing, OVERHEAD_SMASH_CONFIG.autoAlignmentStrength);

            if (isSwinging && now <= smashTarget.expiresAt) {
                performOverheadSmash(ballPos, now);
                return;
            }

            if (now > smashTarget.expiresAt || ballPos.z > playerPos.current.z + OVERHEAD_SMASH_CONFIG.playerForwardWindow) {
                const closeEnoughForWeakReturn = Math.abs(ballPos.x - playerPos.current.x) <= OVERHEAD_SMASH_CONFIG.failWeakReturnRadius && ballPos.y < OVERHEAD_SMASH_CONFIG.maxSmashHeight;
                endSmashOpportunity();
                smashCooldownUntil.current = now + OVERHEAD_SMASH_CONFIG.retriggerCooldown;
                triggerGameplayEvent('smash:missed');
                if (closeEnoughForWeakReturn) {
                    performWeakSmashFailReturn(ballPos);
                }
            }
        } else {
            playerFacingY.current = THREE.MathUtils.lerp(playerFacingY.current, Math.PI, 0.12);
        }
    }

    // Serve Mechanics
    if (gameState === GameState.SERVING) {
        if (servingPlayer === 'PLAYER') {
            ballRef.current?.reset([playerPos.current.x + 0.4, 1.5, playerPos.current.z - 0.2], [0, 0, 0]);
            if (isSwinging) {
                const serveVel = calculateLegalShot(new THREE.Vector3(playerPos.current.x + 0.4, 1.5, playerPos.current.z - 0.2), true, 'AI');
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
                const serveVel = calculateLegalShot(new THREE.Vector3(aiPos.current.x - 0.4, 1.5, aiPos.current.z + 0.2), true, 'PLAYER');
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
    if (!smashOpportunity.current.active && isSwinging && ballPos.z > 3.0 && ballPos.z < 11.0 && lastHitter !== 'PLAYER' && ballPos.y < 4.0) {
        // Hit radius shrinks as games progress
        if (Math.abs(ballPos.x - playerPos.current.x) < difficultyStats.racketAccuracyRadius * 2.8) { 
            const playerReturnVel = calculateLegalShot(ballPos, false);
            ballRef.current?.setVelocity(playerReturnVel);
            setLastHitter('PLAYER');
            consecutiveReturns.current++;
            playHitSound();
            
            keys.current['MouseDown'] = false;
        }
    }

    const awardPoint = (winner: 'PLAYER' | 'AI', positiveForPlayer: boolean) => {
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
    const shakeRemaining = Math.max(0, cameraShakeUntil.current - now);
    const shake = shakeRemaining > 0 ? OVERHEAD_SMASH_CONFIG.cameraShakeIntensity * (shakeRemaining / OVERHEAD_SMASH_CONFIG.cameraShakeDuration) : 0;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerPos.current.x * 0.4, cameraSpeed) + (Math.random() - 0.5) * shake;
    camera.position.y = 7 + (Math.random() - 0.5) * shake;
    camera.position.z = playerPos.current.z + 8 + (Math.random() - 0.5) * shake;
    camera.lookAt(0, 0, -3);
  });

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
      <Sky sunPosition={[100, 20, 100]} />

      <Court />
      <Character initialPosition={[0, 0, 9]} positionRef={playerPos} color="#3b82f6" isSwinging={isVisualSwinging} isSmashing={isVisualSmashing} facingRotationYRef={playerFacingY} />
      <Character initialPosition={[0, 0, -9]} positionRef={aiPos} color="#ef4444" isAI />
      <Ball ref={ballRef} isActive={gameState === GameState.PLAYING} timeScale={isSmashOpportunityVisible ? OVERHEAD_SMASH_CONFIG.slowdownAmount : 1} isHighlighted={isSmashOpportunityVisible} />

      {isSmashOpportunityVisible && (
        <mesh position={[playerPos.current.x, 0.08, playerPos.current.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.05, 40]} />
          <meshBasicMaterial color="#facc15" transparent opacity={0.55} />
        </mesh>
      )}

      <LandingMarker ballRef={ballRef} visible={gameState === GameState.PLAYING} />
    </>
  );
}

export function Game() {
  const {
    score,
    addPoint,
    gameState,
    setGameState,
    startGame,
    winner,
    lastPointWinner,
    servingPlayer,
    serveSide,
    isTiebreak,
    targetRallyLength,
    difficultyStats
  } = useTennisGame();

  return (
    <div className="w-full h-full relative font-mono overflow-hidden bg-black select-none">
      <Canvas shadows={{ type: THREE.PCFShadowMap }}>
        <GameScene
          onScore={addPoint}
          gameState={gameState}
          setGameState={setGameState}
          servingPlayer={servingPlayer}
          serveSide={serveSide}
          targetRallyLength={targetRallyLength}
          difficultyStats={difficultyStats}
        />
      </Canvas>

      <GameHud
        score={score}
        gameState={gameState}
        servingPlayer={servingPlayer}
        isTiebreak={isTiebreak}
        targetRallyLength={targetRallyLength}
        difficultyStats={difficultyStats}
        lastPointWinner={lastPointWinner}
      />

      <GameMenus gameState={gameState} winner={winner} startGame={startGame} />
    </div>
  );
}

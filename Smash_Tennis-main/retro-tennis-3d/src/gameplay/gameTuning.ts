export const COURT_LENGTH = 23.77;
export const SINGLES_COURT_WIDTH = 8.23;
export const DOUBLES_COURT_WIDTH = 10.97;
export const COURT_WIDTH = DOUBLES_COURT_WIDTH;
export const NET_HEIGHT = 1.05;

export const COURT_RENDERING = {
  serviceLineZ: 6.4,
  lineWidth: 0.08,
  centerMarkLength: 0.4,
  surroundingWidth: 40,
  surroundingLength: 50,
  netPostPadding: 0.2,
  netPostHeight: 1.1,
  netTopBandHeight: 0.08,
  netDepth: 0.02,
  netTopBandDepth: 0.03
} as const;

export const OUT_OF_BOUNDS_LIMITS = {
  x: 7,
  playerBackZ: 14,
  aiBackZ: -14
} as const;

export const PLAYER_MOVEMENT_LIMITS = {
  minX: -5.5,
  maxX: 5.5,
  minZ: 2,
  maxZ: 11.5,
  serveZ: 11.3,
  deuceServeX: 3.0,
  adServeX: -3.0,
  smashAssistMinX: -5.3,
  smashAssistMaxX: 5.3
} as const;

export const SERVE_POSITIONS = {
  playerZ: 11.3,
  playerDeuceX: 3.0,
  playerAdX: -3.0,
  aiZ: -10.5,
  aiDeuceX: -3.0,
  aiAdX: 3.0,
  ballXOffset: 0.4,
  ballHeight: 1.5,
  ballZOffset: 0.2,
  aiDelaySeconds: 1.2
} as const;

export const AI_BASELINE_POSITION = {
  x: 0,
  z: -9,
  wobbleAmount: 1
} as const;

export const SHOT_TARGETS = {
  rallyXRange: 8,
  aiMinZ: -4,
  aiZRange: 5,
  playerMinZ: 4,
  playerZRange: 5,
  aiServeZ: -4.5,
  playerServeZ: 4.5,
  serveDeuceTargetX: 2.5,
  serveAdTargetX: -2.5,
  serveRandomXRange: 2.0
} as const;

export const OVERHEAD_SMASH_CONFIG = {
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
} as const;

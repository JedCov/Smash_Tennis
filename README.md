# Smash Tennis

## Play the game

Live playable version: https://jedbcov-coder.github.io/Smash_Tennis/

Smash Tennis is a retro-inspired 3D arcade tennis game. You control Blake, return shots against Hidalgo, and play a best-of-3-sets tennis match with simple mouse-and-click controls.

## Project type

This is a React + Vite browser game that uses Three.js through React Three Fiber. It is a static site, which means GitHub Pages can host the built files without a server.

## Controls

- Move player: move your mouse left, right, forward, and backward.
- Serve: click or press Space when it is your serve.
- Swing / smash: click or press Space when the ball comes back to your side. If you are close to the net and a high ball comes overhead, click or press Space during the glowing slow-motion window to smash it.

## Main features

- 3D tennis court with arcade-style camera and low-poly players.
- Player-vs-AI rallies with configurable rally pacing.
- Net-front overhead smash opportunity with ball highlight, brief slow motion, assisted positioning, camera shake hooks, and weak-return miss handling.
- Tennis scoring with points, games, sets, server rotation, and tiebreak support.
- Scoreboard, serve prompts, point feedback, sound effects, and replay flow.
- Lightweight browser build powered by React, Vite, Three.js, and React Three Fiber.

## Code organization

The main game app lives in `Smash_Tennis-main/retro-tennis-3d`.

Important files:

- `src/components/Game.tsx` wires the 3D scene, HUD, and menus together.
- `src/components/GameHud.tsx` shows the in-game overlays.
- `src/components/GameMenus.tsx` shows the start and game-over screens.
- `src/hooks/useGameplayLoop.ts` runs the frame-by-frame gameplay logic.
- `src/gameplay/shotPhysics.ts` calculates shot direction and speed.

## How to run locally

1. Open a terminal in the `Smash_Tennis-main/retro-tennis-3d` folder.
2. Install the project files once with `npm install`.
3. Start the local version with `npm run dev`.
4. Open the local link shown in the terminal, usually `http://localhost:3000/`.

## Useful checks

```bash
npm run lint
npm run build
```

`npm run lint` checks that TypeScript can understand the project. `npm run build` creates the production-ready files in `dist`.

## Deployment notes

The Vite app is configured for GitHub Pages at `/Smash_Tennis/`. A production build creates the static `dist` folder, and the post-build script creates a `404.html` fallback so GitHub Pages can serve the game correctly. If you deploy with GitHub Actions, make sure the workflow runs the build from `Smash_Tennis-main/retro-tennis-3d` and publishes that `dist` folder.

Important GitHub Pages settings:

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Set **Build and deployment → Source** to **GitHub Actions**.
4. Push or merge changes into `main`.
5. Open https://jedbcov-coder.github.io/Smash_Tennis/ after the deployment finishes.

The Vite base path is set to `/Smash_Tennis/` because GitHub Pages serves this project from `https://jedbcov-coder.github.io/Smash_Tennis/`, not from the root of the domain.

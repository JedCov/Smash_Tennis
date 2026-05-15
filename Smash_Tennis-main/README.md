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
- Net-front overhead smash opportunity with ball highlight, brief slow motion, assisted positioning, smash flash, screen-shake overlay, text burst feedback, and weak-return miss handling.
- Tennis scoring with points, games, sets, server rotation, and tiebreak support.
- Scoreboard, serve prompts, smash-ready/missed feedback, point feedback, sound effects, and replay flow.
- Lightweight browser build powered by React, Vite, Three.js, and React Three Fiber.

## Code organization

The main game screen is split into small files so it is easier to maintain: `Game.tsx` wires the scene together, `GameHud.tsx` shows the in-game overlays, `GameVfx.tsx` listens for smash events and shows simple visual effects, `GameMenus.tsx` shows the start and game-over screens, `useGameplayLoop.ts` runs the frame-by-frame gameplay logic, `shotPhysics.ts` calculates shot direction and speed, and `gameTuning.ts` keeps shared court, serve, boundary, movement, AI, and smash tuning numbers in one place.

## How to run locally

1. Open a terminal in the `retro-tennis-3d` folder.
2. Install the project files once with `npm install`.
3. Start the local version with `npm run dev`.
4. Open the local link shown in the terminal, usually `http://localhost:3000/`.

## Deployment notes

This repository is set up to publish the latest game build with GitHub Pages. The workflow in `../.github/workflows/deploy.yml` builds the app from `Smash_Tennis-main/retro-tennis-3d` and publishes `Smash_Tennis-main/retro-tennis-3d/dist`. The production build creates a `404.html` fallback, and the workflow adds a `.nojekyll` marker file so GitHub Pages serves the game correctly.

Important GitHub Pages settings:

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Set **Build and deployment → Source** to **GitHub Actions**.
4. Push or merge changes into `main`, or start the workflow manually from the GitHub Actions tab.
5. Open https://jedbcov-coder.github.io/Smash_Tennis/ after the deployment finishes.

The Vite base path stays set to `/Smash_Tennis/` in `retro-tennis-3d/vite.config.ts` because GitHub Pages serves this project from `https://jedbcov-coder.github.io/Smash_Tennis/`, not from the root of the domain.

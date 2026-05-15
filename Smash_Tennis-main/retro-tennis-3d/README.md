# Retro Tennis 3D

## Play the game

Live playable version: https://jedbcov-coder.github.io/Smash_Tennis/

Retro Tennis 3D is a simple, retro-styled browser tennis game. You play as Blake against Hidalgo, an AI opponent, on a bright 3D court with arcade pacing and tennis-style scoring.

## Project type

This is a React + Vite browser game that uses Three.js through React Three Fiber. It is built into a static `dist` folder for GitHub Pages.

## Controls

- Move player: move your mouse around the screen.
- Serve: click or press Space when the prompt says it is your serve.
- Swing / smash: click or press Space when the ball reaches your side. If you are close to the net and a high ball comes overhead, click or press Space during the glowing slow-motion window to smash it.

## Main features

- Low-poly 3D tennis court, ball, rackets, players, net, and camera.
- Player-vs-AI rallies with a gradually increasing rally target and speed.
- New net-front overhead smash opportunity with ball highlight, brief slow motion, assisted positioning, camera shake hooks, and weak-return miss handling.
- Tennis scoring with points, games, sets, server indicators, and tiebreak support.
- Clear serve prompts, point-winner feedback, scoreboard, sound effects, and replay button.
- Lightweight Vite build for easy local testing and static deployment.

## Code organization

The main game screen is split into small files so it is easier to maintain: `Game.tsx` wires the scene together, `GameHud.tsx` shows the in-game overlays, `GameMenus.tsx` shows the start and game-over screens, `useGameplayLoop.ts` runs the frame-by-frame gameplay logic, and `shotPhysics.ts` calculates shot direction and speed.

## Run locally

**Prerequisite:** install Node.js first.

1. Open a terminal in this `retro-tennis-3d` folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the game:

   ```bash
   npm run dev
   ```

4. Open the local link shown in the terminal, usually `http://localhost:3000/`.

## Useful checks

```bash
npm run lint
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

`npm run lint` checks that TypeScript can understand the project. `npm run build` creates the production-ready files in `dist`. `npm run preview` lets you test the built GitHub Pages version locally at `http://127.0.0.1:4173/Smash_Tennis/`.

## Deployment notes

This repository is set up to publish the latest game build with GitHub Pages. The workflow in `../.github/workflows/deploy.yml` builds this Vite app and publishes the generated `dist` folder. The production build also creates a `404.html` fallback and a `.nojekyll` file so GitHub Pages serves the game correctly.

Important GitHub Pages settings:

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Set **Build and deployment → Source** to **GitHub Actions**.
4. Push or merge changes into `main`.
5. Open https://jedbcov-coder.github.io/Smash_Tennis/ after the deployment finishes.

The Vite base path is set to `/Smash_Tennis/` because GitHub Pages serves this project from `https://jedbcov-coder.github.io/Smash_Tennis/`, not from the root of the domain.

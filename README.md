# Smash Tennis

Smash Tennis is a retro-inspired 3D browser tennis game. You control Blake, return shots against Hidalgo, and play a best-of-3-sets tennis match with simple mouse-and-click controls.

## Live demo / playable link

Live version: https://jedbcov-coder.github.io/Smash_Tennis/

## What this project does

This is a React + Vite game that runs in the browser. It uses Three.js through React Three Fiber for the 3D court, players, ball, and camera. The app builds into static files, so GitHub Pages can host it without a separate server.

## Features

- 3D tennis court with arcade-style camera and low-poly players.
- Player-vs-AI rallies with configurable rally pacing.
- Net-front overhead smash opportunity with ball highlight, brief slow motion, assisted positioning, camera shake hooks, and weak-return miss handling.
- Tennis scoring with points, games, sets, server rotation, brief point-result pause, and tiebreak support.
- Scoreboard, serve prompts, brief point-result banner, sound effects, and replay flow.
- Lightweight browser build powered by React, Vite, Three.js, and React Three Fiber.

## Controls / How to use

- Move player: move your mouse left, right, forward, and backward.
- Serve: click or press Space when it is your serve.
- Swing / smash: click or press Space when the ball comes back to your side.
- Overhead smash: if you are close to the net and a high ball comes overhead, click or press Space during the glowing slow-motion window.

## How to run locally

**Prerequisite:** install Node.js first.

1. Open a terminal in `Smash_Tennis-main/retro-tennis-3d`.
2. Install the project files once:

   ```bash
   npm install
   ```

3. Start the local version:

   ```bash
   npm run dev
   ```

4. Open the local link shown in the terminal, usually `http://localhost:3000/`.

## Project structure

- `Smash_Tennis-main/retro-tennis-3d` contains the Vite game app.
- `Smash_Tennis-main/retro-tennis-3d/src/App.tsx` starts the main app screen.
- `Smash_Tennis-main/retro-tennis-3d/src/components/Game.tsx` wires the 3D scene, HUD, and menus together.
- `Smash_Tennis-main/retro-tennis-3d/src/components/GameHud.tsx` shows the in-game overlays.
- `Smash_Tennis-main/retro-tennis-3d/src/components/GameMenus.tsx` shows the start and game-over screens.
- `Smash_Tennis-main/retro-tennis-3d/src/hooks/useGameplayLoop.ts` runs the frame-by-frame gameplay logic.
- `Smash_Tennis-main/retro-tennis-3d/src/gameplay/shotPhysics.ts` calculates shot direction and speed.
- `Smash_Tennis-main/retro-tennis-3d/src/gameplay/gameTuning.ts` keeps shared court, serve, boundary, movement, AI, and smash tuning numbers in one place.
- `.github/workflows/deploy.yml` builds the app and publishes it to GitHub Pages.

## Known issues

- Production builds can show a non-blocking Vite chunk-size warning because the 3D/game libraries bundle into a large JavaScript file. The build still completes successfully.
- npm can show environment-specific warnings on some machines. If `npm run build` finishes, those warnings are not deployment blockers.

## Planned improvements

- Keep tuning rally feel, AI difficulty, and smash timing.
- Consider code-splitting later if the production bundle size becomes a real loading problem.

## Notes

Deployment is automatic through GitHub Actions. The workflow at `.github/workflows/deploy.yml` runs when changes are pushed to `main` or when it is started manually from the GitHub Actions tab.

What the workflow does:

1. Checks out the repository.
2. Installs dependencies inside `Smash_Tennis-main/retro-tennis-3d` with `npm ci`.
3. Runs `npm run build` in `Smash_Tennis-main/retro-tennis-3d`.
4. Adds a `.nojekyll` marker file to the built `dist` folder.
5. Publishes `Smash_Tennis-main/retro-tennis-3d/dist` to GitHub Pages.

Important GitHub Pages settings:

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Set **Build and deployment → Source** to **GitHub Actions**.
4. Push or merge changes into `main`.
5. Open https://jedbcov-coder.github.io/Smash_Tennis/ after the deployment finishes.

The Vite base path stays set to `/Smash_Tennis/` in `Smash_Tennis-main/retro-tennis-3d/vite.config.ts` because GitHub Pages serves this project from `https://jedbcov-coder.github.io/Smash_Tennis/`, not from the root of the domain.

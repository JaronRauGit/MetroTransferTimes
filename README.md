# Between the Lines

A small, interactive Barcelona metro diorama for estimating the time it takes to change lines. The station is rendered with real 3D meshes in an orthographic view. Its street, concourse, moving walkway, stairs, escalator and platform form a continuous cutaway world; a three-car train arrives, opens its doors and departs.

## Run

Requires Node.js 20.19+ or 22.12+ (Node 24 is supported).

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. To check a production build, run `npm run build` and `npm run preview`. Run the calculation tests with `npm test`.

## How it works

Enter distances or leave a field blank for zero. The estimate adds walking metres ÷ 1.3 m/s, escalator steps ÷ 1.5 steps/s, stair steps ÷ 1.9 steps/s, and moving walkway metres ÷ 0.5 m/s. Example routes fill the inputs. Calculating a route animates a marker through the 3D station; you can edit the values or start over.

The app uses React and React Three Fiber. The reusable world pieces are in `src/world/`: `StationWorld.jsx` assembles the levels and lighting, `Architecture.jsx` supplies the buildings and station infrastructure, `Train.jsx` models and animates the train, `Details.jsx` contains people, signs and route feedback, and `Primitives.jsx` supplies shared geometry and materials. `src/components/CalculatorPanel.jsx` is the HTML interface. No external assets, accounts or services are needed at runtime.

Drag to turn the orthographic camera and scroll to zoom. The renderer caps pixel density, uses a half-resolution ambient occlusion pass and a compact shadow map, and reduces animation for users who request reduced motion.

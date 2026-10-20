# Between the Lines

A miniature Barcelona metro cutaway for estimating the time it takes to change lines. Scroll from a Passeig de Gràcia streetscape through an L3 platform and connecting tunnel to an L4 platform. The fixed orthographic view reveals each level as the layers above become translucent. Two four-car trains arrive, open their doors and depart.

## Run

Requires Node.js 20.19+ or 22.12+ (Node 24 is supported).

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. To check a production build, run `npm run build` and `npm run preview`. Run the calculation tests with `npm test`.

## How it works

Enter distances or leave a field blank for zero. The estimate adds walking metres ÷ 1.3 m/s, escalator steps ÷ 1.5 steps/s, stair steps ÷ 1.9 steps/s, and moving walkway metres ÷ 0.5 m/s. The transfer model changes as you type: walking distance stretches the tunnel, a moving walkway only appears when its length is nonzero, escalator steps add an escalator and stair steps change the stair detail. The drawing uses a curved scale so long transfers remain visible; it is a schematic interpretation rather than a measured station plan. Example routes fill the inputs. Calculating animates a marker along the transfer and moves the view underground; you can edit the values or start over.

The app uses React and React Three Fiber. The reusable world pieces are in `src/world/`: `StationWorld.jsx` assembles the levels, fixed camera, scroll fading and lighting; `stationLayout.js` maps transfer values to geometry; `Architecture.jsx` supplies buildings and station infrastructure; `Train.jsx` models and animates the trains; `Details.jsx` contains people and signs; and `Primitives.jsx` supplies shared geometry and materials. `src/components/CalculatorPanel.jsx` is the HTML interface. No external assets, accounts or services are needed at runtime.

Scroll the page, swipe on touchscreens or use the level buttons to move between the street, transfer tunnel and lower platform. The camera angle stays fixed. The renderer caps pixel density, uses a half-resolution ambient occlusion pass and a compact shadow map, and reduces animation for users who request reduced motion.

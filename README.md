# Between the Lines

An interactive miniature Barcelona metro interchange for estimating transfer time. The default Verdaguer scene shows a narrow street above two orthogonal underground platforms, with an entrance cut into the pavement, fare gates, connecting stairs and escalator, and four-car L4/L5 trains. The camera starts with the whole cutaway in view: drag to turn it and scroll to zoom.

## Run

Requires Node.js 20.19+ or 22.12+ (Node 24 is supported).

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Run `npm run build` to check the production bundle and `npm test` for the calculation and layout tests.

## How it works

Name the station and choose the two metro lines in the dock below the scene. The line colors, train markings, and signs update immediately. Enter transfer distances or leave a field blank for zero. The estimate adds walking metres ÷ 1.3 m/s, escalator steps ÷ 1.5 steps/s, stair steps ÷ 1.9 steps/s, and moving walkway metres ÷ 0.5 m/s. Walking distance changes the visible tunnel length; a moving walkway appears only when its input is positive; stair and escalator steps change their detail. The entrance and the basic stairs and escalator stay in place. The scene is schematic, with a curved visual scale that keeps long transfers in view. The example routes fill and calculate the inputs. Calculating lights a route through the station.

The scene is built from React Three Fiber meshes in `src/world/`. `StationWorld.jsx` assembles the cutaway and orbit camera, `stationLayout.js` maps inputs to geometry, `Surface.jsx` builds the Barcelona streetscape and metro entrance, `Architecture.jsx` supplies station structures, `Train.jsx` animates trains behind track portals, and `PeopleFlow.jsx` moves commuters between the platforms and street. `lineCatalog.js` defines the line palette. `src/components/CalculatorPanel.jsx` is the HTML calculator dock. The renderer caps pixel density, uses ambient occlusion and contact shadows, and respects reduced-motion preferences. No external assets, accounts, or services are needed at runtime.

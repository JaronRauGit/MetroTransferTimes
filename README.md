# Between the Lines

An interactive miniature Barcelona metro interchange for estimating transfer time. The default Verdaguer scene starts with a 200 m walk, 30 m escalator, 12 m of stairs, and 35 m moving walkway. A narrow Barcelona street sits above two orthogonal L4/L5 platforms: the lower train passes underneath the upper line, and a separate passage connects them. The camera starts with the whole cutaway in view: drag to turn it and scroll to zoom.

## Run

Requires Node.js 20.19+ or 22.12+ (Node 24 is supported).

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Run `npm run build` to check the production bundle and `npm test` for the calculation and layout tests.

## How it works

Name the station and choose the two metro lines in the dock below the scene. The station name appears on the entrance; interior line signs attach to the track and passage walls. The line colors and train markings update immediately. The coloured line menus show every available line and support arrow keys, Home/End, Enter, and Escape. Always-visible station preset cards load Verdaguer, Passeig de Gràcia, Diagonal, or Catalunya in one click, including the name, line pair, lengths, and calculation. These are clearly labelled illustrative lengths, not surveyed station data. Editing a loaded example clears its selected highlight. All four inputs are lengths in metres; blank fields count as zero. The estimate adds the four segment times using 1.3 m/s for walking, 0.5 m/s for standing on an escalator, 0.65 m/s on stairs, and 1.8 m/s for walking on a moving walkway (walking plus belt speed).

Tunnel length, escalator run and rise, and stair run and rise grow with their inputs. The passage has a generous minimum span and a pronounced response to walking distance; its curve still approaches a finite limit so extreme distances keep a usable miniature. The exposed upper railway extends with the passage to continue across the lower line, ending in a short hollow tunnel sleeve, and the streetscape fills the longer block with buildings. The fixed entrance lands on the upper platform, with fare gates across the walking direction at the foot of its stairs. Floor heights, landings, walking paths and train clearance envelopes share one layout model. Moving walkways appear only for positive inputs. Commuters use ramps onto the belt, accelerate while on it, and use a separate lane for the return journey. Calculating lights the route and animates a bubble along the same path. Trains enter and leave through hollow track tunnels; their clipping boundaries sit inside the tunnel sleeves. The upper train travels along the complete exposed track before disappearing inside its terminal sleeve, even at maximum passage length. The layout is a schematic interpretation rather than a measured station plan.

Turn the model all the way around to discover the creators’ terrace behind the station wall: a broad tiled gallery with four friends around a concrete arch, planted edges, and a suspended model jet. The larger figures have distinct hair, glasses, facial hair, clothing, shoes, and poses inspired by the airport photo; the foreground friend has a larger scale to echo the photo’s perspective. The jet sits to one side so the faces remain clear. `CreatorsNook.jsx` builds the portrait from real geometry, including denim seams, backpack straps, a scarf, concrete aggregate, and the aircraft’s landing gear. Scroll over a detail to zoom towards it; the camera supports up to four times its initial zoom. The terrace exports its bounds to keep camera fitting in sync with its geometry.

The scene is built from React Three Fiber meshes in `src/world/`. `StationWorld.jsx` assembles the cutaway and fits the orbit camera to its geometry, `stationLayout.js` defines the dimensions and clearance envelopes, `Surface.jsx` builds the Barcelona streetscape and entrance, and `Architecture.jsx` supplies the structures. `Train.jsx` and `trainSchedule.js` model the train cycle; `journeyPaths.js` and `PeopleFlow.jsx` define and animate the commuter routes and calculation bubble. `lineCatalog.js` defines the line palette. `src/components/CalculatorPanel.jsx` is the HTML calculator dock; `LineSelect.jsx` provides its keyboard-accessible, portal-based line menus so they remain visible above the scrolling mobile dock. The tests check clearances, landings and walking routes across 256 input combinations, bounded growth, and train/door timing. The renderer caps pixel density, uses ambient occlusion and contact shadows, and respects reduced-motion preferences. No external assets, accounts, or services are needed at runtime.

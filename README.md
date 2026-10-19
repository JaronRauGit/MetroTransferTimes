# Between the Lines

A small, animated Barcelona metro station wrapped around a transfer time calculator. The cutaway station has a street level, stairs, escalator, moving walkway, platform, commuters, and a train that arrives, opens its doors, and leaves. Calculating a route lights up a path through the scene.

## Run locally

This is a static site with no build or package installation. From this directory, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/` in a browser. The app also works by opening `index.html` directly.

## Calculator

Enter nonnegative distances, or leave a field blank for zero. The estimate adds:

- Walking metres / 1.3 metres per second
- Escalator steps / 1.5 steps per second
- Stair steps / 1.9 steps per second
- Moving walkway metres / 0.5 metres per second

The time is displayed in minutes and seconds, with the precise total in seconds below it. The two example routes fill the inputs and calculate immediately. Start another journey clears the form and result.

The artwork is an inline SVG in `index.html`; `style.css` handles its animation and responsive layout, and `script.js` handles the calculator. Animations respect the user's reduced motion preference.

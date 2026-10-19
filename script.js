'use strict';

const speeds = {
  walkDistance: 1.3,
  escalatorDistance: 1.5,
  numSteps: 1.9,
  walkwayLength: 0.5
};
const form = document.getElementById('timeEstimationForm');
const station = document.querySelector('.station');
const result = document.getElementById('result');
const timeDisplay = document.getElementById('result-time');
const secondsDisplay = document.getElementById('result-seconds');
const progress = document.getElementById('result-progress');
const resetButton = document.getElementById('resetButton');
const presets = {
  quick: { walkDistance: 65, escalatorDistance: 0, numSteps: 12, walkwayLength: 0 },
  long: { walkDistance: 180, escalatorDistance: 24, numSteps: 32, walkwayLength: 45 }
};

function calculateTime(event) {
  if (event) event.preventDefault();
  if (!form.reportValidity()) return;

  let seconds = 0;
  for (const [id, speed] of Object.entries(speeds)) {
    const input = document.getElementById(id);
    const value = input.value.trim() === '' ? 0 : Number(input.value);
    if (!Number.isFinite(value) || value < 0) {
      input.setCustomValidity('Enter a positive distance or leave this blank.');
      input.reportValidity();
      return;
    }
    seconds += value / speed;
  }

  const roundedSeconds = Math.round(seconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const remainingSeconds = String(roundedSeconds % 60).padStart(2, '0');
  timeDisplay.textContent = `${minutes} min ${remainingSeconds} sec`;
  secondsDisplay.textContent = `${seconds.toFixed(2)} seconds`;
  result.hidden = false;
  station.classList.add('has-result');
  station.classList.remove('journey-active');
  void station.offsetWidth;
  station.classList.add('journey-active');
  progress.style.width = '0%';
  requestAnimationFrame(() => requestAnimationFrame(() => { progress.style.width = '100%'; }));
}

form.addEventListener('submit', calculateTime);
form.addEventListener('input', event => {
  if (event.target instanceof HTMLInputElement) {
    event.target.setCustomValidity('');
    result.hidden = true;
    station.classList.remove('has-result', 'journey-active');
  }
});
for (const button of document.querySelectorAll('[data-preset]')) {
  button.addEventListener('click', () => {
    const values = presets[button.dataset.preset];
    for (const [id, value] of Object.entries(values)) document.getElementById(id).value = value;
    calculateTime();
  });
}
resetButton.addEventListener('click', () => {
  form.reset();
  result.hidden = true;
  station.classList.remove('has-result', 'journey-active');
  progress.style.width = '0%';
  document.getElementById('walkDistance').focus();
});

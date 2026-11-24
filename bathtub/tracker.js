// tracker.js: Lab 9. Records where the mouse goes over the form, how long
// it rests on each field, and saves each finished run.
//
// The student writes this file, part by part, from the handout.
// heatmap.js runs first and defines RUNS_KEY, loadRuns(), toggleHeatmap(),
// downloadRuns() and clearRuns(), which this file can use.

// Part 1: the mouse path.
const form = document.querySelector("form");
const trackerStatus = document.querySelector("#tracker-status");
// A point every 100 milliseconds is enough to draw a path.
const SAMPLE_MS = 100;
let points = [];
let lastSample = 0;
form.addEventListener("mousemove", (event) => {
const now = Date.now();
if (now - lastSample < SAMPLE_MS) {
return;
}
lastSample = now;
const box = form.getBoundingClientRect();
points.push({
x: Math.round(event.clientX - box.left),
y: Math.round(event.clientY - box.top),
});
trackerStatus.textContent = `Recording: ${points.length} points`;
});

// Part 2: time on each field.
const hoverStatus = document.querySelector("#hover-status");
const fields = document.querySelectorAll("input, select, textarea");
let hover = {};
let hoverStart = 0;
for (const field of fields) {
field.addEventListener("mouseenter", () => {
hoverStart = Date.now();
});
field.addEventListener("mouseleave", () => {
if (hover[field.name] === undefined) {
hover[field.name] = 0;
}
hover[field.name] += Date.now() - hoverStart;
const seconds = (hover[field.name] / 1000).toFixed(1);
hoverStatus.textContent = `${field.name}: ${seconds} s`;
});
}

// Part 3: save the run when the form is sent.

let startTime = Date.now();
form.addEventListener("submit", () => {
const run = {
when: new Date().toISOString(),
seconds: Math.round((Date.now() - startTime) / 1000),
width: Math.round(form.getBoundingClientRect().width),
points: points,
hover: hover,
};
const runs = loadRuns();
runs.push(run);
localStorage.setItem(RUNS_KEY, JSON.stringify(runs));
document.querySelector("#tracking").value = JSON.stringify(run);
// Going Back can show this page as it was left, so a new run starts.
points = [];
hover = {};
startTime = Date.now();
});
// Part 4: the heat map buttons.
const showButton = document.querySelector("#heat-button");
const downloadButton = document.querySelector("#download-button");
const clearButton = document.querySelector("#clear-button");
showButton.addEventListener("click", () => {
toggleHeatmap();
});
downloadButton.addEventListener("click", () => {
downloadRuns();
});
clearButton.addEventListener("click", () => {
clearRuns();
});
// AI use (one line): what was asked of Claude, or "none".

// heatmap.js: given for Lab 9. Draws every saved run over the form.
//
// tracker.js records each run and saves it under RUNS_KEY. This file reads
// the runs back, draws their points on the canvas laid over the form, and
// lists the hover times. Part 4 of the handout reads it and changes the two
// DOT_ constants; nothing else here needs to change.
//
// This file defines constants and functions only. Every element is looked
// up inside the function that uses it, so no name here can clash with a
// const in script.js or tracker.js.

// The localStorage key the runs are saved under. tracker.js saves with the
// same key, so the two files have to agree on it.
const RUNS_KEY = "bathtub-runs";

// Each saved point is drawn as a faint dot. Where the mouse went often, thesquare
// dots overlap and the color builds up: that build-up is the "heat".
// The last number in rgba() is the opacity, from 0 (clear) to 1 (solid).
const DOT_RADIUS = 5;
const DOT_COLOUR = "rgba(0, 140, 4, 0.2)";

// A run recorded at a different form width would not line up with the
// form on screen (one column on a phone, two from 700 pixels), so only
// runs within this many pixels of the current width are drawn.
const WIDTH_TOLERANCE = 40;

// Every saved run, as an array. An empty store gives an empty array.
function loadRuns() {
    const saved = localStorage.getItem(RUNS_KEY);
    if (saved === null) {
        return [];
    }
    return JSON.parse(saved);
}

// The runs recorded at about the given form width.
function matchingRuns(runs, width) {
    const matching = [];
    for (const run of runs) {
        if (Math.abs(run.width - width) <= WIDTH_TOLERANCE) {
            matching.push(run);
        }
    }
    return matching;
}

// Draws every matching run's points on the canvas.
function drawHeatmap() {
    const form = document.querySelector("form");
    const canvas = document.querySelector("#heatmap");
    const summary = document.querySelector("#heat-summary");

    // The canvas is given the form's size in pixels, so a point saved as
    // (x, y) from the form's top-left corner lands on the same spot.
    const box = form.getBoundingClientRect();
    canvas.width = Math.round(box.width);
    canvas.height = Math.round(box.height);

    const pen = canvas.getContext("2d");
    pen.clearRect(0, 0, canvas.width, canvas.height);
    pen.fillStyle = DOT_COLOUR;

    const runs = loadRuns();
    const shown = matchingRuns(runs, box.width);
    for (const run of shown) {
        for (const point of run.points) {
            pen.beginPath();
            pen.arc(point.x, point.y, DOT_RADIUS, 0, 2 * Math.PI);
            pen.fill();
        }
    }

    summary.textContent = `Showing ${shown.length} of ${runs.length} ` +
        "saved runs.";
    if (shown.length < runs.length) {
        summary.textContent += " The others were recorded at a " +
            "different window width.";
    }
    listHoverTimes(shown);
}

// Lists each field's average hover time over the given runs, longest
// first.
function listHoverTimes(runs) {
    const list = document.querySelector("#hover-times");
    list.textContent = "";
    if (runs.length === 0) {
        return;
    }

    // Total milliseconds per field name, over every run.
    const totals = {};
    for (const run of runs) {
        for (const name in run.hover) {
            if (totals[name] === undefined) {
                totals[name] = 0;
            }
            totals[name] += run.hover[name];
        }
    }

    const names = Object.keys(totals);
    names.sort((a, b) => totals[b] - totals[a]);
    for (const name of names) {
        const seconds = totals[name] / runs.length / 1000;
        const item = document.createElement("li");
        item.textContent = `${name}: ${seconds.toFixed(1)} s on average`;
        list.append(item);
    }
}

// Shows the heat map if it is hidden, and hides it if it is shown.
function toggleHeatmap() {
    const canvas = document.querySelector("#heatmap");
    const button = document.querySelector("#heat-button");
    canvas.classList.toggle("hidden");
    if (canvas.classList.contains("hidden")) {
        button.textContent = "Show heat map";
        document.querySelector("#heat-summary").textContent = "";
        document.querySelector("#hover-times").textContent = "";
    } else {
        button.textContent = "Hide heat map";
        drawHeatmap();
    }
}

// Saves every run as a file, bathtub-runs.json, in the Downloads folder.
function downloadRuns() {
    const text = JSON.stringify(loadRuns(), null, 2);
    const file = new Blob([text], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "bathtub-runs.json";
    link.click();
}

// Deletes every saved run, after asking.
function clearRuns() {
    if (!confirm("Delete every saved run?")) {
        return;
    }
    localStorage.removeItem(RUNS_KEY);
    if (!document.querySelector("#heatmap").classList.contains("hidden")) {
        drawHeatmap();
    }
}

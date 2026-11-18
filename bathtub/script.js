const rulesButton = document.querySelector("#rules-button");
const rules = document.querySelector("#rules");
rulesButton.addEventListener("click", () => {
rules.classList.toggle("hidden");
});
const postal = document.querySelector("#postal");
const city = document.querySelector("#city");
const province = document.querySelector("#province");
const place = document.querySelector("#postal-place");
postal.addEventListener("input", () => {
postal.value = postal.value.toUpperCase();
if (postal.validity.patternMismatch) {
postal.setCustomValidity("Use a Canadian postal code, like V9R 5S5.");
} else {
postal.setCustomValidity("");
}
});
postal.addEventListener("change", () => {
if (postal.value === "" || !postal.checkValidity()) {
place.textContent = "";
return;
}
const area = postal.value.slice(0, 3);
fetch(`https://api.zippopotam.us/ca/${area}`)
.then((response) => response.json())
.then((data) => {
const found = data.places[0];
place.textContent = `${area}: ${found["place name"]}, ` +
found["state"];
province.value = found["state abbreviation"];
if (city.value === "") {
city.value = found["place name"];
}
})
.catch(() => {
place.textContent = "No match for that postal code.";
});
});

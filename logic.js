'use strict';

// PDF-Upload und Anzeige

document.getElementById("pdfUpload").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        document.getElementById("pdfViewer").setAttribute("src", url);
    }
});

// Checkboxes aktualisieren

function updateCheckboxes() {
    document.querySelectorAll("tr").forEach(row => {
        const input = row.querySelector(".maxValue");
        let container = row.querySelector(".checkbox-container");

        if (!input || !container) return;

        // 🧠 Zustände merken, bevor sie gelöscht werden
        const oldStates = Array.from(container.children).map(box => box.dataset.state);

        container.innerHTML = ""; // Alte Checkboxes entfernen
        let thText = row.querySelector("th").innerText.trim();
        let states;
        let max;

        switch (thText) {
            case "Hunger":
                states = ["blood"];
                max = parseInt(input.value);
                break;
            case "Resonanz":
                states = ["cross"];
                max = 3; // ← immer 3 Boxen bei Resonanz
                break;
            case "Menschlichkeit":
                states = ["cross"];
                max = parseInt(input.value);
                break;
            case "Gesundheit":
            case "Willenskraft":
                states = ["strike1", "cross"];
                max = parseInt(input.value);
                break;
            default:
                states = [];
                max = 0;
        }



        // Neue Checkboxen erzeugen und gespeicherte Zustände wieder zuweisen
        for (let i = 0; i < max; i++) {
            let box = document.createElement("div");
            box.classList.add("checkbox");
            

            let state = parseInt(oldStates[i] || "0");
            box.dataset.state = state;
            if (state > 0) box.classList.add(states[state - 1]);

            box.addEventListener("click", function () {
                let s = parseInt(this.dataset.state);
                s = (s + 1) % (states.length + 1);
                this.dataset.state = s;
            
                this.className = "checkbox";

            
                if (states.includes("blood")) {
                    this.classList.toggle("blood", s > 0);  // ← toggle magic here
                }
            
                if (s > 0) {
                    this.classList.add(states[s - 1]);
                }
            });
            

            container.appendChild(box);
        }
    });
}


function createCheckboxes(container, max, ...states) {
    for (let i = 0; i < max; i++) {
        let box = document.createElement("div");
        box.classList.add("checkbox");
        box.dataset.state = "0";

        box.addEventListener("click", function() {
            let state = parseInt(this.dataset.state);
            state = (state + 1) % (states.length + 1);
            this.dataset.state = state;
            this.className = "checkbox";

            if (state > 0) this.classList.add(states[state - 1]);
        });

        container.appendChild(box);
    }
}

// Automatische Größenanpassung für Textarea
function autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
}

document.querySelectorAll(".maxValue").forEach(input => {
    input.addEventListener("input", updateCheckboxes);
});

updateCheckboxes();

// Geldbetrag aktualisieren
function updateMoney() {
    let currentMoney = parseFloat(document.getElementById('moneyInput').value) || 0;
    let moneyToAdd = parseFloat(document.getElementById('amountInput').value) || 0;
    document.getElementById('moneyInput').value = (currentMoney + moneyToAdd).toFixed(2);
}

document.getElementById('amountInput').addEventListener('keydown', function(event) {
    if (event.key === "Enter") updateMoney();
});

// Charakterdaten speichern
function saveCharacterData() {
    let characterData = {
        gesundheit: document.querySelectorAll('.maxValue')[0].value,
        willenskraft: document.querySelectorAll('.maxValue')[1].value,
        menschlichkeit: document.querySelectorAll('.maxValue')[2].value,
        hunger: document.querySelectorAll('.maxValue')[3].value,
        resonanz: document.querySelectorAll('.maxValue')[4].value,
        geld: document.getElementById('moneyInput').value,
        notizen: document.getElementById('questLog').value,
        checkboxes: Array.from(document.querySelectorAll('.checkbox')).map(box => box.dataset.state)
    };

    let jsonString = JSON.stringify(characterData, null, 2);
    let blob = new Blob([jsonString], { type: "application/json" });
    let url = URL.createObjectURL(blob);

    let downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = "characterData.json";
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
}

document.getElementById("saveData").addEventListener("click", saveCharacterData);

// Charakterdaten laden
document.getElementById("loadData").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function(e) {
        let characterData = JSON.parse(e.target.result);

        document.querySelectorAll('.maxValue').forEach((input, index) => {
            input.value = Object.values(characterData)[index];
        });
        document.getElementById('moneyInput').value = characterData.geld;
        document.getElementById('questLog').value = characterData.notizen;

        updateCheckboxes();
        document.querySelectorAll('.checkbox').forEach((box, index) => {
            if (characterData.checkboxes[index] !== undefined) {
                let state = parseInt(characterData.checkboxes[index]);
                box.dataset.state = state;
                box.className = 'checkbox';
        
                let row = box.closest("tr");
                let thText = row?.querySelector("th")?.innerText.trim();
                let states = [];
        
                switch (thText) {
                    case "Hunger":
                        states = ["blood"];
                        break;
                    case "Resonanz":
                    case "Menschlichkeit":
                        states = ["cross"];
                        break;
                    case "Gesundheit":
                    case "Willenskraft":
                        states = ["strike1", "cross"];
                        break;
                }
        
                // Zustand anwenden
                if (states.includes("blood")) {
                    box.classList.toggle("blood", state > 0);
                }
        
                if (state > 0 && states[state - 1]) {
                    box.classList.add(states[state - 1]);
                }
            }
        });
        
    };
    reader.readAsText(file);
});

const STORAGE = "lifeJournalApp";
let store = JSON.parse(localStorage.getItem(STORAGE)) || {};
let user = null;
let data = [];

/* ---------- PROFILE ---------- */
function hash(v) {
    return btoa(v);
}

function refreshProfiles() {
    const s = document.getElementById("profileSelect");
    s.innerHTML = "<option value=''>Select profile</option>";
    Object.keys(store).forEach(n => {
        const o = document.createElement("option");
        o.value = n;
        o.textContent = n;
        s.appendChild(o);
    });
}
refreshProfiles();

function createProfile() {
    const n = newName.value.trim().toLowerCase();
    const p = newPass.value;
    if (!n || !p) return alert("Fill all fields");
    if (store[n]) return alert("Profile exists");

    store[n] = { pass: hash(p), habits: [], data: [] };
    localStorage.setItem(STORAGE, JSON.stringify(store));
    newName.value = newPass.value = "";
    refreshProfiles();
}

function login() {
    const n = profileSelect.value;
    const p = loginPass.value;
    if (!store[n] || store[n].pass !== hash(p))
        return alert("Wrong password");

    user = n;
    data = store[n].data;
    activeUser.textContent = "Active: " + n;
    renderHabits();
    render();
    draw();
}

/* ---------- HABITS ---------- */
function renderHabits(selected = []) {
    habitList.innerHTML = "";

    store[user].habits.forEach((h, i) => {
        const wrap = document.createElement("div");
        wrap.style.display = "flex";
        wrap.style.alignItems = "center";
        wrap.style.gap = "6px";

        wrap.innerHTML = `
            <label style="flex:1">
                <input type="checkbox" class="habit" ${selected[i] ? "checked" : ""}>
                ${h}
            </label>
            <button onclick="deleteHabit(${i})">❌</button>
        `;

        habitList.appendChild(wrap);
    });
}

function addHabit() {
    if (!user) return alert("Login first");
    const h = newHabit.value.trim();
    if (!h) return;

    store[user].habits.push(h);
    localStorage.setItem(STORAGE, JSON.stringify(store));
    newHabit.value = "";
    renderHabits();
}

function deleteHabit(index) {
    if (!confirm("Delete this habit permanently?")) return;

    store[user].habits.splice(index, 1);
    store[user].data.forEach(entry => entry.habits.splice(index, 1));

    localStorage.setItem(STORAGE, JSON.stringify(store));
    renderHabits();
    render();
}

/* ---------- SAVE DAY ---------- */
function saveDay() {
    if (!user) return alert("Login first");

    const entry = {
        date: new Date().toLocaleDateString(),
        moment: moment.value,
        weight: weight.value,
        sleep: Number(sleep.value || 0),
        habits: [...document.querySelectorAll(".habit")].map(h => h.checked)
    };

    data.push(entry);
    store[user].data = data;
    localStorage.setItem(STORAGE, JSON.stringify(store));

    moment.value = weight.value = sleep.value = "";
    document.querySelectorAll(".habit").forEach(h => h.checked = false);

    render();
    draw();
}

/* ---------- EDIT / DELETE ---------- */
function editEntry(i) {
    const d = data[i];
    moment.value = d.moment;
    weight.value = d.weight;
    sleep.value = d.sleep;
    renderHabits(d.habits);

    data.splice(i, 1);
    store[user].data = data;
    localStorage.setItem(STORAGE, JSON.stringify(store));
}

function deleteEntry(i) {
    if (!confirm("Delete this entry?")) return;
    data.splice(i, 1);
    store[user].data = data;
    localStorage.setItem(STORAGE, JSON.stringify(store));
    render();
    draw();
}

/* ---------- RENDER ---------- */
function render() {
    timeline.innerHTML = "<h3>📖 Timeline</h3>";
    let streak = 0;

    data.forEach((d, i) => {
        if (d.habits.some(h => h)) streak++;
        else streak = 0;

        const div = document.createElement("div");
        div.className = "entry";
        div.innerHTML = `
            <strong>Day ${i + 1} · ${d.date}</strong><br>
            📝 ${d.moment}<br>
            😴 ${d.sleep} hrs<br>
            🔁 ${d.habits.map(h => h ? "✓" : "×").join(" ")}<br>
            <button onclick="editEntry(${i})">Edit</button>
            <button onclick="deleteEntry(${i})">Delete</button>
        `;
        timeline.appendChild(div);
    });

    document.getElementById("streak").textContent = streak;
}

/* ---------- GRAPH ---------- */
function draw() {
    const c = chart.getContext("2d");
    c.clearRect(0, 0, 800, 200);
    if (!data.length) return;

    c.strokeStyle = "#38bdf8";
    c.beginPath();
    data.forEach((d, i) => {
        const x = 40 + i * (720 / (data.length - 1 || 1));
        const y = 180 - (d.sleep / 10) * 160;
        i ? c.lineTo(x, y) : c.moveTo(x, y);
        c.arc(x, y, 3, 0, Math.PI * 2);
    });
    c.stroke();
}

// Пароль текшерүү
if (!sessionStorage.getItem("pool_auth")) {
    const pass = prompt("Кирүү кодун жазыңыз:");
    if (pass === "777") {
        sessionStorage.setItem("pool_auth", "true");
    } else {
        document.body.innerHTML = "<h2>Кирүүгө тыюу салынган!</h2>";
    }
}

// БУЛ ЖЕРГЕ FIREBASE ШИЛТЕМЕСИН КОЮҢУЗ (мисалы: https://test-db.firebaseio.com/pool.json)
const DB_URL = "https://onol-bassein-default-rtdb.firebaseio.com/data.json";

let users = [];

// БАЗАДАН МААЛЫМАТ АЛУУ
async function fetchData() {
    try {
        const response = await fetch(DB_URL);
        const data = await response.json();
        users = data ? Object.values(data) : [];
        renderTable();
    } catch (e) { console.log("Ката:", e); }
}

// БАЗАГА ЖАЗУУ
async function updateDB() {
    await fetch(DB_URL, {
        method: 'PUT',
        body: JSON.stringify(users)
    });
}

async function addUser(type) {
    const name = document.getElementById('userName').value;
    const hours = parseFloat(document.getElementById('hours').value);
    const count = parseInt(document.getElementById('peopleCount').value) || 1;

    if (!name || !hours) return alert("Толтуруңуз!");

    const now = new Date();
    const newUser = {
        id: Date.now(),
        name: name,
        people: count,
        type: type === 'adult' ? 'Чоң' : 'Бала',
        start: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        end: now.getTime() + (hours * 3600000),
        endTimeStr: new Date(now.getTime() + (hours * 3600000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: (type === 'adult' ? 300 : 200) * hours * count,
        date: now.toISOString().split('T')[0],
        notified: false
    };

    users.push(newUser);
    await updateDB();
    fetchData(); // Баарынан көрүнүшү үчүн кайра жаңылайбыз

    document.getElementById('userName').value = "";
    document.getElementById('hours').value = "";
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";
    const now = Date.now();

    users.forEach(u => {
        const isOver = now > u.end;
        const row = document.createElement('tr');
        if (isOver) row.classList.add('over');
        row.innerHTML = `
            <td><b>${u.name}</b><br><small>${u.people} киши</small></td>
            <td>${u.start} - ${u.endTimeStr}</td>
            <td>${u.price}с</td>
            <td>${isOver ? '🛑' : '✅'} <button onclick="deleteUser(${u.id})">🗑️</button></td>
        `;
        tbody.appendChild(row);
    });
}

async function deleteUser(id) {
    if(confirm("Өчүрүлсүнбү?")){
        users = users.filter(u => u.id !== id);
        await updateDB();
        fetchData();
    }
}

// Ар 10 секундда базаны текшерип турат (башка адам кошсо дароо чыгыш үчүн)
setInterval(fetchData, 10000);
fetchData();
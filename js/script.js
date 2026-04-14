// 1. ПАРОЛЬ ТЕКШЕРҮҮ
// 1. Пароль текшерүү
if (!sessionStorage.getItem("pool_auth")) {
    const pass = prompt("Кирүү кодун жазыңыз:");
    if (pass === "777") {
        sessionStorage.setItem("pool_auth", "true");
    } else {
        document.body.innerHTML = "<h2 style='text-align:center; margin-top:50px;'>Кирүүгө тыюу салынган!</h2>";
    }
}

// Маалыматтарды сактоо үчүн өзгөрмө
let users = JSON.parse(localStorage.getItem('pool_data')) || [];

// 2. Билдирүүлөр
function requestNotif() {
    Notification.requestPermission().then(perm => {
        if (perm === "granted") document.getElementById('notif-banner').style.display = 'none';
    });
}
if (Notification.permission !== "granted") {
    const banner = document.getElementById('notif-banner');
    if(banner) banner.style.display = 'flex';
}

// 3. Кардар кошуу
function addUser(type) {
    const nameEl = document.getElementById('userName');
    const hoursEl = document.getElementById('hours');
    const peopleEl = document.getElementById('peopleCount');

    const name = nameEl.value.trim();
    const hours = parseFloat(hoursEl.value);
    const count = parseInt(peopleEl.value) || 1;

    if (!name || isNaN(hours)) {
        alert("Сураныч, маалыматты толук жазыңыз!");
        return;
    }

    const now = new Date();
    const endTimeMs = now.getTime() + (hours * 3600000);

    const newUser = {
        id: Date.now(),
        name: name,
        people: count,
        type: type === 'adult' ? 'Чоң' : 'Бала',
        start: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endMs: endTimeMs,
        endTimeStr: new Date(endTimeMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: (type === 'adult' ? 300 : 200) * hours * count,
        date: now.toISOString().split('T')[0],
        notified: false
    };

    users.push(newUser);
    saveData();
    renderTable();

    // Тазалоо
    nameEl.value = "";
    hoursEl.value = "";
    peopleEl.value = "1";
}

// 4. Таблицаны чыгаруу
function renderTable() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    tbody.innerHTML = "";
    
    const nowMs = Date.now();

    // Жаңы кошулгандар жогоруда болушу үчүн
    const displayList = [...users].reverse();

    displayList.forEach(u => {
        const isOver = nowMs > u.endMs;

        // Билдирүү жиберүү
        if (isOver && !u.notified && Notification.permission === "granted") {
            new Notification("Убакыт бүттү!", { body: `${u.name} бүттү.` });
            u.notified = true;
            saveData();
        }

        const row = document.createElement('tr');
        if (isOver) row.classList.add('over');

        row.innerHTML = `
            <td><b>${u.name}</b><br><small>${u.people} киши (${u.type})</small></td>
            <td>${u.start} - ${u.endTimeStr}</td>
            <td>${u.price}с</td>
            <td>
                <span>${isOver ? '🛑' : '✅'}</span>
                <button onclick="deleteUser(${u.id})" style="border:none; background:none; cursor:pointer; font-size:18px;">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 5. Өчүрүү
function deleteUser(id) {
    if (confirm("Өчүрүлсүнбү?")) {
        users = users.filter(u => u.id !== id);
        saveData();
        renderTable();
    }
}

// 6. Сактоо
function saveData() {
    localStorage.setItem('pool_data', JSON.stringify(users));
}

// 7. Статистика
function showTotal(period) {
    const today = new Date().toISOString().split('T')[0];
    let sum = 0;
    users.forEach(u => {
        if (period === 'today' && u.date === today) sum += u.price;
        else if (period === 'month' && u.date.startsWith(today.substring(0, 7))) sum += u.price;
        else if (period === 'week' && (Date.now() - u.id < 604800000)) sum += u.price;
    });
    document.getElementById('total-amount').innerText = sum;
}

// 8. Архивди көрүү
function viewHistory() {
    const date = document.getElementById('historyDate').value;
    const box = document.getElementById('archive-result');
    if (!date || !box) return;

    const filtered = users.filter(u => u.date === date);
    let sum = 0;
    let html = `<b>${date}:</b><br>`;
    
    if (filtered.length === 0) {
        html += "Маалымат жок.";
    } else {
        filtered.forEach(u => {
            sum += u.price;
            html += `• ${u.name}: ${u.price}с<br>`;
        });
        html += `<b>Жалпы: ${sum} сом</b>`;
    }
    box.innerHTML = html;
}

// Жаңыртып туруу
setInterval(renderTable, 30000);
renderTable();
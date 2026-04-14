// Пароль текшерүү
if (!sessionStorage.getItem("pool_auth")) {
    const pass = prompt("Кирүү кодун жазыңыз:");
    if (pass === "777") {
        sessionStorage.setItem("pool_auth", "true");
    } else {
        document.body.innerHTML = "<h2 style='text-align:center; margin-top:50px;'>Кирүүгө тыюу салынган!</h2>";
    }
}

let users = JSON.parse(localStorage.getItem('poolData')) || [];

// Билдирүүлөрдү иштетүү
function requestNotif() {
    Notification.requestPermission().then(perm => {
        if (perm === "granted") {
            document.getElementById('notif-banner').style.display = 'none';
        }
    });
}

if (Notification.permission !== "granted") {
    document.getElementById('notif-banner').style.display = 'flex';
}

function addUser(type) {
    const name = document.getElementById('userName').value.trim();
    const hours = parseFloat(document.getElementById('hours').value);
    const count = parseInt(document.getElementById('peopleCount').value) || 1;

    if (!name || isNaN(hours)) return alert("Маалыматтарды толук жазыңыз!");

    const now = new Date();
    const price = (type === 'adult' ? 300 : 200) * hours * count;
    
    const newUser = {
        id: Date.now(),
        name: name,
        people: count,
        type: type === 'adult' ? 'Чоң' : 'Бала',
        start: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        end: now.getTime() + (hours * 3600000),
        endTimeStr: new Date(now.getTime() + (hours * 3600000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: price,
        date: now.toISOString().split('T')[0],
        notified: false
    };

    users.push(newUser);
    saveData();
    renderTable();
    
    // Форманы тазалоо
    document.getElementById('userName').value = "";
    document.getElementById('hours').value = "";
    document.getElementById('peopleCount').value = "1";
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";
    const now = Date.now();

    users.forEach(u => {
        const isOver = now > u.end;
        
        // Билдирүү жиберүү
        if (isOver && !u.notified) {
            if (Notification.permission === "granted") {
                new Notification("Убакыт бүттү!", { body: `${u.name} тобунун убактысы бүттү.` });
            }
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
                <button onclick="deleteUser(${u.id})" class="delete-btn">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function viewHistory() {
    const date = document.getElementById('historyDate').value;
    const box = document.getElementById('archive-result');
    if (!date) return;

    const filtered = users.filter(u => u.date === date);
    let sum = 0;
    let html = `<b>Архив (${date}):</b><br>`;
    
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

function showTotal(period) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    let sum = 0;

    users.forEach(u => {
        if (period === 'today' && u.date === today) sum += u.price;
        else if (period === 'month' && u.date.startsWith(today.substring(0, 7))) sum += u.price;
        else if (period === 'week' && (Date.now() - u.id < 604800000)) sum += u.price;
    });
    document.getElementById('total-amount').innerText = sum;
}

function deleteUser(id) {
    if (confirm("Өчүрүлсүнбү?")) {
        users = users.filter(u => u.id !== id);
        saveData();
        renderTable();
    }
}

function saveData() { localStorage.setItem('poolData', JSON.stringify(users)); }

setInterval(renderTable, 30000); // 30 секунд сайын текшерет
renderTable();
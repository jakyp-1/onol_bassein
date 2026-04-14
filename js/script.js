// Пароль текшерүү (баштапкы коддогудай)
if (!sessionStorage.getItem("pool_auth")) {
    const pass = prompt("Кирүү кодун жазыңыз:");
    if (pass === "777") {
        sessionStorage.setItem("pool_auth", "true");
    } else {
        alert("Ката пароль!");
        document.body.innerHTML = "<h1>Кирүүгө тыюу салынган!</h1>";
    }
}

let users = JSON.parse(localStorage.getItem('poolData')) || [];

function addUser(type) {
    const nameInput = document.getElementById('userName');
    const hoursInput = document.getElementById('hours');
    const peopleInput = document.getElementById('peopleCount');
    
    const name = nameInput.value.trim();
    const hour = parseFloat(hoursInput.value);
    const count = parseInt(peopleInput.value) || 1;

    if (!name || isNaN(hour)) return alert("Маалыматты толук толтуруңуз!");

    const now = new Date();
    const endTime = new Date(now.getTime() + hour * 60 * 60 * 1000);
    const pricePerHour = (type === 'child') ? 200 : 300;

    const newUser = {
        id: Date.now(),
        name: name,
        peopleCount: count,
        type: type === 'child' ? 'Бала' : 'Чоң',
        start: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        end: endTime.getTime(),
        endTimeStr: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: hour * count * pricePerHour, // Киши санына көбөйтүү
        day: now.getDate(),
        month: now.getMonth(),
        year: now.getFullYear(),
        timestamp: now.getTime(),
        notified: false
    };

    users.push(newUser);
    saveData();
    
    // Форманы тазалоо
    nameInput.value = ""; 
    hoursInput.value = "";
    peopleInput.value = "1";
    
    renderTable();
}

function saveData() {
    localStorage.setItem('poolData', JSON.stringify(users));
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";
    const nowMs = new Date().getTime();

    users.forEach(user => {
        const isOver = nowMs > user.end;

        if (isOver && !user.notified) {
            if (Notification.permission === "granted") {
                new Notification("Убакыт бүттү!", { body: `${user.name} тобунун убактысы бүттү!` });
            }
            user.notified = true;
            saveData();
        }

        const row = document.createElement('tr');
        if (isOver) row.classList.add('over');

        row.innerHTML = `
            <td><b>${user.name}</b> <br> <small>${user.peopleCount} киши (${user.type})</small></td>
            <td>${user.start} - ${user.endTimeStr}</td>
            <td>${user.price}с</td>
            <td>
                <span style="color:${isOver ? 'red' : 'green'}">${isOver ? '🛑 Бүттү' : '✅'}</span>
                <button onclick="deleteUser(${user.id})" class="delete-btn">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showTotal(period) {
    let sum = 0;
    const now = new Date();
    users.forEach(user => {
        if (period === 'today' && user.day === now.getDate() && user.month === now.getMonth()) {
            sum += user.price;
        } else if (period === 'week' && (Date.now() - user.timestamp <= 7 * 24 * 60 * 60 * 1000)) {
            sum += user.price;
        } else if (period === 'month' && user.month === now.getMonth()) {
            sum += user.price;
        }
    });
    document.getElementById('total-amount').innerText = sum;
}

function deleteUser(id) {
    if (confirm("Өчүрүлсө кирешеден да азаят. Өчүрөсүзбү?")) {
        users = users.filter(u => u.id !== id);
        saveData();
        renderTable();
    }
}

setInterval(renderTable, 10000);
renderTable();
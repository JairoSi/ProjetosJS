const currentMonthElement = document.getElementById("currentMonth");
const calendarElement = document.getElementById("calendar");

// Inicialmente configuramos o mês e ano atuais
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // Janeiro é 0, Dezembro é 11

// Atualiza o cabeçalho e o calendário
function updateCalendar() {
    // Meses em texto
    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Atualiza o cabeçalho
    currentMonthElement.innerText = `${monthNames[currentMonth]} ${currentYear}`;

    // Limpa o calendário atual
    calendarElement.innerHTML = "";

    // Obtém o número de dias no mês atual
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Preenche o calendário com os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement("div");
        dayElement.className = "day";
        dayElement.innerText = day;
        calendarElement.appendChild(dayElement);
    }
}

// Muda o mês
function changeMonth(direction) {
    currentMonth += direction;

    // Se passar de dezembro (11), avança um ano
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    // Se passar de janeiro (0) para trás, volta um ano
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    // Atualiza o calendário para o novo mês
    updateCalendar();
}

// Inicializa o calendário ao carregar a página
updateCalendar();

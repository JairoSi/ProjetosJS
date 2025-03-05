// Seletores para os elementos do cabeçalho e do calendário
const currentMonthElement = document.getElementById("currentMonth");
const calendarElement = document.getElementById("calendar");

// Configuramos inicialmente o mês e o ano atuais
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // Janeiro é 0, Dezembro é 11

// Função para atualizar o calendário e o cabeçalho com o mês atual
function updateCalendar() {
    // Array com os nomes dos meses
    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Atualiza o texto do cabeçalho com o mês e o ano atual
    currentMonthElement.innerText = `${monthNames[currentMonth]} ${currentYear}`;

    // Limpa o conteúdo do calendário para preencher com novos dias
    calendarElement.innerHTML = "";

    // Calcula o número de dias no mês atual
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Obtém a data de hoje para destacar o dia atual e os dias já passados
    const today = new Date();
    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

    // Itera sobre os dias do mês, criando elementos para cada dia
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement("div");
        dayElement.className = "day";
        dayElement.innerText = day;

        // Adiciona a classe "past-day" se o dia já passou
        if (isCurrentMonth && day < today.getDate()) {
            dayElement.classList.add("past-day");
        }

        // Adiciona a classe "today" para o dia atual
        if (isCurrentMonth && day === today.getDate()) {
            dayElement.classList.add("today");
        }

        // Adiciona o elemento do dia ao calendário
        calendarElement.appendChild(dayElement);
    }
}

// Função para mudar o mês
function changeMonth(direction) {
    currentMonth += direction;

    // Se passar de dezembro, avança um ano
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    // Se passar de janeiro para trás, volta um ano
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    // Atualiza o calendário com o novo mês
    updateCalendar();
}

// Função de exemplo para quando o botão de "Lançar Atividade" for clicado
function lancarAtividade() {
    // Mensagem simples para demonstrar o evento
    alert("Atividade lançada com sucesso!");
}

// Inicializa o calendário quando a página for carregada
updateCalendar();

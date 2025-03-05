// Configuração do cliente Supabase
// Certifique-se de que o Supabase já está carregado no HTML antes deste script
const SUPABASE_URL = "https://scbfdducpgnxjzdmnnmv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjYmZkZHVjcGdueGp6ZG1ubm12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExOTU3NDcsImV4cCI6MjA1Njc3MTc0N30.YMjicsUm6LePBeaOnHCQqN4xSYTX67P9bk0TC5Epo4M.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjYmZkZHVjcGdueGp6ZG1ubm12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExOTU3NDcsImV4cCI6MjA1Njc3MTc0N30.YMjicsUm6LePBeaOnHCQqN4xSYTX67P9bk0TC5Epo4M";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// IDs dos elementos no HTML
const currentMonthElement = document.getElementById("currentMonth");
const calendarElement = document.getElementById("calendar");

// Configuramos inicialmente o mês e o ano atuais
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // Janeiro é 0, Dezembro é 11

/**
 * Busca lançamentos do banco de dados para o mês atual
 */
async function carregarLancamentos() {
    try {
        const { data: lancamentos, error } = await supabase
            .from("lancamentos")
            .select("*")
            .gte("data", `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`)
            .lte("data", `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-31`);

        if (error) {
            console.error("Erro ao carregar lançamentos:", error);
            return [];
        }

        return lancamentos;
    } catch (err) {
        console.error("Erro inesperado ao carregar lançamentos:", err);
        return [];
    }
}

/**
 * Atualiza o calendário para o mês e ano atuais
 */
async function updateCalendar() {
    // Nomes dos meses
    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Atualiza o título do mês atual
    currentMonthElement.innerText = `${monthNames[currentMonth]} ${currentYear}`;

    // Limpa o calendário existente
    calendarElement.innerHTML = "";

    // Calcula o número de dias no mês atual
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Obtém a data de hoje
    const today = new Date();
    const isCurrentMonth = (currentMonth === today.getMonth() && currentYear === today.getFullYear());

    // Busca os lançamentos para o mês atual
    const lancamentos = await carregarLancamentos();
    const diasComAtividade = lancamentos.map(l => new Date(l.data).getDate());

    // Preenche o calendário com os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement("div");
        dayElement.className = "day";
        dayElement.innerText = day;

        // Adiciona classe para dias passados
        if (isCurrentMonth && day < today.getDate()) {
            dayElement.classList.add("past-day");
        }

        // Adiciona classe para o dia atual
        if (isCurrentMonth && day === today.getDate()) {
            dayElement.classList.add("today");
        }

        // Adiciona classe para dias com atividades
        if (diasComAtividade.includes(day)) {
            dayElement.classList.add("active-day");
        }

        // Insere o dia no calendário
        calendarElement.appendChild(dayElement);
    }
}

/**
 * Muda o mês exibido no calendário
 * @param {number} direction - 1 para próximo mês, -1 para mês anterior
 */
function changeMonth(direction) {
    currentMonth += direction;

    // Verifica se passou de dezembro e ajusta o ano
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    // Verifica se passou de janeiro para trás e ajusta o ano
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    // Atualiza o calendário com o novo mês
    updateCalendar();
}

// Inicializa o calendário ao carregar a página
updateCalendar();

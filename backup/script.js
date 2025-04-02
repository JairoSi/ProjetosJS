
// Firebase Realtime Database e Auth
import { getDatabase, ref, push, get, child, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { app } from './firebase-config.js';

const db = getDatabase(app);
const auth = getAuth(app);

// IDs dos elementos no HTML
const currentMonthElement = document.getElementById("currentMonth");
const calendarElement = document.getElementById("calendar");

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

async function adicionarAtividade(data, plataforma, responsavel, descricao, status, observacoes, forma_lancamento, uid) {
  try {
    await push(ref(db, "ops_activities"), {
      data: new Date(data).toISOString(),
      plataforma,
      responsavel,
      descricao,
      status,
      observacoes,
      forma_lancamento,
      userId: uid
    });
    console.log("Atividade registrada com sucesso!");
  } catch (e) {
    console.error("Erro ao adicionar atividade: ", e);
  }
}

function toggleFormulario() {
  const form = document.getElementById("form-atividade");
  form.style.display = form.style.display === "none" ? "block" : "none";
}

function lancarAtividade() {
  const data = document.getElementById("dataAtividade").value;
  const plataforma = document.getElementById("plataforma").value;
  const responsavel = document.getElementById("responsavel").value;
  const descricao = document.getElementById("descricao").value;
  const status = document.getElementById("status").value;
  const observacoes = document.getElementById("observacoes").value;
  const forma_lancamento = document.getElementById("formaLancamento").value;
  const dataFim = document.getElementById("dataFimAtividade").value;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      adicionarAtividade(data, plataforma, responsavel, descricao, status, observacoes, forma_lancamento, user.uid);
    } else {
      alert("Usuário não autenticado!");
    }
  });
}

async function carregarLancamentos(uid, mostrarTodos = false) {
  try {
    const snapshot = await get(child(ref(db), "ops_activities"));
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    const inicioMes = new Date(currentYear, currentMonth, 1);
    const fimMes = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    return Object.entries(data).map(([id, value]) => ({
      id,
      ...value
    })).filter(item => {
      const itemDate = new Date(item.data);
      const isInMonth = itemDate >= inicioMes && itemDate <= fimMes;
      const isUserMatch = mostrarTodos || item.userId === uid;
      return isInMonth && isUserMatch;
    });

  } catch (err) {
    console.error("Erro ao carregar lançamentos do Firebase:", err);
    return [];
  }
}

function renderizarLancamentos(lancamentos) {
  const container = document.getElementById("launches");
  container.innerHTML = "<h2>Lançamentos</h2>"; // Limpa e reinicia com o título

  if (lancamentos.length === 0) {
    container.innerHTML += "<p>Nenhum lançamento encontrado para este mês.</p>";
    return;
  }

  lancamentos.forEach((lancamento) => {
    const div = document.createElement("div");
    div.className = "launch";
    div.innerHTML = `
      <h3>${lancamento.plataforma} - ${lancamento.responsavel}</h3>
      <p>${lancamento.descricao}</p>
      <span class="status ${lancamento.status}">${lancamento.status}</span>
    `;
    container.appendChild(div);
  });
}


async function updateCalendar(uid, mostrarTodos = false) {
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  currentMonthElement.innerText = `${monthNames[currentMonth]} ${currentYear}`;
  calendarElement.innerHTML = "";

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = (currentMonth === today.getMonth() && currentYear === today.getFullYear());

  const lancamentos = await carregarLancamentos(uid, mostrarTodos);
  const diasComAtividade = lancamentos.map(l => new Date(l.data).getDate());

  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement("div");
    dayElement.className = "day";
    dayElement.innerText = day;

    if (isCurrentMonth && day < today.getDate()) dayElement.classList.add("past-day");
    if (isCurrentMonth && day === today.getDate()) dayElement.classList.add("today");
    if (diasComAtividade.includes(day)) dayElement.classList.add("active-day");

    calendarElement.appendChild(dayElement);
    // NOVO: Renderiza também os lançamentos
renderizarLancamentos(lancamentos);
  }
}

function changeMonth(direction, uid, mostrarTodos = false) {
  currentMonth += direction;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  updateCalendar(uid, mostrarTodos);
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    updateCalendar(user.uid);

    const mostrarTodosBtn = document.getElementById("toggleTodos");
    if (mostrarTodosBtn) {
      let mostrarTodos = false;
      mostrarTodosBtn.addEventListener("click", () => {
        mostrarTodos = !mostrarTodos;
        updateCalendar(user.uid, mostrarTodos);
        mostrarTodosBtn.innerText = mostrarTodos ? "Ver meus lançamentos" : "Ver todos";
      });
    }
  } else {
    alert("Usuário não autenticado!");
  }
});

document.getElementById("btnConfirmar")?.addEventListener("click", () => {
  lancarAtividade();
});

window.lancarAtividade = lancarAtividade;
window.toggleFormulario = toggleFormulario;

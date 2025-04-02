
// Firebase Realtime Database e Auth
import { getDatabase, ref, push, get, child, onValue, remove,set } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { app } from './firebase-config.js';

const db = getDatabase(app);
const auth = getAuth(app);

let editando = false;
let idEdicao = null;


// IDs dos elementos no HTML
const currentMonthElement = document.getElementById("currentMonth");
const calendarElement = document.getElementById("calendar");

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

async function adicionarAtividade(data, plataforma, responsavel, descricao, status, observacoes, forma_lancamento, uid) {
  try {
    await push(ref(db, "ops_activities"), {
      data:data,
      plataforma,
      responsavel,
      descricao,
      status,
      observacoes,
      forma_lancamento,
      userId: uid,
      criado_por: auth.currentUser.displayName || auth.currentUser.email,
      criado_em: new Date().toISOString()
    });
    console.log("Atividade registrada com sucesso!");
    updateCalendar(uid);
    toggleFormulario();
  } catch (e) {
    console.error("Erro ao adicionar atividade: ", e);
  }
}

function toggleFormulario() {
  const form = document.getElementById("form-atividade");
  form.style.display = form.style.display === "none" ? "block" : "none";
}

function lancarAtividade() {
  const dataInput = document.getElementById("dataAtividade").value;
  const [year, month, day] = dataInput.split("-");
  const data = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const plataforma = document.getElementById("plataforma").value;
  const responsavel = document.getElementById("responsavel").value;
  const descricao = document.getElementById("descricao").value;
  const status = document.getElementById("status").value;
  const observacoes = document.getElementById("observacoes").value;
  const forma_lancamento = document.getElementById("formaLancamento").value;

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (editando && idEdicao) {
        // Buscar dados anteriores para manter o criador original
        const snapshot = await get(child(ref(db), "ops_activities/" + idEdicao));
        if (!snapshot.exists()) return alert("Erro: não foi possível recuperar o lançamento para edição.");
      
        const dadosAnteriores = snapshot.val();
      
        const atualizacao = {
          ...dadosAnteriores, // mantém tudo o que já existia
          data,
          plataforma,
          responsavel,
          descricao,
          status,
          observacoes,
          forma_lancamento,
          userId: user.uid,
          editado_em: new Date().toISOString(),
          editado_por: auth.currentUser.displayName || auth.currentUser.email
        };

        const refAtualizacao = ref(db, "ops_activities/" + idEdicao);
        await set(refAtualizacao, atualizacao);

        alert("Lançamento atualizado com sucesso!");
        editando = false;
        idEdicao = null;
        document.getElementById("btnConfirmar").innerText = "Confirmar";
        updateCalendar(user.uid);
        toggleFormulario();
      } else {
        // Criar novo
        adicionarAtividade(data, plataforma, responsavel, descricao, status, observacoes, forma_lancamento, user.uid);
      }
    } else {
      alert("Usuário não autenticado!");
    }
  });
}


async function editarLancamento(id) {
  try {
    const snapshot = await get(child(ref(db), "ops_activities/" + id));
    if (!snapshot.exists()) return alert("Lançamento não encontrado.");

    const dados = snapshot.val();

    document.getElementById("dataAtividade").value = dados.data;
    document.getElementById("plataforma").value = dados.plataforma;
    document.getElementById("responsavel").value = dados.responsavel;
    document.getElementById("descricao").value = dados.descricao;
    document.getElementById("status").value = dados.status;
    document.getElementById("observacoes").value = dados.observacoes;
    document.getElementById("formaLancamento").value = dados.forma_lancamento;

    editando = true;
    idEdicao = id;

    toggleFormulario();
    document.getElementById("btnConfirmar").innerText = "Salvar edição";
  } catch (e) {
    console.error("Erro ao buscar para edição:", e);
  }
}


async function carregarLancamentos(uid, mostrarTodos = false) {
  try {
    const snapshot = await get(child(ref(db), "ops_activities"));
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    const inicioMes = new Date(currentYear, currentMonth, 1);
    const fimMes = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    inicioMes.setHours(0, 0, 0, 0); // início do dia
    fimMes.setHours(23, 59, 59, 999); // fim do dia


    return Object.entries(data).map(([id, value]) => ({
      id,
      ...value
    })).filter(item => {
      if (!item.data) return false; // pula itens sem data

      const [year, month, day] = item.data.split("-").map(Number);
      const itemDate = new Date(year, month - 1, day);
      
      

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
    <p><strong>Observações:</strong> ${lancamento.observacoes || "—"}</p>
    <small><strong>Criado por:</strong> ${lancamento.criado_por || "Desconhecido"}</small><br>
    ${lancamento.editado_por ? `<small><strong>Editado por:</strong> ${lancamento.editado_por}</small><br>` : ""}
    <span class="status ${lancamento.status}">${lancamento.status}</span>
    <br />
    <button onclick="excluirLancamento('${lancamento.id}')" style="
      margin-top: 8px;
      padding: 5px 10px;
      background-color: #e74c3c;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    ">
      Excluir
    </button>

      <button onclick="editarLancamento('${lancamento.id}')" style="
    margin-top: 8px;
    padding: 5px 10px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 5px;
  ">
    Editar
  </button>
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
  const diasComStatus = {};

  lancamentos.forEach(l => {
    if (!l.data || !l.status) return;
  
    const [year, month, day] = l.data.split("-").map(Number);
    const dia = day;
  
    // Garante que cada dia recebe o último status cadastrado
    diasComStatus[dia] = l.status;
  });
  
  

  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement("div");
    dayElement.className = "day";
    dayElement.innerText = day;

    if (isCurrentMonth && day < today.getDate()) dayElement.classList.add("past-day");
    if (isCurrentMonth && day === today.getDate()) dayElement.classList.add("today");
    if (diasComStatus[day]) {
      dayElement.classList.add("active-day");
      dayElement.classList.add(`status-dia-${diasComStatus[day]}`);
    }
    

    calendarElement.appendChild(dayElement);
  }

  renderizarLancamentos(lancamentos); // Correto: fora do loop
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

// Excluir lançamento pelo ID
async function excluirLancamento(id) {
  if (confirm("Tem certeza que deseja excluir este lançamento?")) {
    try {
      await remove(ref(db, "ops_activities/" + id));
      alert("Lançamento excluído com sucesso.");
      location.reload(); // Recarrega para atualizar a lista
    } catch (e) {
      console.error("Erro ao excluir:", e);
      alert("Erro ao excluir lançamento.");
    }
  }
}
window.excluirLancamento = excluirLancamento;

window.lancarAtividade = lancarAtividade;
window.toggleFormulario = toggleFormulario;
window.editarLancamento = editarLancamento;


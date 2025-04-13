
// Firebase Realtime Database e Auth
import { getDatabase, ref, push, get, child, onValue, remove,set,update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
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

// 🔹 Etapa 1: Estrutura inicial para checklist no Firebase
// Modelo de checklist:
// ops_checklists: {
//   -Kdh28dhw72hds: {
//     id_plataforma: "Xama",
//     titulo: "Checklist semanal Xama",
//     itens: [
//       { descricao: "Verificar login", feito: false },
//       { descricao: "Validar relatórios", feito: false }
//     ],
//     criado_por: "jairo@logame.com.br",
//     criado_em: "2025-04-03T13:25:00Z"
//   },
//   ...
// }

// Exemplo de função para salvar checklist (interface e uso real virão na Etapa 2)
async function salvarChecklist(titulo, plataforma, itens) {
  const user = auth.currentUser;
  if (!user) return alert("Usuário não autenticado");

  const checklist = {
    id_plataforma: plataforma,
    titulo,
    itens,
    criado_por: user.displayName || user.email,
    criado_em: new Date().toISOString()
  };

  try {
    await push(ref(db, "ops_checklists"), checklist);
    console.log("✅ Checklist salvo com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar checklist:", error);
  }
}

async function gerarIdSequencial() {
  const contadorRef = ref(db, "sequencial_lancamento");
  const snapshot = await get(contadorRef);
  let novoNumero = 1;

  if (snapshot.exists()) {
    novoNumero = snapshot.val() + 1;
  }

  await set(contadorRef, novoNumero);
  return novoNumero;
}


async function adicionarAtividade(data, plataforma, responsavel, descricao, status, observacoes, forma_lancamento, uid) {
  try {
    const idSequencial = await gerarIdSequencial();
    await push(ref(db, "ops_activities"), {
      id_sequencial: idSequencial,
      data,
      //data:data,
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



function carregarPlataformasExistentes() {
  const select = document.getElementById("plataforma");
  select.innerHTML = `<option value="">Selecione a plataforma</option>`; // Limpa

  const atividadesRef = ref(db, "ops_activities");

  onValue(atividadesRef, (snapshot) => {
    const plataformas = new Set();
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data.plataforma) {
        plataformas.add(data.plataforma.trim());
      }
    });

    // Adiciona cada plataforma como option
    plataformas.forEach((nome) => {
      const option = document.createElement("option");
      option.value = nome;
      option.textContent = nome;
      select.appendChild(option);
    });

    // Adiciona opção de nova plataforma
    const outra = document.createElement("option");
    outra.value = "__nova__";
    outra.textContent = "Outra / Nova Plataforma...";
    select.appendChild(outra);
  });
}
async function registrarPlataformaSeNova(nomePlataforma, user) {
  const plataformasRef = ref(db, "ops_plataformas");
  const snapshot = await get(plataformasRef);

  const plataformas = snapshot.exists() ? Object.values(snapshot.val()) : [];

  const jaExiste = plataformas.includes(nomePlataforma.trim());

  if (!jaExiste) {
    await push(plataformasRef, nomePlataforma.trim());

    // salvar no histórico
    await push(ref(db, "ops_plataformas_historico"), {
      nome: nomePlataforma.trim(),
      criado_por: user.displayName || user.email,
      criado_em: new Date().toISOString()
    });

    console.log("✅ Plataforma registrada:", nomePlataforma);
  }
}



function lancarAtividade() {
  const dataInput = document.getElementById("dataAtividade").value;
  const [year, month, day] = dataInput.split("-");
  const data = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  let plataformaSelecionada = document.getElementById("plataforma").value;
if (plataformaSelecionada === "__nova__") {
  plataformaSelecionada = document.getElementById("novaPlataforma").value.trim();
}

  const responsavel = document.getElementById("responsavel").value;
 // const descricao = document.getElementById("descricao").value;

 const formaDescricao = document.querySelector('input[name="formaDescricao"]:checked').value;
let descricao = "";
let checklist_usado = "";
let checklist_itens = [];

if (formaDescricao === "livre") {
  descricao = document.getElementById("descricao").value;
} else if (formaDescricao === "checklist") {
  const checklistSelecionado = document.getElementById("seletorChecklist");
  checklist_usado = checklistSelecionado.options[checklistSelecionado.selectedIndex]?.text || "";

  const checkboxes = document.querySelectorAll("#areaChecklistRenderizado input[type='checkbox']");
  checkboxes.forEach((cb) => {
    const label = document.querySelector(`label[for="${cb.id}"]`);
    const texto = label.textContent.trim().replace(/^\d+\.\s*/, "");
    checklist_itens.push({
      descricao: texto,
      feito: cb.checked
    });
  });
}



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
          ...dadosAnteriores,
          data,
          plataforma: plataformaSelecionada,
          responsavel,
          descricao: formaDescricao === "livre" ? descricao : "",
          status,
          observacoes,
          forma_lancamento,
          userId: user.uid,
          forma_descricao: formaDescricao,
          checklist_usado: formaDescricao === "checklist" ? checklist_usado : "",
          checklist_itens: formaDescricao === "checklist" ? checklist_itens : [],
          editado_em: new Date().toISOString(),
          editado_por: auth.currentUser.displayName || auth.currentUser.email
        };
        
        const refAtualizacao = ref(db, "ops_activities/" + idEdicao);
        await set(refAtualizacao, atualizacao);

        await push(ref(db, "ops_activities_history/" + idEdicao), {
          data: new Date().toISOString(),
          acao: "edição",
          realizado_por: auth.currentUser.displayName || auth.currentUser.email
        });
        

        alert("Lançamento atualizado com sucesso!");
        editando = false;
        idEdicao = null;
        document.getElementById("btnConfirmar").innerText = "Confirmar";
        toggleFormulario();
        limparFormularioAtividade();
        updateCalendar(user.uid);
      
      } else {
        // Criar novo
        await registrarPlataformaSeNova(plataformaSelecionada, user);
        //adicionarAtividade(data, plataformaSelecionada, responsavel, descricao, status, observacoes, forma_lancamento, user.uid);



        const novaAtividade = {
          data,
          data_fim: document.getElementById("dataFimAtividade").value,
          plataforma: plataformaSelecionada,
          responsavel,
          descricao: formaDescricao === "livre" ? descricao : "",
          status,
          observacoes,
          forma_lancamento,
          userId: user.uid,
          criado_por: user.displayName || user.email,
          criado_em: new Date().toISOString(),
          forma_descricao: formaDescricao,
          checklist_usado: formaDescricao === "checklist" ? checklist_usado : "",
          checklist_itens: formaDescricao === "checklist" ? checklist_itens : []
        };
        
        const idSequencial = await gerarIdSequencial();
        novaAtividade.id_sequencial = idSequencial;
        
        await push(ref(db, "ops_activities"), novaAtividade);
        console.log("Atividade registrada com sucesso!");
        limparFormularioAtividade();
        toggleFormulario();
        updateCalendar(user.uid);
        
        
      }
    } else {
      limparFormularioAtividade();
      alert("Usuário não autenticado!");
    }
  });
}


async function editarLancamento(id) {
  try {
    const snapshot = await get(child(ref(db), "ops_activities/" + id));
    if (!snapshot.exists()) return alert("Lançamento não encontrado.");

    const dados = snapshot.val();

    // Campos simples
    document.getElementById("dataAtividade").value = dados.data || "";
    document.getElementById("dataFimAtividade").value = dados.data_fim || "";
    document.getElementById("plataforma").value = dados.plataforma || "";
    document.getElementById("responsavel").value = dados.responsavel || "";
    document.getElementById("status").value = dados.status || "pendente";
    document.getElementById("formaLancamento").value = dados.forma_lancamento || "manual";
    document.getElementById("observacoes").value = dados.observacoes || "";

    // Tipo de descrição
    if (dados.forma_descricao === "livre") {
      document.getElementById("radioLivre").checked = true;
      document.getElementById("descricao").value = dados.descricao || "";
    } else if (dados.forma_descricao === "checklist") {
      document.getElementById("radioChecklist").checked = true;

      // Tenta selecionar o checklist pelo nome
      const seletor = document.getElementById("seletorChecklist");
      const opcoes = Array.from(seletor.options);
      const indice = opcoes.findIndex(opt => opt.text === dados.checklist_usado);
      if (indice !== -1) seletor.selectedIndex = indice;

      // Exibe os itens já marcados
      const area = document.getElementById("areaChecklistRenderizado");
      area.innerHTML = "";

      (dados.checklist_itens || []).forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "checklist-item";
        div.innerHTML = `
          <input type="checkbox" id="item-${index}" data-index="${index}" ${item.feito ? "checked" : ""}>
          <label for="item-${index}">${index + 1}. ${item.descricao}</label>
        `;
        area.appendChild(div);
      });
    }

    configurarAlternanciaDescricao();

    // Ativa modo edição
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
    let diasRestantes = '';
if (lancamento.data_fim) {
  const hoje = new Date();
  const fim = new Date(lancamento.data_fim);
  const diffTime = fim - hoje;
  const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDias > 0) {
    diasRestantes = `⏳ ${diffDias} dia(s) restantes`;
  } else if (diffDias === 0) {
    diasRestantes = `⚠️ Finaliza hoje`;
  } else {
    diasRestantes = `❌ Atrasado há ${Math.abs(diffDias)} dia(s)`;
  }
}

    div.className = "launch";
    div.innerHTML = `
    <h3>#${lancamento.id_sequencial || '—'} - ${lancamento.plataforma} - ${lancamento.responsavel}</h3>

  


    ${lancamento.checklist_itens && lancamento.checklist_itens.length > 0
      ? `<ul style="margin-left: 20px; padding-left: 0;">${lancamento.checklist_itens
          .map((item, index) =>
            `<li>
              <input type="checkbox" disabled ${item.feito ? "checked" : ""} id="check-${lancamento.id}-${index}">
              <label for="check-${lancamento.id}-${index}">${item.descricao}</label>
            </li>`
          ).join("")}</ul>`
      : "<p>—</p>"
    }
    
    


    <p><strong>Observações:</strong> ${lancamento.observacoes || "—"}</p>
    <small><strong>Criado por:</strong> ${lancamento.criado_por || "Desconhecido"}</small><br>
    ${lancamento.data_fim ? `<p><strong>Previsão de Fim:</strong> ${lancamento.data_fim}</p>` : ""}
    ${diasRestantes ? `<p><strong>Status da Previsão:</strong> ${diasRestantes}</p>` : ""}
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
  <button onclick="verHistorico('${lancamento.id}')" style="
  margin-top: 8px;
  padding: 5px 10px;
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 5px;
">
  📜 Ver histórico
</button>
<div id="historico-${lancamento.id}" class="historico-container" style="display: none; margin-top: 10px;"></div>
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
  const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 = domingo, 1 = segunda...

  const today = new Date();
  const isCurrentMonth = (currentMonth === today.getMonth() && currentYear === today.getFullYear());

  const lancamentos = await carregarLancamentos(uid, mostrarTodos);
  const diasComStatus = {};

  lancamentos.forEach(l => {
    if (!l.data || !l.status) return;

    const [year, month, day] = l.data.split("-").map(Number);
    const dia = day;

    diasComStatus[dia] = l.status;
  });

  // Adiciona dias vazios no início, se o mês não começa no domingo
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "day";
    emptyDay.style.visibility = "hidden"; // invisível mas ocupa espaço
    calendarElement.appendChild(emptyDay);
  }

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

  renderizarLancamentos(lancamentos);
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
    carregarPlataformasExistentes();



    // Garante que o checklist carregue ao abrir formulário já com plataforma
const plataformaSelecionada = document.getElementById("plataforma")?.value;
if (plataformaSelecionada) {
  carregarChecklistsPorPlataforma(plataformaSelecionada);
}



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


// Alterna os blocos conforme escolha do usuário
function configurarAlternanciaDescricao() {
  const radioChecklist = document.getElementById("radioChecklist");
  const radioLivre = document.getElementById("radioLivre");
  const blocoChecklist = document.getElementById("blocoChecklist");
  const blocoDescricaoLivre = document.getElementById("blocoDescricaoLivre");

  function atualizarVisibilidade() {
    if (radioChecklist.checked) {
      blocoChecklist.style.display = "block";
      blocoDescricaoLivre.style.display = "none";
    } else {
      blocoChecklist.style.display = "none";
      blocoDescricaoLivre.style.display = "block";
    }
  }

  radioChecklist.addEventListener("change", atualizarVisibilidade);
  radioLivre.addEventListener("change", atualizarVisibilidade);
  atualizarVisibilidade(); // Atualiza ao carregar
}

// Chama a função no início
configurarAlternanciaDescricao();



// Excluir lançamento pelo ID
async function excluirLancamento(id) {
  if (confirm("Tem certeza que deseja excluir este lançamento?")) {
    try {
      const snapshot = await get(child(ref(db), "ops_activities/" + id));
      if (!snapshot.exists()) return alert("Lançamento não encontrado.");

      const dados = snapshot.val();
      const usuario = auth.currentUser.displayName || auth.currentUser.email;
      const timestamp = new Date().toISOString();

      // Adiciona log no histórico antes de excluir
      await push(ref(db, `ops_activities_history/${id}`), {
        tipo: "Exclusão",
        usuario,
        timestamp
      });

      await remove(ref(db, "ops_activities/" + id));

      await push(ref(db, "ops_activities_history/" + id), {
        data: new Date().toISOString(),
        acao: "exclusão",
        realizado_por: auth.currentUser.displayName || auth.currentUser.email
      });
      

      alert("Lançamento excluído com sucesso.");
      location.reload(); // Recarrega para atualizar a lista
    } catch (e) {
      console.error("Erro ao excluir:", e);
      alert("Erro ao excluir lançamento.");
    }
  }
}


async function verHistorico(id) {
  const historicoRef = child(ref(db), `ops_activities_history/${id}`);
  const snapshot = await get(historicoRef);

  const container = document.getElementById(`historico-${id}`);
  if (!snapshot.exists()) {
    container.innerHTML = "<em>Sem histórico encontrado.</em>";
  } else {
    const logs = snapshot.val();
    let html = "<ul>";
    Object.values(logs).forEach(log => {
      const acao = log.acao || log.tipo || "ação";
      const quem = log.realizado_por || log.usuario || "Desconhecido";
      const quando = log.data || log.timestamp || null;
      const dataFormatada = quando ? new Date(quando).toLocaleString() : "Data desconhecida";

      html += `<li><strong>${acao}</strong> por <em>${quem}</em><br/><small>${dataFormatada}</small></li>`;
    });
    html += "</ul>";
    container.innerHTML = html;
  }

  container.style.display = container.style.display === "none" ? "block" : "none";
}

function verificarOutraPlataforma() {
  const select = document.getElementById("plataforma");
  const novaContainer = document.getElementById("novaPlataformaContainer");

  if (select.value === "__nova__") {
    novaContainer.style.display = "block";
  } else {
    novaContainer.style.display = "none";
  }
}


async function carregarChecklistsPorPlataforma(plataforma) {
  const seletorChecklist = document.getElementById("seletorChecklist");
  const areaChecklist = document.getElementById("areaChecklistRenderizado");

  seletorChecklist.innerHTML = `<option value="">Selecione um checklist</option>`;
  areaChecklist.innerHTML = ""; // limpa checklist renderizado

  if (!plataforma) return;

  const checklistsRef = ref(db, "ops_checklists");
  const snapshot = await get(checklistsRef);

  let encontrados = 0;
  if (snapshot.exists()) {
    const todosChecklists = snapshot.val();

    Object.entries(todosChecklists).forEach(([id, checklist]) => {
      if (checklist.id_plataforma === plataforma) {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = checklist.titulo;
        seletorChecklist.appendChild(option);
        encontrados++;
      }
    });
  }

  // Se nenhum encontrado
  if (encontrados === 0) {
    seletorChecklist.innerHTML = `<option value="">Nenhum checklist encontrado para esta plataforma</option>`;
  }
}

document.getElementById("seletorChecklist").addEventListener("change", async function () {
  const checklistId = this.value;
  const area = document.getElementById("areaChecklistRenderizado");
  area.innerHTML = "";

  if (!checklistId) return;

  const checklistRef = ref(db, "ops_checklists/" + checklistId);
  const snapshot = await get(checklistRef);
  if (!snapshot.exists()) return;

  const checklist = snapshot.val();

  checklist.itens.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "checklist-item";
    div.innerHTML = `
      <input type="checkbox" id="item-${index}" data-index="${index}">
      <label for="item-${index}">${index + 1}. ${item.descricao}</label>
    `;
    area.appendChild(div);
  });
});

function abrirChecklistModal() {
  const modal = document.getElementById("modalChecklist");
  modal.style.display = "flex";
  limparChecklistForm();
}

function adicionarCampoChecklist() {
  const container = document.getElementById("itensChecklistContainer");
  const div = document.createElement("div");
  div.className = "checklist-item";
  div.innerHTML = `<input type="text" placeholder="Descrição do item" class="itemChecklistInput" />`;
  container.appendChild(div);
}

function limparChecklistForm() {
  document.getElementById("tituloChecklist").value = "";
  const container = document.getElementById("itensChecklistContainer");
  container.innerHTML = `
    <label>Itens do Checklist</label>
    <div class="checklist-item">
      <input type="text" placeholder="Descrição do item" class="itemChecklistInput" />
    </div>
  `;
}


// async function confirmarCriacaoChecklist() {
//  const titulo = document.getElementById("tituloChecklist").value.trim();
//  const plataforma = document.getElementById("plataforma").value;
//  const inputs = document.querySelectorAll(".itemChecklistInput");

//  const itens = Array.from(inputs)
//    .map(input => input.value.trim())
//    .filter(texto => texto.length > 0)
//    .map(texto => ({ descricao: texto, feito: false }));

//  if (!titulo || itens.length === 0) {
//    return alert("Preencha o título e pelo menos um item.");
//  }

//  await salvarChecklist(titulo, plataforma, itens);
//  alert("✅ Checklist salvo com sucesso!");

//  document.getElementById("modalChecklist").style.display = "none";
//  carregarChecklistsPorPlataforma(plataforma); // atualiza o seletor de checklists
// }

async function confirmarCriacaoChecklist() {
  const titulo = document.getElementById("tituloChecklist").value.trim();
  const plataforma = document.getElementById("plataforma").value;
  const inputs = document.querySelectorAll(".itemChecklistInput");

  const itens = Array.from(inputs)
    .map(input => input.value.trim())
    .filter(texto => texto.length > 0)
    .map(texto => ({ descricao: texto, feito: false }));

  if (!titulo || itens.length === 0) {
    return alert("Preencha o título e pelo menos um item.");
  }

  const editandoId = document.getElementById("modalChecklist").dataset.editando;

  const checklist = {
    id_plataforma: plataforma,
    titulo,
    itens,
    criado_por: auth.currentUser.displayName || auth.currentUser.email,
    criado_em: new Date().toISOString()
  };

  if (editandoId) {
    await set(ref(db, "ops_checklists/" + editandoId), checklist);
    alert("✅ Checklist atualizado com sucesso!");
  } else {
    await push(ref(db, "ops_checklists"), checklist);
    alert("✅ Checklist salvo com sucesso!");
  }

  document.getElementById("modalChecklist").style.display = "none";
  document.getElementById("modalChecklist").dataset.editando = "";

  carregarChecklistsPorPlataforma(plataforma); // atualiza o seletor
}




window.confirmarCriacaoChecklist = confirmarCriacaoChecklist;
window.adicionarCampoChecklist = adicionarCampoChecklist;

function fecharChecklistModal() {
  document.getElementById("modalChecklist").style.display = "none";
}



function toggleFormulario() {
  const form = document.getElementById("form-atividade");
  if (!form) return;

  const diaSelecionado = document.querySelector(".dia.selecionado");
  const mes = document.getElementById("mes")?.dataset.mes;
  const ano = document.getElementById("ano")?.textContent;

  if (diaSelecionado && mes && ano) {
    const dia = diaSelecionado.dataset.dia;
    document.getElementById("dataAtividade").value = `${ano}-${mes}-${dia}`;
  }

  // Alterna visibilidade com estilo direto
  const mostrando = form.style.display === "none";
form.style.display = mostrando ? "block" : "none";
if (!mostrando) limparFormularioAtividade();

}

function limparFormularioAtividade() {
  document.getElementById("dataAtividade").value = "";
  document.getElementById("dataFimAtividade").value = "";
  document.getElementById("plataforma").value = "";
  document.getElementById("novaPlataforma").value = "";
  document.getElementById("novaPlataformaContainer").style.display = "none";
  document.getElementById("responsavel").value = "";
  document.getElementById("descricao").value = "";
  document.getElementById("status").value = "pendente";
  document.getElementById("formaLancamento").value = "manual";
  document.getElementById("observacoes").value = "";
  document.getElementById("radioChecklist").checked = true;
  document.getElementById("seletorChecklist").selectedIndex = 0;
  document.getElementById("areaChecklistRenderizado").innerHTML = "";
}

// 🔧 NOVO: Editar checklist já existente
async function editarChecklistSelecionado() {
  const seletor = document.getElementById("seletorChecklist");
  const idChecklist = seletor.value;
  if (!idChecklist) return alert("Selecione um checklist para editar.");

  const refChecklist = ref(db, "ops_checklists/" + idChecklist);
  const snapshot = await get(refChecklist);

  if (!snapshot.exists()) return alert("Checklist não encontrado.");

  const checklist = snapshot.val();

  // Preenche os campos do modal com os dados
  document.getElementById("tituloChecklist").value = checklist.titulo || "";

  const container = document.getElementById("itensChecklistContainer");
  container.innerHTML = "";
  checklist.itens.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "checklist-item";
    div.innerHTML = `<input type="text" class="itemChecklistInput" value="${item.descricao}" />`;
    container.appendChild(div);
  });

  // Marca que estamos em modo edição
  document.getElementById("modalChecklist").dataset.editando = idChecklist;

  document.getElementById("modalChecklist").style.display = "flex";
}


window.fecharChecklistModal = fecharChecklistModal;
window.carregarChecklistsPorPlataforma = carregarChecklistsPorPlataforma;



window.abrirChecklistModal = abrirChecklistModal;
window.editarChecklistSelecionado = editarChecklistSelecionado;



window.verificarOutraPlataforma = verificarOutraPlataforma;

window.verHistorico = verHistorico;
window.excluirLancamento = excluirLancamento;
window.lancarAtividade = lancarAtividade;
window.toggleFormulario = toggleFormulario;
window.editarLancamento = editarLancamento;


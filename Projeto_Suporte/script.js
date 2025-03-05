// Função para adicionar um chamado à lista
function adicionarChamado() {
    let titulo = document.getElementById("titulo").value;
    let descricao = document.getElementById("descricao").value;

    if (titulo === "" || descricao === "") {
        alert("Preencha todos os campos!");
        return;
    }

    let lista = document.getElementById("listaChamados");
    let item = document.createElement("li");
    item.innerHTML = `<strong>${titulo}</strong><p>${descricao}</p><button onclick="removerChamado(this)">Finalizar</button>`;
    
    lista.appendChild(item);

    // Limpar os campos após adicionar o chamado
    document.getElementById("titulo").value = "";
    document.getElementById("descricao").value = "";
}

// Função para remover um chamado da lista
function removerChamado(elemento) {
    elemento.parentElement.remove();
}
function adicionarChamado() {
    let titulo = document.getElementById("titulo").value;
    let descricao = document.getElementById("descricao").value;
    let data = document.getElementById("data").value;

    if (titulo === "" || descricao === "" || data === "") {
        alert("Preencha todos os campos!");
        return;
    }

    // Exibir no calendário
    adicionarAoCalendario(data, titulo, descricao);

    // Limpar os campos após adicionar o chamado
    document.getElementById("titulo").value = "";
    document.getElementById("descricao").value = "";
    document.getElementById("data").value = "";
}
function adicionarAoCalendario(data, titulo, descricao) {
    // Verificar se já existe um dia correspondente no calendário
    let dia = document.getElementById(`calendario-${data}`);
    if (!dia) {
        // Criar um novo bloco de dia no calendário
        dia = document.createElement("div");
        dia.className = "calendario-dia";
        dia.id = `calendario-${data}`;
        dia.innerHTML = `<span class="data">${data}</span>`;
        document.getElementById("calendario").appendChild(dia);
    }

    // Adicionar a demanda ao dia correspondente
    let demanda = document.createElement("div");
    demanda.innerHTML = `<strong>${titulo}</strong><p>${descricao}</p>`;
    dia.appendChild(demanda);
}

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

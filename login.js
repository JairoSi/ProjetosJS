document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // Pegue os valores dos campos de entrada
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Aqui você faria uma validação. Vamos usar um exemplo básico:
    if (email === 'usuario@exemplo.com' && password === 'senha123') {
        // Se estiver correto, redirecione para a página de lançamentos
        window.location.href = 'lancamentos.html';
    } else {
        // Caso contrário, mostre uma mensagem de erro
        alert('E-mail ou senha incorretos');
    }
});

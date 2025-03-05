// Inicialize o cliente do Supabase (adicione sua URL e chave)
const SUPABASE_URL = "https://scbfdducpgnxjzdmnnmv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjYmZkZHVjcGdueGp6ZG1ubm12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExOTU3NDcsImV4cCI6MjA1Njc3MTc0N30.YMjicsUm6LePBeaOnHCQqN4xSYTX67P9bk0TC5Epo4M.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjYmZkZHVjcGdueGp6ZG1ubm12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExOTU3NDcsImV4cCI6MjA1Njc3MTc0N30.YMjicsUm6LePBeaOnHCQqN4xSYTX67P9bk0TC5Epo4M";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Pegue os valores dos campos de entrada
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Tente fazer login via Supabase
    const { session, error } = await supabase.auth.signIn({ email, password });
    
    if (error) {
        // Exibe uma mensagem de erro se a autenticação falhar
        alert('E-mail ou senha incorretos');
    } else {
        // Se o login for bem-sucedido, redirecione para a página de lançamentos
        window.location.href = 'lancamentos.html';
    }
});

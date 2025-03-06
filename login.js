<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
</head>
<body>
    <h2>Login</h2>
    <form id="loginForm">
        <label for="email">E-mail:</label>
        <input type="email" id="email" placeholder="Digite seu e-mail" required>

        <label for="senha">Senha:</label>
        <input type="password" id="senha" placeholder="Digite sua senha" required>

        <button type="submit">Entrar</button>
    </form>

    <p id="mensagem"></p>

    <script>
        const SUPABASE_URL = "https://scbfdducpgnxjzdmnnmv.supabase.co";
        const SUPABASE_KEY = "SUA_CHAVE_SECRETA_AQUI"; // Substitua pela sua chave segura
        const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        document.getElementById('loginForm').addEventListener('submit', async function(event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            const mensagem = document.getElementById('mensagem');

            const { data, error } = await supabase.from("usuarios").select("*").eq("email", email).eq("senha", senha).single();

            if (error || !data) {
                mensagem.textContent = "E-mail ou senha incorretos";
                mensagem.style.color = "red";
            } else {
                mensagem.textContent = "Login realizado com sucesso!";
                mensagem.style.color = "green";
                console.log("Usuário logado:", data);

                // Redirecionar para outra página após login bem-sucedido
                window.location.href = "dashboard.html";
            }
        });
    </script>
</body>
</html>

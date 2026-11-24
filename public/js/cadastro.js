const form = document.getElementById('form-cadastro');
const mensagem = document.getElementById('mensagem');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensagem.textContent = '';
  const botao = form.querySelector('button');
  botao.disabled = true;
  try {
    await api('/api/auth/cadastro', {
      method: 'POST',
      body: { nome: form.nome.value, email: form.email.value, senha: form.senha.value },
    });
    location.href = '/';
  } catch (erro) {
    mensagem.textContent = erro.message;
  } finally {
    botao.disabled = false;
  }
});

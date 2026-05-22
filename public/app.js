const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');

function showMessage(text) {
  message.textContent = text;
  setTimeout(() => {
    message.textContent = '';
  }, 3000);
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    showMessage('Preencha e-mail e senha.');
    return;
  }

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.mensagem || 'Falha no login');
    }

    const data = await response.json();
    localStorage.setItem('jwtToken', data.token);
    window.location.href = '/cadastro';
  } catch (error) {
    showMessage(error.message);
  }
}

loginForm.addEventListener('submit', handleLogin);

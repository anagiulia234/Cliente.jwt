const apiBase = '/Clientes';
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const refreshButton = document.getElementById('refreshButton');
const clientTable = document.getElementById('clientTable');
const message = document.getElementById('message');
const clientForm = document.getElementById('clientForm');
const clearButton = document.getElementById('clearButton');
const logoutButton = document.getElementById('logoutButton');

function getToken() {
  return localStorage.getItem('jwtToken');
}

function showMessage(text) {
  message.textContent = text;
  setTimeout(() => {
    message.textContent = '';
  }, 3000);
}

function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

function redirectToLogin() {
  localStorage.removeItem('jwtToken');
  window.location.href = '/';
}

async function fetchJson(url, options = {}) {
  const token = getToken();
  if (!token) {
    redirectToLogin();
    return null;
  }

  const response = await fetch(url, options);
  if (response.status === 401) {
    redirectToLogin();
    return null;
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.mensagem || 'Erro na requisição');
  }

  return response.json();
}

async function loadClients() {
  const clients = await fetchJson(apiBase, { headers: getAuthHeaders() });
  if (clients) {
    renderTable(clients);
  }
}

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function renderTable(clients) {
  clientTable.innerHTML = '';

  if (!clients || clients.length === 0) {
    clientTable.innerHTML = '<tr><td colspan="6">Nenhum cliente encontrado.</td></tr>';
    return;
  }

  clients.forEach(client => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${client.id}</td>
      <td>${client.nome}</td>
      <td>${client.cpf}</td>
      <td>${client.email}</td>
      <td>${client.telefone}</td>
      <td>
        <button class="edit-button" data-id="${client.id}">Editar</button>
        <button class="delete-button" data-id="${client.id}">Excluir</button>
      </td>
    `;

    clientTable.appendChild(tr);
  });
}

function fillForm(client) {
  document.getElementById('clientId').value = client.id || '';
  document.getElementById('nome').value = client.nome || '';
  document.getElementById('cpf').value = client.cpf || '';
  document.getElementById('email').value = client.email || '';
  document.getElementById('telefone').value = client.telefone || '';
}

function clearForm() {
  fillForm({});
}

async function handleSearch() {
  const term = searchInput.value.trim();
  if (!term) {
    await loadClients();
    return;
  }

  const clients = await fetchJson(`${apiBase}/buscar/nome/${encodeURIComponent(term)}`, {
    headers: getAuthHeaders()
  });
  if (clients) {
    renderTable(clients);
  }
}

async function handleSave(event) {
  event.preventDefault();

  const id = document.getElementById('clientId').value;
  const nome = document.getElementById('nome').value.trim();
  const cpf = document.getElementById('cpf').value.trim();
  const email = document.getElementById('email').value.trim();
  const telefone = document.getElementById('telefone').value.trim();

  if (!nome || !cpf || !email || !telefone) {
    showMessage('Preencha todos os campos corretamente.');
    return;
  }

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${apiBase}/${id}` : apiBase;

  try {
    await fetchJson(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify({ nome, cpf, email, telefone})
    });

    clearForm();
    await loadClients();
    showMessage(id ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!');
  } catch (error) {
    showMessage(error.message);
  }
}

async function handleTableClick(event) {
  const target = event.target;
  if (target.matches('.edit-button')) {
    const clientId = target.dataset.id;
    await loadClient(clientId);
  }

  if (target.matches('.delete-button')) {
    const clientId = target.dataset.id;
    await deleteClient(clientId);
  }
}

async function loadClient(id) {
  const client = await fetchJson(`${apiBase}/buscar/id/${id}`, {
    headers: getAuthHeaders()
  });
  if (client) {
    fillForm(client);
  }
}

async function deleteClient(id) {
  if (!confirm('Deseja realmente excluir este cliente?')) {
    return;
  }

  try {
    await fetchJson(`${apiBase}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    await loadClients();
    showMessage('Cliente excluído com sucesso!');
  } catch (error) {
    showMessage(error.message);
  }
}

logoutButton.addEventListener('click', redirectToLogin);
searchButton.addEventListener('click', handleSearch);
refreshButton.addEventListener('click', loadClients);
clientForm.addEventListener('submit', handleSave);
clearButton.addEventListener('click', clearForm);
clientTable.addEventListener('click', handleTableClick);

loadClients();

// Initialize Socket.IO connection
console.log('🔧 Iniciando Socket.IO client...');

const tokenInput = document.getElementById('tokenInput');
const userInput = document.getElementById('userInput');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');

// Set default token for testing (replace with actual JWT)
tokenInput.value = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NzYxODczMDYsImV4cCI6MTc3NjI3MzcwNn0.EZ3aFJiTn6hvnhLuVGPTTyv8oOxJU0AUzeWc0mYqoNo";

// Create socket with authentication
const socket = io({
  auth: {
    token: tokenInput.value
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

console.log('🔧 Socket instance creado:', socket);

// Set default username
userInput.value = `Usuario_${Math.floor(Math.random() * 1000)}`;

// Socket.IO connection events
socket.on('connect', () => {
    console.log('✅ Conectado al servidor Socket.IO');
    console.log('Socket ID:', socket.id);
    updateStatus(true);
    enableInputs();
    clearMessages();
    addSystemMessage('¡Conectado al chat! Bienvenido.');
    loadMessageHistory();
});

socket.on('disconnect', () => {
    console.log('❌ Desconectado del servidor');
    updateStatus(false);
    disableInputs();
    addSystemMessage('Desconectado del servidor. Intentando reconectar...');
});

socket.on('connect_error', (error) => {
    console.error('❌ Error de conexión:', error);
    addSystemMessage(`Error de conexión: ${error.message || error}`);
});

socket.on('receive-message', (data) => {
    console.log('📨 Mensaje recibido:', data);
    addMessage(data);
});

socket.on('error', (error) => {
    console.error('❌ Error de socket:', error);
    addSystemMessage(`Error: ${error.message || error}`);
});

// Load message history from server
async function loadMessageHistory() {
    try {
        const response = await fetch('/messages?limit=20', {
            headers: {
                'Authorization': tokenInput.value,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.messages && data.messages.length > 0) {
                data.messages.forEach(msg => {
                    addMessage({
                        user: msg.username,
                        message: msg.text,
                        timestamp: msg.created_at
                    });
                });
                addSystemMessage(`Cargados ${data.messages.length} mensajes del historial.`);
            }
        } else {
            console.warn('No se pudo cargar el historial de mensajes');
        }
    } catch (error) {
        console.error('Error cargando historial:', error);
    }
}

// UI Update functions
function updateStatus(isConnected) {
    if (isConnected) {
        statusIndicator.classList.remove('disconnected');
        statusIndicator.classList.add('connected');
        statusText.textContent = 'Conectado';
    } else {
        statusIndicator.classList.remove('connected');
        statusIndicator.classList.add('disconnected');
        statusText.textContent = 'Desconectado';
    }
}

function enableInputs() {
    userInput.disabled = false;
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();
}

function disableInputs() {
    userInput.disabled = true;
    messageInput.disabled = true;
    sendBtn.disabled = true;
}

function clearMessages() {
    messagesContainer.innerHTML = '';
}

function addMessage(data) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    
    const time = new Date(data.timestamp).toLocaleTimeString('es-ES');
    
    messageElement.innerHTML = `
        <div class="message-header">
            <span class="message-user">${escapeHtml(data.user)}</span>
            <span class="message-time">${time}</span>
        </div>
        <div class="message-text">${escapeHtml(data.message)}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addSystemMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.style.background = '#e3f2fd';
    messageElement.style.borderLeft = '4px solid #667eea';
    
    messageElement.innerHTML = `
        <div class="message-header">
            <span class="message-user" style="color: #667eea;">🤖 Sistema</span>
            <span class="message-time">${new Date().toLocaleTimeString('es-ES')}</span>
        </div>
        <div class="message-text">${text}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message handler
function sendMessage() {
    const message = messageInput.value.trim();

    if (!message) {
        alert('Por favor, escribe un mensaje');
        messageInput.focus();
        return;
    }

    // Emit message to server (username comes from JWT)
    socket.emit('new-message', {
        message: message
    });

    // Clear message input
    messageInput.value = '';
    messageInput.focus();
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        messageInput.focus();
    }
});

// Update socket auth when token changes
tokenInput.addEventListener('input', () => {
    // Note: In a real app, you'd reconnect with new token
    console.log('Token actualizado - necesitarías reconectar manualmente');
});

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initial status
updateStatus(false);
addSystemMessage('Conectando al servidor...');

// Obtener referencias a los elementos del DOM
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// main.js

function setVh() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Ejecutar la función al cargar la página
window.addEventListener('load', setVh);

// Ejecutar la función al redimensionar la ventana
window.addEventListener('resize', setVh);

// Definir un identificador único para el usuario
const senderId = 'test_user'; // Puedes generar dinámicamente un ID si lo prefieres

/**
 * Función para añadir un mensaje al chat.
 * @param {string} sender - El remitente del mensaje ('user' o 'bot').
 * @param {string} text - El contenido del mensaje.
 */
function appendMessage(sender, text) {
    console.log(`appendMessage llamado con sender: ${sender}, text: ${text}`);
    const message = document.createElement('div');
    message.classList.add('message', sender);

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.textContent = text;

    message.appendChild(messageContent);
    chatMessages.appendChild(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Función asíncrona para enviar un mensaje al bot y procesar la respuesta.
 */
async function sendMessage() {
    const text = userInput.value.trim();
    console.log('sendMessage llamado con text:', text);
    if (text === '') {
        console.warn('El mensaje está vacío. No se enviará nada.');
        return;
    }

    appendMessage('user', text);
    userInput.value = '';

    // Deshabilitar los elementos de entrada mientras se procesa la solicitud
    sendButton.disabled = true;
    userInput.disabled = true;

    try {
        const requestBody = {
            sender: senderId,
            message: text
        };
        console.log('Enviando solicitud a RASA con body:', requestBody);

        const response = await fetch('http://35.202.125.104:5005/webhooks/rest/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Respuesta recibida de RASA:', response);

        if (!response.ok) {
            console.error('Respuesta no OK. Estado:', response.status, response.statusText);
            throw new Error('Error en la respuesta de la API');
        }

        const data = await response.json();
        console.log('Datos parseados de la respuesta:', data);

        if (Array.isArray(data) && data.length > 0) {
            data.forEach(botMessage => {
                console.log('Procesando botMessage:', botMessage);
                if (botMessage.text) {
                    appendMessage('bot', botMessage.text);
                }
                // Manejar otros tipos de mensajes aquí
            });
        } else {
            console.warn('La respuesta no contiene mensajes de texto.', data);
            appendMessage('bot', 'Lo siento, no entendí tu mensaje.');
        }
    } catch (error) {
        console.error('Error al comunicarse con RASA:', error);
        appendMessage('bot', 'Lo siento, hubo un error al procesar tu mensaje.');
    } finally {
        // Rehabilitar los elementos de entrada
        sendButton.disabled = false;
        userInput.disabled = false;
        userInput.focus();
        console.log('Elementos de entrada habilitados.');
    }
}

// Añadir un listener al botón de enviar
sendButton.addEventListener('click', () => {
    console.log('Botón de enviar clicado.');
    sendMessage();
});

// Añadir un listener al campo de entrada para enviar el mensaje al presionar 'Enter'
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevenir el comportamiento predeterminado
        console.log('Tecla Enter presionada en el campo de entrada.');
        sendMessage();
    }
});


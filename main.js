// Obtener referencias a los elementos del DOM
const chatMessages = document.getElementById('chat-messages'); // Contenedor donde se mostrarán los mensajes del chat
const userInput = document.getElementById('user-input'); // Campo de entrada donde el usuario escribe su mensaje
const sendButton = document.getElementById('send-button'); // Botón para enviar el mensaje

// Define un identificador único para el usuario
const senderId = 'test_user'; // Puedes generar dinámicamente un ID si lo prefieres para identificar de manera única al usuario

/**
 * Función para añadir un mensaje al chat.
 * @param {string} sender - El remitente del mensaje ('user' o 'bot').
 * @param {string} text - El contenido del mensaje.
 */
function appendMessage(sender, text) {
    // Crear un nuevo elemento div para el mensaje
    const message = document.createElement('div');
    message.classList.add('message', sender); // Añadir clases CSS para estilizar el mensaje según el remitente

    // Crear un contenedor para el contenido del mensaje
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content'); // Añadir clase CSS para estilizar el contenido del mensaje
    messageContent.textContent = text; // Asignar el texto del mensaje

    // Añadir el contenido al mensaje y el mensaje al contenedor de chat
    message.appendChild(messageContent);
    chatMessages.appendChild(message);

    // Desplazar automáticamente hacia abajo para mostrar el mensaje más reciente
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Función asíncrona para enviar un mensaje al bot y procesar la respuesta.
 */
async function sendMessage() {
    // Obtener y limpiar el texto ingresado por el usuario
    const text = userInput.value.trim();
    if (text === '') return; // Si el mensaje está vacío, no hacer nada

    // Añadir el mensaje del usuario al chat y limpiar el campo de entrada
    appendMessage('user', text);
    userInput.value = '';

    // Llamada a la API de RASA
    try {
        // Realizar una solicitud POST al webhook de RASA con el mensaje del usuario
        const response = await fetch('http://35.202.125.104:5005/webhooks/rest/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Especificar el tipo de contenido como JSON
            },
            body: JSON.stringify({
                sender: senderId, // Identificador único del remitente
                message: text // Mensaje del usuario
            })
        });

        // Verificar si la respuesta de la API fue exitosa
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }

        // Parsear la respuesta JSON de la API
        const data = await response.json();

        // RASA devuelve un array de respuestas, iterar sobre ellas
        if (Array.isArray(data) && data.length > 0) {
            data.forEach(botMessage => {
                if (botMessage.text) {
                    appendMessage('bot', botMessage.text); // Añadir el mensaje del bot al chat
                }
                // Si RASA devuelve otros tipos de mensajes (imágenes, botones, etc.), puedes manejarlos aquí
            });
        } else {
            // Si la respuesta no contiene mensajes de texto, mostrar un mensaje predeterminado
            appendMessage('bot', 'Lo siento, no entendí tu mensaje.');
        }
    } catch (error) {
        // Manejar cualquier error que ocurra durante la solicitud
        console.error('Error al comunicarse con RASA:', error);
        appendMessage('bot', 'Lo siento, hubo un error al procesar tu mensaje.');
    }
}

// Añadir un listener al botón de enviar para que al hacer clic se envíe el mensaje
sendButton.addEventListener('click', sendMessage);

// Añadir un listener al campo de entrada para que al presionar 'Enter' se envíe el mensaje
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

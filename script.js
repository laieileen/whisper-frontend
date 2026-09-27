// Backend URL
const BACKEND_URL = 'https://whisper-backend-jrie.onrender.com';

// DOM Elements
const submitForm = document.getElementById('submitForm');
const messageInput = document.getElementById('messageInput');
const charCount = document.getElementById('charCount');
const submitStatus = document.getElementById('submitStatus');
const fetchBtn = document.getElementById('fetchBtn');
const loadingContainer = document.getElementById('loadingContainer');
const messagesContainer = document.getElementById('messagesContainer');
const errorContainer = document.getElementById('errorContainer');
let lastDrawnMessageKey = null;

class ApiError extends Error {
    constructor(status) {
        super(`Request failed with status ${status}`);
        this.status = status;
    }
}

async function requestJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(response.status);
    }

    return data;
}

function friendlyRequestError(error, action) {
    if (error instanceof ApiError && error.status >= 500) {
        return 'The jar’s storage shelf is unavailable right now. Try again later.';
    }

    if (error instanceof ApiError) {
        return action === 'submit'
            ? 'The jar couldn’t accept that note. Please try again.'
            : 'The jar couldn’t open its messages. Please try again.';
    }

    return action === 'submit'
        ? 'Couldn’t reach the jar. We couldn’t confirm your note was saved.'
        : 'Couldn’t reach the jar. Check your connection and try again.';
}

// Character counter
messageInput.addEventListener('input', (e) => {
    charCount.textContent = e.target.value.length;
});

// Submit Form
submitForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const text = messageInput.value.trim();

    if (!text) {
        showStatus('Please write something', 'error');
        return;
    }

    try {
        await requestJson(`${BACKEND_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        showStatus('✨ Message left in the jar', 'success');
        messageInput.value = '';
        charCount.textContent = '0';

    } catch (error) {
        console.error('Error:', error);
        showStatus(friendlyRequestError(error, 'submit'), 'error');
    }
});

// Fetch Messages
fetchBtn.addEventListener('click', drawNote);

async function drawNote() {
    showLoading(true);
    clearError();

    try {
        const data = await requestJson(`${BACKEND_URL}/messages`);
        showLoading(false);

        if (Array.isArray(data?.messages) && data.messages.length > 0) {
            displayMessage(drawRandomMessage(data.messages));
        } else {
            messagesContainer.innerHTML = '<div class="empty-message">The jar is waiting for its first whisper...</div>';
        }

    } catch (error) {
        console.error('Error:', error);
        showLoading(false);

        showError(friendlyRequestError(error, 'fetch'));
    }
}

function drawRandomMessage(messages) {
    const availableMessages = messages.filter((message) => getMessageKey(message) !== lastDrawnMessageKey);
    const choices = availableMessages.length > 0 ? availableMessages : messages;
    const message = choices[Math.floor(Math.random() * choices.length)];
    lastDrawnMessageKey = getMessageKey(message);
    return message;
}

function getMessageKey(message) {
    return `${message.timestamp ?? ''}:${message.text ?? ''}`;
}

function displayMessage(msg) {
    messagesContainer.innerHTML = '';

    const messageEl = document.createElement('article');
    messageEl.className = 'message-item';

    const messageText = document.createElement('p');
    messageText.className = 'message-text';
    messageText.textContent = msg.text;
    messageEl.appendChild(messageText);

    if (msg.timestamp) {
        const timestamp = new Date(msg.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const messageTime = document.createElement('time');
        messageTime.className = 'message-time';
        messageTime.dateTime = new Date(msg.timestamp).toISOString();
        messageTime.textContent = timestamp;
        messageEl.appendChild(messageTime);
    }

    messagesContainer.appendChild(messageEl);
}

function showLoading(show) {
    if (show) {
        loadingContainer.classList.remove('hidden');
    } else {
        loadingContainer.classList.add('hidden');
    }
}

function showStatus(message, type) {
    submitStatus.textContent = message;
    submitStatus.className = `status-message ${type}`;

    // Auto-clear after 4 seconds
    setTimeout(() => {
        submitStatus.className = 'status-message';
    }, 4000);
}

function showError(message) {
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
}

function clearError() {
    errorContainer.classList.add('hidden');
    errorContainer.textContent = '';
}

// Load messages on page load
window.addEventListener('load', () => {
    // Optional: auto-load messages when page loads
    // fetchMessages();
});
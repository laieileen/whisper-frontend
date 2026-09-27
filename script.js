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
        const response = await fetch(`${BACKEND_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error('Failed to submit message');
        }

        showStatus('✨ Message left in the jar', 'success');
        messageInput.value = '';
        charCount.textContent = '0';

        // Auto-fetch messages after submit
        setTimeout(() => {
            fetchMessages();
        }, 500);

    } catch (error) {
        console.error('Error:', error);
        showStatus('Oops! Couldn\'t save your message. Try again?', 'error');
    }
});

// Fetch Messages
fetchBtn.addEventListener('click', fetchMessages);

async function fetchMessages() {
    showLoading(true);
    clearError();
    messagesContainer.innerHTML = '';

    try {
        const response = await fetch(`${BACKEND_URL}/messages`);

        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        showLoading(false);

        if (data.messages && data.messages.length > 0) {
            displayMessages(data.messages);
        } else {
            messagesContainer.innerHTML = '<div class="empty-message">The jar is waiting for its first whisper...</div>';
        }

    } catch (error) {
        console.error('Error:', error);
        showLoading(false);

        // Check if it's a backend connection error
        if (error.message === 'Failed to fetch') {
            showError('The server is sleeping. This can take 30 seconds on first load. Try again?');
        } else {
            showError('Couldn\'t peek inside the jar. Try again?');
        }
    }
}

function displayMessages(messages) {
    messagesContainer.innerHTML = '';

    messages.forEach((msg, index) => {
        const messageEl = document.createElement('div');
        messageEl.className = 'message-item';

        const timestamp = new Date(msg.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        messageEl.innerHTML = `
            <div class="message-text">${escapeHtml(msg.text)}</div>
            <div class="message-time">${timestamp}</div>
        `;

        messagesContainer.appendChild(messageEl);
    });
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

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Load messages on page load
window.addEventListener('load', () => {
    // Optional: auto-load messages when page loads
    // fetchMessages();
});
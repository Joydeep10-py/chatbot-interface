const API_BASE = 'http://127.0.0.1:8000/';
const container = document.querySelector('.container');

// ========== LOGIN PAGE FUNCTIONALITY ==========
const loginPage = document.getElementById('loginPage');
const chatbotPage = document.getElementById('chatbotPage');
const loginForm = document.getElementById('loginForm');

// Fixed: logout button event listener
document.getElementById('logout-btn').addEventListener('click', logout);

function logout() {
    localStorage.clear();
    showLogin();
}

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Basic validation
    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) throw new Error('Invalid credentials');

        const data = await response.json();
            
        // Save Tokens
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('username', username);
            
        showApp();
    } catch (err) {
        alert(err.message);
    }
    
    // Clear form
    loginForm.reset();
});

// Check if logged in on load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access_token');
    if (token) {
        showApp();
    } else {
        showLogin();
    }
});

// --- API HELPERS ---
async function authenticatedFetch(endpoint, options = {}) {
    let token = localStorage.getItem('access_token');
            
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        logout();
        throw new Error("Session expired");
    }

    return response;
}

// --- UI NAVIGATION ---
function showLogin() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('chatbotPage').classList.add('hidden');
}

function showApp() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('chatbotPage').classList.remove('hidden');
    
    // Fixed: Check if element exists before setting text
    const userDisplay = document.getElementById('current-user-display');
    if (userDisplay) {
        userDisplay.textContent = localStorage.getItem('username') || 'User';
    }
}

function switchTab(tabName) {
    // Reset Sidebar styles
    document.getElementById('menu-chat').className = "menu-item-unselected";
    document.getElementById('menu-dashboard').className = "menu-item-unselected";

    // Hide all tabs
    document.getElementById('tab-chat').classList.add('hidden');
    document.getElementById('tab-dashboard').classList.add('hidden');

    // Show selected
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');

    if (tabName === 'chat') {
        document.getElementById('menu-chat').className = "menu-item";
    } else {
        document.getElementById('menu-dashboard').className = "menu-item";
    }
}

// ========== CHATBOT FUNCTIONALITY ==========
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.querySelector(".sidebar-toggle");

let userMessage = "";

document.getElementById("send-prompt-btn").addEventListener('click', function(e) {
    container.classList.toggle('is-hidden');
});

// Function to create message elements
const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Handling the form submission
const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if(!userMessage) return;

    promptInput.value = "";

    // Generate user message HTML and add it in chats-container
    const userMsgHTML = `<p class="message-text"></p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");

    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);

    setTimeout(() => {
        // Generate bot message HTML and add it in chats-container in 600ms
        const botMsgHTML = `<img src="images/robot.png" class="avatar"><p class="message-text">Just a sec..</p>`;
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
        chatsContainer.appendChild(botMsgDiv);
    }, 600);
};

// Toggle sidebar (for mobile)
const toggleSidebar = () => {
    sidebar.classList.toggle("collapsed");
};

// Initialize sidebar state based on screen size
const initializeSidebar = () => {
    if (window.innerWidth <= 768) {
        sidebar.classList.add("collapsed");
    } else {
        sidebar.classList.remove("collapsed");
    }
};

// Event Listeners
promptForm.addEventListener("submit", handleFormSubmit);
if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
}

// Call on page load
window.addEventListener('load', initializeSidebar);

// Reinitialize on window resize
window.addEventListener("resize", initializeSidebar);

// Recent chat items click handler
const recentChatItems = document.querySelectorAll(".recent-chat-item");
recentChatItems.forEach(item => {
    item.addEventListener("click", () => {
        recentChatItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");
    });
});

// ========== MODAL FUNCTIONALITY ==========

// Get modal elements
const digitalBoundariesLink = document.querySelector('.chat-link');
const digitalBoundariesModal = document.getElementById('digitalboundaries');
const closeDigitalModal = document.getElementById('closeDigitalModal');

const teamManagementLink = document.querySelector('.team-link');
const breathingModal = document.getElementById('breathingModal');
const closeBreathingModal = document.getElementById('closeBreathingModal');

const gratitudeLoopLink = document.querySelector('.info-link');
const gratitudeLoopModal = document.getElementById('gratitudeLoop');
const closeGratitudeModal = document.getElementById('closeGratitudeLoop');

// Open Digital Boundaries Modal
if (digitalBoundariesLink) {
    digitalBoundariesLink.addEventListener('click', function(e) {
        e.preventDefault();
        digitalBoundariesModal.classList.add('active');
    });
}

// Open Breathing Modal
if (teamManagementLink) {
    teamManagementLink.addEventListener('click', (e) => {
        e.preventDefault();
        breathingModal.classList.add('active');
    });
}

// Open Gratitude Modal
if (gratitudeLoopLink) {
    gratitudeLoopLink.addEventListener('click', (e) => {
        e.preventDefault();
        gratitudeLoopModal.classList.add('active');
    });
}

// Close Digital Boundaries Modal
if (closeDigitalModal) {
    closeDigitalModal.addEventListener('click', () => {
        digitalBoundariesModal.classList.remove('active');
    });
}

// Close Breathing Modal
if (closeBreathingModal) {
    closeBreathingModal.addEventListener('click', () => {
        breathingModal.classList.remove('active');
    });
}

// Close Gratitude Modal
if (closeGratitudeModal) {
    closeGratitudeModal.addEventListener('click', () => {
        gratitudeLoopModal.classList.remove('active');
    });
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === breathingModal) {
        breathingModal.classList.remove('active');
    }
    if (e.target === digitalBoundariesModal) {
        digitalBoundariesModal.classList.remove('active');
    }
    if (e.target === gratitudeLoopModal) {
        gratitudeLoopModal.classList.remove('active');
    }
});

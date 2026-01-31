const API_BASE = 'http://127.0.0.1:8000/';
const container = document.querySelector('.container');

// ========== LOGIN PAGE FUNCTIONALITY ==========
const loginPage = document.getElementById('loginPage');
const chatbotPage = document.getElementById('chatbotPage');
const loginForm = document.getElementById('loginForm');

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
        const response = await fetch(`${API_BASE}/login/`, {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
            });

            if (!response.ok) throw new Error('Invalid credentials');

            const data = await response.json();
                
            // Save Tokens
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('username', username); // Store username for display
                
            showApp();
        } catch (err) {
                showToast(err.message);
        }
    
    // Clear form
    this.reset();

    function logout() {
        localStorage.clear();
        showLogin();
    }
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
                // Token expired - simple logout handling for now
                // Ideally implement refresh token logic here
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
    document.getElementById('current-user-display').textContent = localStorage.getItem('username') || 'User';
            
    // Load initial data
    // loadChatHistory();
}

function switchTab(tabName) {
    // Reset Sidebar styles
    document.getElementById('menu-chat').className = "menu-item-unselected";
    document.getElementById('menu-dashboard').className = "menu-item-unselected"

    // Hide all tabs
    document.getElementById('tab-chat').classList.add('hidden');
    document.getElementById('tab-dashboard').classList.add('hidden');

    // Show selected
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');

    if (tabName === 'chat') {
        document.getElementById('menu-chat').className = "menu-item";
    } else {
        document.getElementById('menu-dashboard').className = "menu-item";
        // loadTeamDashboard();
    }
}


// ========== CHATBOT FUNCTIONALITY ==========
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.querySelector(".sidebar-toggle");

let userMessage = "";

document.getElementById("send-prompt-btn").addEventListener('click',
    function(e){
        container.classList.toggle('is-hidden')
    }
)

// Function to create message elements
const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

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
}

// Toggle sidebar (for mobile)
const toggleSidebar = () => {
    sidebar.classList.toggle("collapsed");
}

// Initialize sidebar state based on screen size
const initializeSidebar = () => {
    if (window.innerWidth <= 768) {
        // On mobile, sidebar starts collapsed
        sidebar.classList.add("collapsed");
    } else {
        // On desktop, sidebar is always visible
        sidebar.classList.remove("collapsed");
    }
}

// Event Listeners
promptForm.addEventListener("submit", handleFormSubmit);
sidebarToggle.addEventListener("click", toggleSidebar);

// Call on page load
window.addEventListener('load', initializeSidebar);

// Reinitialize on window resize
window.addEventListener("resize", initializeSidebar);

// Recent chat items click handler
const recentChatItems = document.querySelectorAll(".recent-chat-item");
recentChatItems.forEach(item => {
    item.addEventListener("click", () => {
        // Remove active class from all items
        recentChatItems.forEach(i => i.classList.remove("active"));
        // Add active class to clicked item
        item.classList.add("active");
    });
});

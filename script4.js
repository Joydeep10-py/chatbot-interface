const container = document.querySelector('.container');

// ========== LOGIN PAGE FUNCTIONALITY ==========
const loginPage = document.getElementById('loginPage');
const chatbotPage = document.getElementById('chatbotPage');
const loginForm = document.getElementById('loginForm');

// Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

function logout() {
    localStorage.clear();
    showLogin();
}

// Handle login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        // Basic validation
        if (!username || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        try {
            localStorage.setItem('access_token', 'demo-token');
            localStorage.setItem('username', username);
                
            showApp();
        } catch (err) {
            alert(err.message);
        }
        
        loginForm.reset();
    });
}

// Check if logged in on load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access_token');
    if (token) {
        showApp();
    } else {
        showLogin();
    }
    // Initialize Sidebar State
    initializeSidebar();
    // Load chat history from localStorage
    loadChatHistory();
});

// --- UI NAVIGATION ---
function showLogin() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('chatbotPage').classList.add('hidden');
}

function showApp() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('chatbotPage').classList.remove('hidden');
}


// Chatbot interface
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.querySelector(".sidebar-toggle");

const API_KEY = "AIzaSyBB2gxYsp4OkxiWoedf4DaObPWJOs-otZk"
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`

let userMessage = "";
const chatHistory = []
let allChats = []; // Store all chat sessions
let currentChatId = null; // Track current chat session

document.getElementById("send-prompt-btn").addEventListener('click',
    function(e){
        container.classList.add('is-hidden')
    }
)

// Function to create message elements
const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

// Typing effect function
function typeText(element, text, speed = 30) {
    let index = 0;
    element.textContent = '';
    
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
            } else {
                clearInterval(interval);
                resolve();
            }
        }, speed);
    });
}

// Make the API call and generate the bot's response
const generateResponse = async (botMsgDiv) => {

    const textElement = botMsgDiv.querySelector(".message-text")

    // Add user message to chat history
    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    })

    try{
        // send the chat history to the API to get a response
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: chatHistory })
        })

        const data = await response.json()
        if(!response.ok) throw new Error(data.error.message);

        // Process the response text and display it with typing effect
        const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim()
        textElement.textContent = ""; // Clear "Just a sec.." text
        await typeText(textElement, responseText);
        
        // Add bot response to chat history
        chatHistory.push({
            role: "model",
            parts: [{ text: responseText }]
        })
        
        // Save the chat to localStorage
        saveChatToHistory();
    } catch (error) {
        console.log(error)
        textElement.textContent = "Sorry, I couldn't process that request."
    } finally {
        botMsgDiv.classList.remove("loading")
    }
}

// Handling the form submission
const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if(!userMessage) return;

    // Create a new chat session if this is the first message
    if (chatHistory.length === 0) {
        currentChatId = Date.now().toString();
    }

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
        generateResponse(botMsgDiv)
    }, 600);
}

// Save chat to history in localStorage
function saveChatToHistory() {
    if (chatHistory.length === 0) return;
    
    // Get the first user message as the chat title
    const firstMessage = chatHistory.find(msg => msg.role === "user");
    const chatTitle = firstMessage ? firstMessage.parts[0].text.substring(0, 50) : "New Chat";
    
    // Find if this chat already exists
    const existingChatIndex = allChats.findIndex(chat => chat.id === currentChatId);
    
    const chatData = {
        id: currentChatId,
        title: chatTitle,
        messages: [...chatHistory],
        timestamp: Date.now()
    };
    
    if (existingChatIndex !== -1) {
        // Update existing chat
        allChats[existingChatIndex] = chatData;
    } else {
        // Add new chat at the beginning
        allChats.unshift(chatData);
    }
    
    // Keep only last 10 chats
    if (allChats.length > 10) {
        allChats = allChats.slice(0, 10);
    }
    
    // Save to localStorage
    localStorage.setItem('chatHistory', JSON.stringify(allChats));
    
    // Update sidebar
    updateSidebarHistory();
}

// Load chat history from localStorage
function loadChatHistory() {
    const savedChats = localStorage.getItem('chatHistory');
    if (savedChats) {
        allChats = JSON.parse(savedChats);
        updateSidebarHistory();
    }
}

// Update sidebar with chat history
function updateSidebarHistory() {
    // Check if history section already exists, if not create it
    let historySection = sidebar.querySelector('.history-section');
    
    if (!historySection) {
        // Create history section after the menu section
        const menuSection = sidebar.querySelector('.sidebar-section');
        historySection = document.createElement('div');
        historySection.className = 'history-section';
        historySection.innerHTML = `
            <div class="section-header">
                <h3 class="section-title">RECENT CHATS</h3>
            </div>
            <ul class="recent-chats"></ul>
        `;
        menuSection.after(historySection);
    }
    
    const recentChatsList = historySection.querySelector('.recent-chats');
    recentChatsList.innerHTML = '';
    
    // Add chat items
    allChats.forEach(chat => {
        const chatItem = document.createElement('li');
        chatItem.className = 'recent-chat-item';
        if (chat.id === currentChatId) {
            chatItem.classList.add('active');
        }
        
        chatItem.innerHTML = `
            <span class="material-symbols-rounded chat-icon">chat_bubble</span>
            <span>${chat.title}</span>
        `;
        
        // Click to load chat
        chatItem.addEventListener('click', () => loadChat(chat.id));
        
        recentChatsList.appendChild(chatItem);
    });
}

// Load a specific chat
function loadChat(chatId) {
    const chat = allChats.find(c => c.id === chatId);
    if (!chat) return;
    
    // Clear current chat
    chatsContainer.innerHTML = '';
    chatHistory.length = 0;
    chatHistory.push(...chat.messages);
    currentChatId = chatId;
    
    // Show the header and suggestions if no messages
    if (chat.messages.length === 0) {
        container.classList.remove('is-hidden');
    } else {
        container.classList.add('is-hidden');
    }
    
    // Render all messages
    chat.messages.forEach(msg => {
        if (msg.role === "user") {
            const userMsgHTML = `<p class="message-text"></p>`;
            const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
            userMsgDiv.querySelector(".message-text").textContent = msg.parts[0].text;
            chatsContainer.appendChild(userMsgDiv);
        } else if (msg.role === "model") {
            const botMsgHTML = `<img src="images/robot.png" class="avatar"><p class="message-text"></p>`;
            const botMsgDiv = createMsgElement(botMsgHTML, "bot-message");
            botMsgDiv.querySelector(".message-text").textContent = msg.parts[0].text;
            chatsContainer.appendChild(botMsgDiv);
        }
    });
    
    // Update active state in sidebar
    updateSidebarHistory();
}

// Initialize sidebar functionality
function initializeSidebar() {
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
}

// Start a new chat session
function startNewChat() {
    // Clear current chat
    chatsContainer.innerHTML = '';
    chatHistory.length = 0;
    currentChatId = null;
    
    // Show the header and suggestions
    container.classList.remove('is-hidden');
    
    // Update sidebar to remove active state
    updateSidebarHistory();
}

// Add event listener for "Therapy Chat" menu item
const therapyChatMenuItem = document.querySelector('.menu-item');
if (therapyChatMenuItem) {
    therapyChatMenuItem.addEventListener('click', startNewChat);
}

// Delete chats button functionality
const deleteChatsBtn = document.getElementById('delete-chats-btn');
if (deleteChatsBtn) {
    deleteChatsBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this chat?')) {
            // If there's a current chat session, delete it from allChats
            if (currentChatId) {
                const chatIndex = allChats.findIndex(chat => chat.id === currentChatId);
                if (chatIndex !== -1) {
                    allChats.splice(chatIndex, 1);
                    // Update localStorage
                    localStorage.setItem('chatHistory', JSON.stringify(allChats));
                }
            }
            
            // Clear current chat display
            chatsContainer.innerHTML = '';
            chatHistory.length = 0;
            currentChatId = null;
            container.classList.remove('is-hidden');
            
            // Update sidebar to reflect deletion
            updateSidebarHistory();
        }
    });
}

promptForm.addEventListener('submit', handleFormSubmit)
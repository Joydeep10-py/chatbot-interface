# MindSpace AI 🧠

A mental wellness chatbot web application powered by the **Google Gemini API**. MindSpace AI provides a supportive conversational interface for users seeking mental health guidance, breathing exercises, conversation practice, and wellness tips.

---

## Features

- **AI-Powered Chat** — Conversations driven by the Gemini `gemini-3-flash-preview` model
- **Login System** — Simple authentication with local session management
- **Chat History** — Up to 10 recent conversations saved to `localStorage` and accessible from the sidebar
- **Typing Effect** — Bot responses appear with a smooth character-by-character animation
- **Suggestion Prompts** — One-click starter prompts for common mental wellness topics
- **Sidebar Navigation** — Collapsible sidebar with recent chat history and new chat support
- **Responsive Design** — Mobile-friendly layout with adaptive sidebar toggle
- **Delete Chat** — Remove individual chat sessions from history

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Fonts | Google Fonts (Poppins), Material Symbols Rounded |
| AI API | Google Gemini API (`gemini-3-flash-preview`) |
| Storage | Browser `localStorage` |

---

## Project Structure

```
mindspace-ai/
├── index.html          # Main HTML (login + chatbot UI)
├── style_update1.css   # All styles (login, sidebar, chat, responsive)
├── script4.js          # App logic (auth, API calls, chat history)
└── images/
    └── robot.png       # Bot avatar image
```

---

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- A valid **Google Gemini API key** — get one at [Google AI Studio](https://aistudio.google.com/)

### Setup

1. **Clone or download** this repository.

2. **Add your API key** in `script4.js`:
   ```js
   const API_KEY = "YOUR_GEMINI_API_KEY_HERE";
   ```

3. **Open `index.html`** directly in your browser — no build step or server required.

4. **Log in** using any username and password (authentication is demo-only; credentials are not validated against a backend).

---

## Configuration

### Changing the Gemini Model

In `script4.js`, update the `API_URL` to use a different Gemini model:

```js
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;
```

Refer to the [Gemini model docs](https://ai.google.dev/gemini-api/docs/models) for available model names.

### Adjusting Chat History Limit

By default, the app retains the last **10 chats**. To change this, update the following line in `script4.js`:

```js
if (allChats.length > 10) {
    allChats = allChats.slice(0, 10);
}
```

### Typing Speed

The bot response typing animation speed (in milliseconds per character) can be adjusted here:

```js
await typeText(textElement, responseText); // default speed = 30ms
```

---

## Usage

| Action | How |
|---|---|
| Start a new chat | Click **New Chat** in the sidebar |
| Load a past chat | Click any item under **Recent Chats** in the sidebar |
| Delete current chat | Click the 🗑️ delete button near the prompt bar |
| Collapse sidebar | Click the ☰ hamburger menu button |
| Log out | Click **Logout** at the bottom of the sidebar |

---

## Notes & Limitations

- **No real authentication** — login accepts any credentials and stores a demo token in `localStorage`. Do not use in production without a proper auth backend.
- **API key is exposed client-side** — for production use, proxy API requests through a secure backend server.
- **No server-side storage** — all chat history lives in the browser's `localStorage` and will be lost if cleared.

---

## License

This project is for educational and personal use. Please review [Google's Gemini API Terms of Service](https://ai.google.dev/terms) before deploying publicly.

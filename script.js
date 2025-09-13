// Toggle chat visibility
const chatToggle = document.getElementById("chat-toggle");
const chatContainer = document.getElementById("chat-container");
const closeChat = document.getElementById("close-chat");

chatToggle.addEventListener("click", () => {
  chatContainer.style.display = "flex";
});

closeChat.addEventListener("click", () => {
  chatContainer.style.display = "none";
});

// Chat elements
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatBody = document.getElementById("chat-body");

// Send message on button click or Enter key
sendBtn.addEventListener("click", () => sendMessage());
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Send message function
async function sendMessage(messageText) {
  // Use parameter (for future features) or input value
  const message = messageText || userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  // Show typing animation
  const typing = document.createElement("div");
  typing.classList.add("message", "bot");
  typing.innerHTML = `<div class="bot-avatar-small">🤖</div><p>...</p>`;
  chatBody.appendChild(typing);
  chatBody.scrollTop = chatBody.scrollHeight;

  try {
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    typing.remove();
    addMessage(data.reply, "bot");
  } catch (err) {
    console.error(err);
    typing.remove();
    addMessage("⚠️ Sorry, I couldn't connect to the chatbot.", "bot");
  }
}

// Utility function to add message to chat body
function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  if (sender === "bot") {
    msg.innerHTML = `<div class="bot-avatar-small">🤖</div><p>${text}</p>`;
  } else {
    msg.innerHTML = `<p>${text}</p>`;
  }

  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

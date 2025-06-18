document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const chatBox = document.getElementById("chat-box");
  const micBtn = document.getElementById("mic-btn");
  const assistantName = "Nova";

  function appendMessage(sender, message = "", isTyping = false) {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("mb-2");
    const className = sender === "You" ? "user-message" : "bot-message";

    if (isTyping) {
      messageContainer.innerHTML = `
        <div class="${className}">
          <strong>${sender}:</strong>
          <div class="typing-dots" id="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>`;
    } else {
messageContainer.innerHTML = `
  <div class="${className}">
    <strong>${sender}:</strong> <div class="bot-text">${marked.parse(message)}</div>
  </div>
`;

    }

    chatBox.appendChild(messageContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageContainer.querySelector(".bot-text");
  }

  function simulateTypingEffect(element, text, speed = 30) {
    if (!element) return;
    let index = 0;
    const interval = setInterval(() => {
      element.textContent += text.charAt(index++);
      if (index >= text.length) clearInterval(interval);
      chatBox.scrollTop = chatBox.scrollHeight;
    }, speed);
  }

  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    appendMessage("You", message);
    input.value = "";
    appendMessage(assistantName, "", true);

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      const indicator = document.getElementById("typing-indicator");
      if (indicator?.parentElement) {
        indicator.parentElement.remove();
      }

      const botMsg = appendMessage(assistantName, "");
      simulateTypingEffect(botMsg, data.reply);
    } catch (error) {
      const indicator = document.getElementById("typing-indicator");
      if (indicator?.parentElement) {
        indicator.parentElement.remove();
      }
      appendMessage(assistantName, "⚠️ Error: Unable to connect to the server.");
      console.error("Chat fetch error:", error);
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // 🎙️ Voice Input
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    micBtn.addEventListener("click", () => {
      recognition.start();
      micBtn.disabled = true;
      micBtn.innerText = "🎧 Listening...";
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      input.value = transcript;
    };

    recognition.onerror = () => {
      micBtn.disabled = false;
      micBtn.innerText = "🎤";
    };

    recognition.onend = () => {
      micBtn.disabled = false;
      micBtn.innerText = "🎤";
    };
  } else {
    micBtn.disabled = true;
    micBtn.title = "Speech recognition not supported in this browser";
  }
});
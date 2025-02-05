const socket = io();

// Get elements
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("message");
const chatBox = document.getElementById("chatBox");
const room = document.getElementById("room");
const typingIndicator = document.getElementById("typingIndicator");

// Get username from local storage
const username = localStorage.getItem("username") || "Guest";
let currentRoom = room.value;

// Function to add a message to the chat box
function addMessage(user, text) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");

  if (user === username) {
    messageElement.classList.add("user");
  } else {
    messageElement.classList.add("other");
  }

  messageElement.innerHTML = `<strong>${user}:</strong> ${text}`;
  chatBox.appendChild(messageElement);

  // Auto-scroll to the latest message
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Emit event when joining a room
function joinRoom() {
  chatBox.innerHTML = ""; // Clear previous messages
  socket.emit("joinRoom", { username, room: currentRoom });
}

// Send message
document.getElementById("send-btn").addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message === "") return; // Prevent empty messages

  socket.emit("chatMessage", { username, room: currentRoom, message });
  messageInput.value = ""; // Clear input field
});

// Listen for incoming messages
socket.on("message", (msg) => {
  addMessage(msg.user, msg.text);
});

// Handle typing event
messageInput.addEventListener("input", () => {
  socket.emit("typing", { username, room: currentRoom });
});

// Display typing indicator
socket.on("typing", (data) => {
  typingIndicator.innerText = `${data.user} is typing...`;
  setTimeout(() => {
    typingIndicator.innerText = "";
  }, 2000);
});

// Handle room change
room.addEventListener("change", () => {
  currentRoom = room.value;
  joinRoom();
});

// Load previous messages when joining a room
socket.on("chatHistory", (messages) => {
  chatBox.innerHTML = ""; // Clear previous messages
  messages.forEach((msg) => addMessage(msg.from_user, msg.message));
});

// Leave room
document.getElementById("leaveRoom").addEventListener("click", () => {
  socket.emit("leaveRoom", { username, room: currentRoom });
  window.location.href = "/";
});

// Initial room join
joinRoom();

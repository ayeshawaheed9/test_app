import io from "socket.io-client";
import { LocalStorage } from "node-localstorage";
import { v4 as uuidv4 } from "uuid";

// Initialize local storage for persistent session management
const localStorage = new LocalStorage("./scratch");

// Retrieve or generate a session ID
let sessionId = localStorage.getItem("sessionId") || generateSessionId();
localStorage.setItem("sessionId", sessionId);

// Establish the socket connection with sessionId and pageId
const socket = io("http://localhost:3000", {
  path: "/api/socket.io",
  transports: ["websocket"],
  query: { sessionId: sessionId, pageId: getPageId() },
});

socket.on("connect", () => {
  console.log("Connected to the server");
  console.log("session id is: ", sessionId);
  setTimeout(() => {
    socket.emit("registerPage", { sessionId, pageId: getPageId() });
    console.log("Page ID sent:", getPageId());
  }, 1000);
});

socket.on("personal_message", (message) => {
  if (message.pageId === getPageId()) {
    console.log(`Message received on page: ${message.content}`);
  }
});

socket.on("disconnect", () => {
  console.log("Disconnected from the server");
});

function generateSessionId() {
  return uuidv4();
}

function getPageId() {
  return "notifications";
}

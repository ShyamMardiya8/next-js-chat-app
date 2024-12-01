const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parseUrl = parse(req.url, true);
    handle(req, res, parseUrl);
  });

  const io = new Server(server);

  // Handle socket connection
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Listen for 'message' events
    socket.on("message", (msg) => {
      console.log("Message received:", msg);
      io.emit("message", msg); // Broadcast the message to all connected clients
    });

    // Listen for 'disconnect' events (not 'disconnected')
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Start the server
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`> Server ready on http://localhost:${PORT}`);
  });
});

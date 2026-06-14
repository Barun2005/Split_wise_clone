import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join a specific group room
  socket.on("join_group", (groupId) => {
    socket.join(groupId);
    console.log(`👥 Client ${socket.id} joined group: ${groupId}`);
  });

  // Handle a payment being processed
  socket.on("payment_processed", (data) => {
    console.log(`💸 Payment processed in group ${data.groupId}: ₹${data.amount} from ${data.from} to ${data.to}`);
    
    // Broadcast to everyone ELSE in the group
    socket.to(data.groupId).emit("payment_received", {
      debtId: data.debtId,
      amount: data.amount,
      from: data.from,
      to: data.to,
      timestamp: new Date().toISOString()
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on http://localhost:${PORT}`);
});

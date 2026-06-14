import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (groupId: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to the standalone WebSocket server
    const socket = io("http://localhost:3001", {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      // Join the specific group room
      if (groupId) {
        socket.emit("join_group", groupId);
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [groupId]);

  const emitPayment = (debtId: string, amount: number, from: string, to: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("payment_processed", {
        groupId,
        debtId,
        amount,
        from,
        to
      });
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    emitPayment
  };
};

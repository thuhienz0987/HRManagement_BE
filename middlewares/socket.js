import http from "http";
import { Server } from "socket.io";
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import allowedOrigins from "../config/allowedOrigins.js";

let socketServer;

export const initializeSocketIO = (app) => {
  const server = http.createServer(app);
  socketServer = new Server(server, {
    cors: {
      origin: allowedOrigins, // Replace with your actual frontend origin
      methods: ["GET", "POST", "PUT", "DELETE"], // Add the HTTP methods your frontend needs to use
    },
  });

  const usp = socketServer.of("/user-namespace");

  usp.on("connection", async (socket) => {
    console.log("User Connected");

    const userId = socket.handshake.auth.token;

    await User.findByIdAndUpdate({ _id: userId }, { $set: { isOnline: "1" } });

    //user broadcast online status
    socket.broadcast.emit("getOnlineUser", { userId: userId });

    socket.on("disconnect", async () => {
      console.log("User Disconnected");

      await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { isOnline: "0" } }
      );

      //user broadcast offline status
      socket.broadcast.emit("getOfflineUser", { userId: userId });
    });

    //chatting implementation
    socket.on("newChat", (data) => {
      socket.broadcast.emit("loadNewChat", {chat: data.data});
      console.log('data new chat',data)
    });

    //load old chats
    socket.on("existsChat", async (data) => {
      var chats = await Chat.find({
        $or: [
          { senderId: data.senderId, receiverId: data.receiverId },
          { senderId: data.receiverId, receiverId: data.senderId },
        ],
      });

      socket.emit("loadChats", { chats: chats });
    });

    //delete chats
    socket.on("chatDeleted", (_id) => {
      socket.broadcast.emit("chatMessageDeleted", _id);
    });

    //update chats
    socket.on("chatUpdated", (data) => {
      socket.broadcast.emit("chatMessageUpdated", data);
    });
  });

  return server;
};

export const getSocketServer = () => {
  if (!socketServer) {
    throw new Error("Socket server is not initialized");
  }
  return socketServer;
};

import http from "http";
import { Server } from "socket.io";
import User from "../models/User.js";
import Message from "../models/Message.js";
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

    //messaging implementation
    socket.on("newMessage", (data) => {
      socket.broadcast.emit("loadNewMessage", data);
    });

    //load old messages
    socket.on("existsMessage", async (data) => {
      var messages = await Message.find({
        $or: [
          { senderId: data.senderId, receiverId: data.receiverId },
          { senderId: data.receiverId, receiverId: data.senderId },
        ],
      });

      socket.emit("loadMessages", { messages: messages });
    });

    //delete messages
    socket.on("messageDeleted", (_id) => {
      socket.broadcast.emit("messageDeleted", _id);
    });

    //update messages
    socket.on("messageUpdated", (data) => {
      socket.broadcast.emit("messageUpdated", data);
    });

    //new group message added
    socket.on("newGroupMessage", (data) => {
      socket.broadcast.emit("loadNewGroupMessage", data); //broadcast group message object
    });

    //group message delete
    socket.on("groupMessageDeleted", (id) => {
      socket.broadcast.emit("groupMessageDeleted", id);
    });

    //update group messages
    socket.on("groupMessageUpdated", (data) => {
      socket.broadcast.emit("groupMessageUpdated", data);
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

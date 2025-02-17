import http from "http";
import app from "./app"; // Import the Koa app instance
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Server } from 'socket.io';
import User from "./models/User";

dotenv.config();

const PORT:string = process.env.PORT as string;
const MONGO_URI:string = process.env.MONGO_URI as string;

interface UserSocketMap {
    [userId: string]: string;
}
const userSocketMap: UserSocketMap = {};

async function startServer() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Create an HTTP server with Koa
        const server = http.createServer(app.callback());
        const io = new Server(server, {
            cors: {
                origin: 'http://localhost:3001', // Allow connections from the frontend
                methods: ['GET', 'POST'],
            },
        });

        io.on('connection', (socket) => {
            console.log('A user connected:', socket.id);
            let userId: string | null = null;

            socket.on('register', (user: any) => {
                userId = user.id as string;
                userSocketMap[userId] = socket.id; // Map user ID to socket ID
                console.log(`User ${userId} registered with socket ID ${socket.id}`);
            });
            socket.on('disconnect', () => {
                console.log('A user disconnected:', socket.id);
                const userId = Object.keys(userSocketMap).find(
                    (key) => userSocketMap[key] === socket.id
                );
                if (userId) {
                    delete userSocketMap[userId];
                }
            });
            socket.on('assign', (data) => {
                console.log(`User ID : ${data.user._id} assigned to task : ${data.taskId}`);
                const assignedToSocketId = userSocketMap[data.user._id];
                if (assignedToSocketId) {
                    io.to(assignedToSocketId).emit('taskAssigned', {
                        type:'assign',
                        taskId:data.taskId,
                        userId:data.user._id,
                        message: data.message,
                    });
                    console.log(`Task "${data.taskId}" assigned to user ${data.user._id}`);
                } else {
                    console.log(`User ${data.user._id} is not connected.`);
                }
            });
        });

        server.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error starting server:", error);
        process.exit(1);
    }
}

// Start the server
startServer();

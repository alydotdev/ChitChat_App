import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routers/auth.route.js";
import connectDb from "./lib/db.js";
import cookieParser from 'cookie-parser'
import messageRoutes from "./routers/message.route.js";
import friendRoutes from "./routers/friend.route.js";
import cors from 'cors'
import {app, server } from './lib/socket.js'
import path from 'path'
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost",
            "http://127.0.0.1:5173",
            "http://16.170.218.202:5173",
            "https://chit-chat-app-five.vercel.app", 
        ];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}
))
dotenv.config();
const __dirname = path.resolve();
app.use(express.json({limit: "20mb"}));
app.use(cookieParser())
app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/friends", friendRoutes)
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname, "../Frontend/dist")))
     app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}
server.listen(process.env.PORT,()=>{
    console.log("Server is running on Port:" + process.env.PORT)
    connectDb();
})
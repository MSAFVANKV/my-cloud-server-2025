import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoute from './routers/userRoute.js';
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";


// import { Server } from 'socket.io';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/uploads/images", express.static("uploads/images/"))
app.use("/uploads/recordings", express.static("uploads/recordings/"))


// app.use('/api/messages', messageRoute);
app.use('/api/user', userRoute);


const server = app.listen(PORT,()=>{
    console.log(`Server running on port http://localhost:${PORT}`)
})

// connectDB();

// const io = new Server(server,{
//     cors: {
//       origin: "http://localhost:5173",
//       methods: ["GET", "POST", "PUT", "DELETE"]
//     }
 
// })

// global.onlineUser = new Map();
// io.on('connection', (socket) => {
//     console.log('a user connected');

//     global.chatSocket = socket;

//     socket.on('add-user', (userId) => {
//         onlineUser.set(userId, socket.id)
//       });

//       socket.on('send-message', (data) => {
//         console.log(data,'data');
        
//         const sendUserSocket = onlineUser.get(data.to);
//         if(sendUserSocket) {
//             socket.to(sendUserSocket).emit('msg-receive', {
//             from: data.from,
//             message: data.message,
//           });
//         }
//       });

//     socket.on('disconnect', () => {
//       console.log('user disconnected');
//     });

//     socket.on('join', ({ userId }) => {
//       onlineUser.set(userId, socket.id);
//     });
  
// })
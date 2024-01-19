import Express, { json } from "express";
import http from 'http'
import dotenv from 'dotenv'
import cors from 'cors'
import jwt from "jsonwebtoken"

import { Server } from "socket.io";

import { dbConnect } from "./db/dbConnect.js";

import { loginRoute } from "./routes/auth/login.js";
import { registerRoute } from "./routes/auth/register.js";
import { forgotPassRoute } from "./routes/auth/forgotpass.js";
import { resetPasswordRoute } from "./routes/auth/reset.js";
import { getContactsRoute } from "./routes/chat/contacts.js";
import { messageRouter } from "./routes/chat/message.js";
import { profileRouter } from "./routes/chat/profile.js";


dotenv.config()

const port = process.env.PORT || 6050;

await dbConnect()

const app = Express()
 
const server = http.createServer(app)

const io = new Server(server, {
    cors : {
        origin : process.env.FE_URL,
        methods : ['GET', 'POST'],
        // path : ''
    }
})

app.use(cors())

app.use(Express.json())



const authMiddleWare = (req,res,next)=>{
  let token = req.headers["auth-token"]
    try{
      jwt.verify(token, process.env.JWT_SECRET)
      next()
    }catch(err){
      console.log(err)
      res.status(401).send({msg : 'unauthorized'})
    }
}

app.use('/login', loginRoute)

app.use('/register', registerRoute)

app.use('/forgot', forgotPassRoute)

app.use('/reset', resetPasswordRoute)

app.use('/contacts',authMiddleWare,  getContactsRoute)

app.use('/messages', authMiddleWare, messageRouter)

app.use('/profile', authMiddleWare, profileRouter)




app.get('/', (req,res)=>{
    res.send('Chat Application')
})


// io.on('connection', (Socket) => {
//     // io.on('join-room', (data) =>{
//     //     Socket.join(data)
//     //     console.log(`user ${Socket.id} has joined the room`)
//     // })
//     console.log('user connected')
//     io.on('send-message', (data) =>{
//         console.log('Message', data)
//         io.emit('received-message', data)
//     })
//     io.on('disconnect', ()=>{
//         console.log('Disconnected')
//     })
// })


global.onlineUsers = new Map();
// console.log(global)
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    // console.log('added', userId)
    const a = (userId)
    // console.log(a)
    onlineUsers.set(a.email, socket.id);
    
  });

  socket.on("send-msg", (data) => {
    // console.log('sending')
    const a = (data)
    // console.log(a)
    const sendUserSocket = onlineUsers.get(a.to);
    // console.log(sendUserSocket)
    if (sendUserSocket) {
      io.to(sendUserSocket).emit("msg-receive", a.msg);
      // console.log('received')
    }
  });
});


server.listen(port, ()=> console.log('server is running on', port))
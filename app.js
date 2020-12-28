import cookieParser from 'cookie-parser';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import conversationRoutes from './routes/conversationRoutes'
import messageRoutes from './routes/messageRoutes'
import {sendMessage} from './controllers/messageController'
const { requireAuth, checkUser } = require('./middlewares/authMiddleware');
const app = express();
app.use(cors());
const server = require('http').createServer();
const options={
  cors:true,
  origins:["https://5fe48e5232319c70c9ea5e18--quizzical-agnesi-9c8768.netlify.app/"],
 }
 // Socket chat: http
const io = require('socket.io')(server, options);
const chat = io.of('/chat')
chat.on('connection', socket => {
  socket.on('join-room', (data) =>{
    socket.join(data.conversationId)
    //console.log(socket)
  })
  socket.on('disconnect', (id) =>{
    socket.leave(id);
  })  
  socket.on('send-message', async (data) =>{
    const {conversationId, text,token,name} = data;
     await sendMessage({conversationId, text, token});
   
    socket.broadcast.to(conversationId).emit('receiveMsg', {conversationId, text, name});
  }) 
});
server.listen(5000);
//Video chat
const peers = io.of('/webrtcPeer')
let videoConnectedPeers = new Map()
peers.on('connection', socket => {
  // console.log(socket.id);
  socket.emit('connection-success', {success: socket.id});
  videoConnectedPeers.set(socket.id, socket)
  socket.on('join-room', (data) =>{
    console.log(data.conversationId)
    socket.join(data.conversationId)
    //console.log(socket)
  })
  socket.on('disconnect', () => {
    console.log('disconnect');
    videoConnectedPeers.delete(socket.id)
  })
  socket.on('offerOrAnswer', (data) => {
    console.log(data.socketId);
    socket.broadcast.to(data.conversationId).emit('offerOrAnswer', data.payload);
  })
  socket.on('candidate', (data) => {
    console.log(data.socketId);
    for (const [socketId, socket] of videoConnectedPeers.entries()) {
      if (socketId !== data.socketId) {
        // console.log('candidate',socketId, data.payload);
        socket.emit('candidate', data.payload);
      }
    }
  })
})

// middleware

app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if(req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({})
  }
  next();
})
// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = 'mongodb+srv://kencryk:123321@cluster0.dwvu5.mongodb.net/node-auth';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(4000))
  .catch((err) => console.log(err));

// routes
app.get('*', checkUser)
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', requireAuth ,(req, res) => res.render('smoothies'));
app.use('/auth',authRoutes)
app.use('/user',userRoutes)
app.use('/conversation',conversationRoutes);
app.use('/message',messageRoutes);
// app.use('/videoChat', videoRoutes);;

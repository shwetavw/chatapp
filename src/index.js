//Load core and application modules
const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUSer, removeUser, getUser, getUserInRoom } = require('./utils/users')

//Instantiate express
const app = express()

//Create Server
const server = http.createServer(app)

//Instantiate SocketIO
const io = socketio(server)

//Initialize variables
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

//Set public directory
app.use(express.static(publicDirectoryPath))

//Bind coonection event
io.on('connection',(socket)=>{
    socket.on('join', ({username, room}, callback)=>{
        const {error, user} = addUSer({id: socket.id, username, room})
        
        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message',generateMessage('Welcome!','Admin'))
        socket.broadcast.to(user.room).emit('message',generateMessage(user.username + ' has joined', 'Admin'))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUserInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage',(message, callback)=>{
        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage(message.messagetext, user.username))
            callback('Delivered!!')
        }
        
    })   

    socket.on('sendLocation',(data,callback)=>{
        const user = getUser(socket.id)
        if(user){
            const url ='http://google.com/maps?q='+data.latitude+','+data.longitude
            io.to(user.room).emit('locationMessage', generateLocationMessage(url, user.username))
            callback('Server received')
        }
    })

//Bind disconnect event
socket.on('disconnect',()=>{
    const user = removeUser(socket.id)

    if(user){
            io.to(user.room).emit('message', generateMessage(user.username +' has left!' , 'Admin'))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    })
})


server.listen(port,()=>{    
    console.log('Server is running on port: ' + port)
})
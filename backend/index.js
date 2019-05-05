const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const { generateMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const users = new Users();

const publicPath = path.join(__dirname, '../backend');
const port = 5000;

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected');

    // запрос на присоединение в чатрум
    socket.on('join', (params, callback) => {
        if (!isRealString(params.username) || !isRealString(params.room)) {
            return callback('Username and room name are required');
        }

        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.username, params.room);

        // отсылаем новый список пользователей всем в комнате
        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
        // отсылаем только что вошедшему пользователю список доступных комнат
        socket.emit('updateChatList', users.getChatList());
        if (typeof users.chatList[params.room] !== "undefined") {
            // отсылаем только что вошедшему пользователю старые сообщения из комнаты
            socket.emit('messagesFromChatroom', users.chatList[params.room].getMessages());
            // отсылаем только что вошедшему пользователю список приветствие
            socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat room'));
            // оповещаем остальных пользователей о присоединение нового участника
            socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.username} has joined.`));
        }

    });


    // запрос пользователя начать видео трансляцию
    socket.on("startVideoChat", (data) => {
        if (socket.room !== undefined) {
            // Если сокет уже находится в какой-то комнате, выходим из нее
            socket.leave(socket.room,() => {
            });
        }
        // Входим в запрошенную комнату
        socket.room = data.chat;
        socket.join(socket.room);
        socket.broadcast.to(data.chat).emit("newVideoRequest", data.name);
    });

        // Сообщение, связанное с WebRTC (SDP offer, SDP answer или ICE candidate)
    socket.on("webrtc", (message) => {
        const user = users.getUser(socket.id);
        // ...широковещательное сообщение
           socket.broadcast.to(user.room).emit("videoMessage", message);
    });

    //если от пользователя приходит новое сообщение
    socket.on('createMessage', (message) => {
        const user = users.getUser(socket.id);
        if (user && isRealString(message)) {
            if (typeof users.chatList[user.room] !== "undefined") {
                // после проверок отылаем сообщение всем пользователям в чатруме и сохраняем сообщение на сервере
                io.to(user.room).emit('newMessage', generateMessage(user.username, message));
                users.chatList[user.room].saveNewMessage(user.username, message);
            }
        }
    });

    //если от пользователя приходит запрос на создание новой комнаты
    socket.on('createNewRoom', (chatroom) => {
        users.createChatRoom(chatroom);
        // отсылаем всем новый список комнат
        socket.broadcast.emit('updateChatList', users.getChatList());
    });

    //при разрыве соединения
    socket.on('disconnect', () => {
        const user = users.removeUser(socket.id);

        if (user) {
            // отсылаем остальным пользователям в комнате новый список участников
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            // оповещаем остальных пользователей о отсоединении участника
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.username} has left`));
        }
    });
});

server.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});

const { Chatroom } = require('./chatroom');

/*
* Вспомогательный класс реализующий методы работы с данными
*/

class Users {
    constructor () {
        this.users = [];
        this.chatList = {'root': new Chatroom()};
        this.chatList['root'].saveNewMessage("React", "Hello, world!");
    }

    addUser (id, username, room) {
        const user = { id, username, room };
        this.users.push(user);
        return user;
    }

    removeUser (id) {
        const user = this.getUser(id);

        if (user) {
            this.users = this.users.filter((user) => user.id !== id);
        }
        return user;
    }

    getUser (id) {
        return this.users.filter((user) => user.id === id)[0];
    }

    getUserList (room) {
        const users = this.users.filter((user) => user.room === room);
        return users.map((user) => user.username);
    }

    getChatList (){
        const chatNames = [];
        for (let chat in this.chatList){
            chatNames.push(chat);
        }
        return chatNames;
    }

    createChatRoom(chatroom){
        this.chatList[chatroom] = new Chatroom();
        this.chatList[chatroom].saveNewMessage("Admin", "Welcome to new chat!");
    }

}

module.exports = { Users };

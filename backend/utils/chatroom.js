const {generateMessage} = require("./message");

/*
* Вспомогательный класс реализующий чатрум(нужен для более удобного управления информацией в users)
*/


class Chatroom {
    constructor(){

        this.messages = [];

    }


    getMessages() {
        return this.messages;
    }


    saveNewMessage(username, message){
        this.messages.push(generateMessage(username, message));
    }

}

module.exports = { Chatroom };

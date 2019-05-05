// вспомогательный класс для удобной работы с чатрумом

export class Chatroom {
    constructor(_messages){

        this.messages = _messages;

    }


    getMessages() {
        return this.messages;
    }

    setMessages(messages) {
        this.messages = messages;
    }


    saveNewMessage(message){
        this.messages.push(message);
    }

}

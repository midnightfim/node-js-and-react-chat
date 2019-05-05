import {Chatroom} from "./data/chatroom";
import io from 'socket.io-client';

export class Service {

    // сервис приложения
    // реализуется вся работа с socket.io и webRTC


    constructor(appComponent) {
        this.app = appComponent;
        this.isLogged = this.isHaveName();
        this.userName = localStorage.getItem('Name');
        this.onlineUserList = [];
        this.chatNames = [];
        this.chatList = {};
        this.client = this.configSocket();
        this.webrtcParams();
    }


    // выносим параметры, связанные с WebRTC в отдельный метод
    webrtcParams(){
        this.PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        this.SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
        this.IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
        this.webRTCPeers = {};
        this.videoMessage = '';
        this.stream = {};
        this.ICEId = this.uuid();
        this.server = {
            iceServers: [
                {urls: "stun:stun4.l.google.com:19302"},
                {
                    urls: 'turn:numb.viagenie.ca',
                    credential: 'jaroslav17',
                    username: 'y.karmannikov@yandex.ru'
                }
            ]
        };
        this.options = {
            optional: [
                {DtlsSrtpKeyAgreement: true}, // требуется для соединения между Chrome и Firefox
                {RtpDataChannels: true} // требуется в Firefox для использования DataChannels API
            ]
        }
    }


    // метод, рализующий выход из приложения
    // вызывается в navigation
    exit(){
        localStorage.clear();
        window.location.href = './';
    }

    // наполняем массив с сообщениями во избежании задержки информации с сервера
    // вызывается в home
    fillChatList(){
        this.chatList[localStorage.getItem('CurrentChatName')] = new Chatroom(['ChatRoom is not created!'])
    }

    // проверяем есть ли у пользователя сохраненное имя в localStorage
    // вызывается в app
    isHaveName(){
        return localStorage.getItem('Name') !== 'undefined' && localStorage.getItem('Name') !== null;
    }

    // отправляем сообщение с новой комнатой на сервер
    // вызывается в active-chat-list
    createNewChatRoom(chatname){
        this.client.emit('createNewRoom', chatname);
        window.location.href = './' + chatname;
    }

    // метод обновляющий список подключенных пользователей к комнате
    // вызывается обработчиком событий от сервера
    updateUserList(users){
        this.onlineUserList = users;
        this.update();
    }

    // метод для отправки новых сообщений на сервер
    // вызывается в компоненте chat
    postNewMessage(message){
        this.client.emit('createMessage', message);
    }

    // метод обновляющий список сообщений в комнате
    // вызывается обработчиком событий от сервера
    setNewMessage(message){
        this.chatList[localStorage.getItem('CurrentChatName')].saveNewMessage(message);
        this.update();
    }

    // метод обновляющий запрос на старт видео чата
    // вызывается в chat
    newVideoRequestToServer(){
        this.client.emit('startVideoChat', {name: this.ICEId,
            chat: localStorage.getItem('CurrentChatName')});
    }

    // метод инициализирующий соединение с сервером
    // вызывается в home
    connectToServer(){
        this.client.emit('join', {username: localStorage.getItem('Name'),
            room: localStorage.getItem('CurrentChatName')} );


    }


    // метод обновляющий список активных чатрумов
    // вызывается обработчиком событий от сервера
    setChatNames(chatNames){
        for (let chatname in chatNames){
            this.chatList[chatname] = '';
        }
        this.chatNames = chatNames;
        this.update();
    }

    // метод устанавливающий мия пользователя в localStorage
    // вызывается в login
    setUserName(inputName){
        localStorage.setItem('Name', inputName);
        this.userName = localStorage.getItem('Name');
        window.location.href = './' + localStorage.getItem('CurrentChatName');
    }

    // метод устанавливающий список прошлых сообщений при заходе в комнату
    // вызывается обработчиком событий от сервера
    setPastMessages(messages){
        this.chatList[localStorage.getItem('CurrentChatName')].setMessages(messages);
        this.update();
    }

    // Вспомогательная функция для отправки адресных сообщений, связанных с WebRTC
    sendWebRTCMessage(type, message) {
        console.log(message);
        this.client.emit("webrtc", {type: type, data: message});
    }

    // Вспомогательная функция для обновления страницы при получении данных
    update() {
        this.app.forceUpdate();
    }

    // устанавливаем обработчик событий от сервера
    configSocket() {
        const client = io('http://localhost:5000');

        // принимаем с сервера новый список пользователей
        client.on('updateUserList', (users) => {
            this.updateUserList(users);
        });

        // принимаем с сервера новый список чатрумов
        client.on('updateChatList', (chatNames) => {
            this.setChatNames(chatNames);
        });

        // принимаем с сервера массив сообщений из чатрума
        client.on('messagesFromChatroom', (messages) => {
            this.setPastMessages(messages);
        });

        // принимаем с сервера новое сообщение
        client.on('newMessage', (msg) => {
            this.setNewMessage(msg);
        });

        // принимаем с сервера видео реквест от другого пользователя
        client.on('newVideoRequest', (userName) => {
            this.saveVideoRequest(userName);
        });

        // принимаем с сервера сообщения связанные с WebRTC
        client.on('videoMessage', (videoMessage) => {
            this.socketReceived(videoMessage);
        });

        client.on('disconnect', () => {
            console.log('Disconnected from the server');
        });

        return client;
    }









    /*
    *  Все что написано ниже относится к WebRTC
    */



    //TODO:

    saveVideoRequest(userName){

        // Создаем новое webRTC подключение
        let pc = new this.PeerConnection(this.server, this.options);

        this.webRTCPeers[userName] = {
            candidateCache: []
        };
        // Сохраняем пира в списке пиров
        this.webRTCPeers[userName].connection = pc;
        // Инициализируем WebRtc соединение
        this.initConnection(pc, userName, "offer");

        // Создаем DataChannel по которому и будет происходить обмен сообщениями
        const channel = pc.createDataChannel("mychannel", {});
        channel.owner = userName;
        this.webRTCPeers[userName].channel = channel;

        // Создаем SDP offer
        pc.createOffer()
            .then((offer) => (pc.setLocalDescription(offer)))
            .catch(e => console.error(e));
    }


    socketReceived(data) {
        switch (data.type) {
            case "candidate":
                this.remoteCandidateReceived(localStorage.getItem('Name'), data.data);
                break;
            case "offer":
                this.remoteOfferReceived(localStorage.getItem('Name'), data.data);
                break;
            case "answer":
                this.remoteAnswerReceived(localStorage.getItem('Name'), data.data);
                break;
            default:
                break;
        }
    }


    initConnection(pc, userName, sdpType) {
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                // При обнаружении нового ICE кандидата добавляем его в список для дальнейшей отправки
                this.webRTCPeers[userName].candidateCache.push(event.candidate);
                console.log(this.webRTCPeers[userName]);
            } else {
                console.log(pc.localDescription);
                // Когда обнаружение кандидатов завершено, обработчик будет вызван еще раз, но без кандидата
                // В этом случае мы отправялем пиру сначала SDP offer или SDP answer (в зависимости от параметра функции)...
                this.sendWebRTCMessage(sdpType, pc.localDescription);
                // ...а затем все найденные ранее ICE кандидаты
                for (let i = 0; i < this.webRTCPeers[userName].candidateCache.length; i++) {
                    this.sendWebRTCMessage("candidate", this.webRTCPeers[userName].candidateCache[i]);
                }
            }
        };
        pc.oniceconnectionstatechange = function (event) {
            if (pc.iceConnectionState === "disconnected") {
                delete this.webRTCPeers[userName];
            }
        };
        // add the other peer stream
        pc.onaddstream = (event) => {
            console.info("on add stream called");
            document.getElementById("remote").srcObject = event.stream;
        };


    }


    remoteOfferReceived(userName, data) {
        this.createConnection(userName);
        let pc = this.webRTCPeers[userName].connection;

        console.log(this.webRTCPeers[userName].connection);


        let desc = new RTCSessionDescription(data);
        return pc.setRemoteDescription(desc)
            .then(() => {
                navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true
                })
                    .then((stream) => {
                        if (document.getElementById("local")) {
                            document.getElementById("local").srcObject = stream;
                        } else {
                            // Avoid using this in new browsers, as it is going away.
                            document.getElementById("local").src = URL.createObjectURL(stream);
                        }
                        pc.addStream(stream)
                    })
                    .catch(function(e) {
                        alert('getUserMedia() error: ' + e.name);
                        console.log(e);
                    });
            })
            .then(() => pc.createAnswer())
            .then((answer) => pc.setLocalDescription(answer))
            .catch(e => console.error(e));

    }

    createConnection(userName) {
        if (this.webRTCPeers[userName] === undefined) {
            this.webRTCPeers[userName] = {
                candidateCache: []
            };
            let pc = new this.PeerConnection(this.server, this.options);
            this.initConnection(pc, userName, "answer");

            this.webRTCPeers[userName].connection = pc;
            pc.ondatachannel = (e) => {
                this.webRTCPeers[userName].channel = e.channel;
                this.webRTCPeers[userName].channel.owner = userName;
            }
        }
    }

    remoteAnswerReceived(userName, data) {
        let pc = this.webRTCPeers[userName].connection;
        pc.setRemoteDescription(data)
            .catch(e => console.log(e));
    }



    remoteCandidateReceived(userName, data) {
        this.createConnection(userName);
        let pc = this.webRTCPeers[userName].connection;
        pc.addIceCandidate(new this.IceCandidate(data))
            .catch(e => console.log(e));
    }

    uuid () {
        let s4 = function() {
            return Math.floor(Math.random() * 0x10000).toString(16);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

}

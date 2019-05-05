import React, {Component} from "react";
import Navigation from "./navigation";
import ActiveChatList from "./active-chat-list";
import ActiveUserList from "./active-user-list";
import Chat from "./chat";


// главный компонент приложения, контейнер для остальных компонентов

class Home extends Component {

    constructor(props){
        super(props);
        // заполняем чатлист тестовым сообщением до получения сообщений от сервера
        props.service.fillChatList();
        // подключаемся к серверу
        props.service.connectToServer();
    }



    render() {
        const {service} = this.props;
        return (
            <div className="homepage">
                {/* все остальные компоненты вызываются здесь */}
                <Navigation service = {service} />
                <div className='main'>
                    <ActiveChatList service = {service}/>
                    <Chat  service = {service}/>
                    <ActiveUserList service = {service}/>
                </div>
            </div>
        );
    }
}

export default Home;

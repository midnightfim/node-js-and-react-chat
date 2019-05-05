import React, {Component} from 'react';
import '../css/App.css';
import {Service} from '../service'
import Home from "./home";
import Login from "./login";


// компонент - родитель для остальных компонентов
export class App extends Component {
    
    constructor(props){
        super(props);
        this.state = {
            service: new Service(this),
        };
        // записываем chatname из url в localStorage
        this.getChatNameFromUrl();
    }

    // если в url ничего нет, сохраняем в localStorage название главного чатрума
    getChatNameFromUrl() {
        if (this.props.match.params.chatname === undefined) {
            localStorage.setItem('CurrentChatName', 'root');
        } else {
            localStorage.setItem('CurrentChatName', this.props.match.params.chatname);
        }
    }


    render() {
        const {service} = this.state;
        if (service.isLogged === true) {

            /*   Если имя есть в localStorage, перенаправляем пользователя в Home, если нет то в Login   */

            return (
                    <Home service={service}/>
            )
        } else {
            return (
                    <Login service={service}/>
            )}
    }
    }

export default App;

import React, {Component} from "react";
import Card from "@material-ui/core/Card";
import {CardContent, CardHeader} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Textarea from "@material-ui/core/InputBase/Textarea";
import CardActionArea from "@material-ui/core/CardActionArea";

// компонент приложения, реализующий чат

class Chat extends Component {

    constructor(props){
        super(props);
        this.state= {
            message: '',
            video: ''
        };
    }

    // метод, реализующий работу с сообщениями
        /* получаем список сообщений из сервиса */
         /* возвращаем новый массив сообщений с готовой версткой */
    getCurrentMessages(){
        const service = this.props.service;
        let date = new Date();
        let messages = service.chatList[localStorage.getItem('CurrentChatName')].getMessages();
        return messages.map((item, i) => {
            date.setTime(item.createdAt);
            if (item.from === localStorage.getItem('Name')) {
                return <Card key={i}
                             style={{minWidth: '25%', minHeight: '17%', maxWidth: '95%', alignSelf: "flex-end",
                margin: '1%', marginRight: '5%'}}
                             className='myMessage'
                             raised={true}>
                    <CardHeader subheader={<b>{item.from}</b>}
                                style={{textAlign: "left", backgroundColor: '#3b65bf', fontWeight: 'bold'}}> </CardHeader>
                    <CardContent>
                        {item.text}
                    </CardContent>
                    <CardActionArea style={{padding: '3%'}}>{(('0' + date.getHours()).slice(-2))}:{(('0' + date.getMinutes()).slice(-2))}:
                        {(('0' + date.getSeconds()).slice(-2))}</CardActionArea>
                </Card>
            } else {
                return <Card key={i}
                             style={{minWidth: '25%', minHeight: '17%', maxWidth: '95%',  alignSelf: "flex-start",
                    margin: '1%', marginLeft: '5%'}}
                             className='notMyMessage'
                             raised={true}>
                    <CardHeader subheader={<b>{item.from}</b>}
                                style={{textAlign: "right", backgroundColor: '#84d9e8'}}> </CardHeader>
                    <CardContent style={{textAlign: "right"}}> {item.text} </CardContent>
                    <CardActionArea style={{textAlign: "right", padding: '3%'}}>{(('0' + date.getHours()).slice(-2))}:{(('0' + date.getMinutes()).slice(-2))}:
                        {(('0' + date.getSeconds()).slice(-2))}</CardActionArea>
                </Card>
            }
        });

    }

    // метод для записи текущего поля ввода в state
    handleSubmit = (value) => {
        value.preventDefault();
        this.setState({
            message: value.target.value
        });
    };



    // отправляем запрос на начало видео конференции
    newVideoRequest = () => {
        this.props.service.newVideoRequestToServer();
    };


    // проверяем, что сообщение не пустое, затем отправляем на сервер
    setMessage = () => {
        if (this.state.message.length >= 1) {
            this.props.service.postNewMessage(this.state.message);
            this.setState({
                message: ''
            });
        }
    };

    // вспомогательная функция, реализующая отправку сообщений по нажатию Enter
    clickEnterForMessage = (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            this.setMessage();
        }
    };

    render() {
        return (<div className="chat">
            {this.getCurrentMessages()}
                <video id='remote' autoPlay> </video> <video id='local' autoPlay> </video>

                {/*    Все, что находится ниже относится с форме для отправки сообщений        */}

            <form style={{position: 'absolute', bottom: '0', left: '0', right: '0',
                width: '58%', marginRight: '15%', marginLeft: '26%' }}>
                <Card style={{backgroundColor: '#dedede', opacity: '0.8'}}>
                <div className="enterMessage">
                <Textarea type="text" placeholder="Enter message" variant='filled'
                          value={this.state.message}
                          onChange={this.handleSubmit}
                          style={{margin: '2%'}}
                          onKeyDownCapture={event => this.clickEnterForMessage(event)}
                                     />
                    <Button type="button" variant="contained"
                            onClick={this.newVideoRequest}
                            color="primary">
                        Video
                    </Button>
                <Button type="button" variant="contained"
                        onClick={this.setMessage}
                        color="primary">
                    Enter
                </Button>
                </div>
                </Card>
            </form>
            </div>
        );
    }
}

export default Chat;

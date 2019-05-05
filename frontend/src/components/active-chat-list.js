import React, {Component} from "react";
import Card from '@material-ui/core/Card';
import {Button, CardContent, CardHeader, Dialog, Divider, FormControl, Input} from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";


// компонент приложения, реализующий список активных чатов

class ActiveChatList extends Component {

    constructor(props){
        super(props);
        this.state = {
            visible : false,
            newChatName: ''
        }
    }

    // получаем названия комнат
        /*возвращаем массив с готовой верской*/
    getCurrentChatNames(){
        const service = this.props.service;
        let names = service.chatNames.map(function(item, i){
            return (
                <Card key={i} style={{display: 'flex', justifyContent: "space-between"}}>
                <CardContent style={{textAlign: 'center', color: '#05119c', fontSize: '20px'}}>{item}</CardContent>
                <Button onClick={() => {
                    window.location.href = './' + item;
                }}> Join Chat </Button>
            </Card>
            )
        });
        return (<div>{names}</div>);
    }

    // открываем окно диалога
    openModal() {
        this.setState({
            visible : true
        }, );
    }

    // закрыываем окно диалога
    closeModal() {
        this.setState({
            visible : false
        });
    }

    // записывем в состояние значение поля ввода
    handleSubmitChat = (value) => {
        this.setState({
            newChatName: value.target.value
        });
    };

    // создаем новую комнату
        /*проверяем, есть ли уже такая комната и длинну имя*/
            /*после всех проверок отправляем имя новой комнаты на сервер*/
    newChatRoom = () => {
        let isName = true;
        this.props.service.chatNames.forEach((item) => {
            if (item === this.state.newChatName){
                isName = false;
            }
        });
        if (this.state.newChatName.length > 2 && isName) {
            this.props.service.createNewChatRoom(this.state.newChatName);
        }
    };

    render() {
        return (
                <Card raised={true} className='ActiveChats' style={{width: '25%'}}>
                    <CardHeader title="Chat List" style={{textAlign: "center"}}> </CardHeader>
                    <Divider/>
                    {this.getCurrentChatNames()}
                        <CardActions style={{display: 'flex', justifyContent: 'center'}}>
                            <Button  value="Open" onClick={() => this.openModal()}>
                            Create ChatRoom
                        </Button>

                            {/* диалоговое окно */}

                            <Dialog open={this.state.visible} style={{effect: "fadeInUp",
                                position: 'absolute',
                                top: '0', bottom: '0', right: '0',
                                left: '0'}}
                                   onBackdropClick={() => this.closeModal()}>
                                    <FormControl style={{padding: '10%', display: "flex"}}>
                                        <Input type="text" name="chatname" placeholder="Enter your chat name"
                                               value={this.state.newChatName}
                                               onChange={this.handleSubmitChat}/>
                                        <Button type="button" variant="contained" onClick={this.newChatRoom} color="primary">
                                            Enter
                                        </Button>
                                    </FormControl>
                            </Dialog>
                        </CardActions>
                    <Divider/>
                </Card>

        );
    }
}

export default ActiveChatList;

import React, {Component} from "react";
import Card from "@material-ui/core/Card";
import {CardContent, CardHeader, Divider} from "@material-ui/core";

// компонент приложения, реализующий список активных пользователей в чатруме

class ActiveUserList extends Component {

    constructor(props){
        super(props);
        this.getActiveUsers();
    }

    // получаем список активных пользователей из сервиса
    getActiveUsers(){
        let activeUserName = [];
        const service = this.props.service;
        service.onlineUserList.forEach((item, i) => {
            activeUserName.push(<div key={i}>{item}</div>);
        });
        return activeUserName;
    }


    render() {
        return (
            <Card className="ActiveUsers" style={{width: '15%'}}>
                <CardHeader title={localStorage.getItem('CurrentChatName')}
                subheader="Online"> </CardHeader>
                <Divider/>
                <CardContent style={{fontSize: '16px', color: '#05119c'}}>{this.getActiveUsers()}</CardContent>
            </Card>
        );
    }
}

export default ActiveUserList;

import React, {Component} from "react";
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';

class Navigation extends Component {

    // компонент, реализующий навигацию в шапке сайта
    constructor(props){
        super(props);
        this.service = props.service;
    }

    render() {
        return (
                <AppBar color="default" position='static'>
                    <div className='nav'>
                        <div><a href="./" style={{textDecoration: 'none'}}>ReactNodeChatApp</a></div>
                        <div className="userNameHead">{this.service.userName}</div>
                        <div>
                        <Button size='medium' variant='text'
                                onClick={this.props.service.exit}>Exit</Button></div>
                    </div>
                </AppBar>
        );
    }
}

export default Navigation;

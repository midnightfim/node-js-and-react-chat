import React, {Component} from 'react';
import logo from '../logo.svg';
import '../css/App.css';
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";




// компонент, реализующий авторизацию
class Login extends Component {

    state = {
        inputName: ''
    };
    constructor(props){
        super(props);
        this.service = props.service;
        this.inputName = '';
    }

    // метод для записи текущего поля ввода в state
    handleSubmit = value => {

        value.preventDefault();
        this.setState({inputName: value.target.value}, () => (this.inputName = this.state.inputName));
    };

    // метод для записи имя пользователя в localStorage и последующей отправки на сервер
    setUserName = () => {
        if (this.state.inputName.length > 2) {
            this.props.service.setUserName(this.state.inputName);
        }
    };

    // провераям что введённое имя не пустое
    UserNameCheck = () => {
    if (this.inputName < 2) {
        return <div><font color='red'>UserName is too short.</font></div>
    }
    return <div> </div>;
}


    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <div className="Login">
                        <form className="signup-form mdc-theme--dark" onSubmit={this.setUserName}>
                            <InputLabel htmlFor="my-input" >Enter your name:</InputLabel>
                            <Input type="text" name="username" placeholder=""
                                   value={this.state.inputName}
                                   onChange={this.handleSubmit}/>
                        </form>
                        <Button type="button" variant="contained" onClick={this.setUserName} color="primary">Enter</Button>
                        {this.UserNameCheck() }
                    </div>
                </header>
            </div>
        );
    }
}

export default Login;

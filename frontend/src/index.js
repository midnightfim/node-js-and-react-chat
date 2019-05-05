import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app';
import {BrowserRouter} from "react-router-dom";
import {Route} from "react-router";



ReactDOM.render((
        <BrowserRouter>
            <Route exact path='/' component={App}/>
            <Route path='/:chatname' component={App}/>
        </BrowserRouter>
        ), document.getElementById('root'));

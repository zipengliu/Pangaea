import React from 'react';
import ReactDOM from 'react-dom';
import { Router, IndexRoute, Route, browserHistory} from 'react-router';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import createLogger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';

import reducer from './reducer';
import App from './Components/App';
import Test from './Components/Test';
import Submit from './Components/Submit';
import About from './Components/About';
import MainView from './Components/MainView';
import './index.css';

console.log('Welcome to Pangaea!');

let loggerMiddleware = createLogger();
let store = createStore(reducer, applyMiddleware(thunkMiddleware, loggerMiddleware));


let root = (
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={App}>

                <IndexRoute component={About} />
                <Route path="instance/:instanceId" component={MainView}/>
                <Route path="test/:instanceId" component={Test} />
                <Route path="submit/:instanceId" component={Submit} />
            </Route>
        </Router>
    </Provider>
);

ReactDOM.render(root, document.getElementById('root'));

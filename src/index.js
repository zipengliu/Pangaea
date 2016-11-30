import React from 'react';
import ReactDOM from 'react-dom';
import { Router, IndexRoute, Route, browserHistory} from 'react-router'

import App from './Components/App';
import Test from './Components/Test';
import Submit from './Components/Submit';
import About from './Components/About';
import './index.css';

let root = (
    <Router history={browserHistory}>
        <Route path="/" component={App}>

            <IndexRoute component={About} />
            <Route path="test/:instanceId" component={Test} />
            <Route path="submit/:instanceId" component={Submit} />
        </Route>
    </Router>
);

ReactDOM.render(root, document.getElementById('root'));
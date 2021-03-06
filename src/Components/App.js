import React, { Component } from 'react';
import {Navbar, Nav, NavItem} from 'react-bootstrap';
import './App.css';


class App extends Component {
    render() {
        return (
            <div className="App">
                <Navbar inverse>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <a href="/">Pangaea</a>
                        </Navbar.Brand>
                    </Navbar.Header>
                    <Nav>
                        <NavItem eventKey={1} href="/selected-instances">Selected Instances</NavItem>
                        <NavItem eventKey={6} href="/">About</NavItem>
                    </Nav>
                </Navbar>

                {this.props.children}
            </div>
        );
    }
}

export default App;

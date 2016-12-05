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
                            <a href="/">Project Name</a>
                        </Navbar.Brand>
                    </Navbar.Header>
                    <Nav>
                        <NavItem eventKey={1} href="/instance/Put-then-Get">Put then Get</NavItem>
                        <NavItem eventKey={2} href="/instance/1">Test</NavItem>
                        <NavItem eventKey={3} href="/submit/1">Submit</NavItem>
                        <NavItem eventKey={4} href="/">About</NavItem>
                    </Nav>
                </Navbar>

                {this.props.children}
            </div>
        );
    }
}

export default App;

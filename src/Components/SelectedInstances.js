/**
 * Created by Zipeng Liu on 2016-12-01.
 */

import React, { Component } from 'react';
import {ListGroup, ListGroupItem} from 'react-bootstrap';

class SelectedInstances extends Component {
    render() {
        let instances = [
            {name: 'test', instanceId: '1'},
            {name: 'test2', instanceId: '1'}
        ];

        return (
            <div>
                <h1>Selected Instance List</h1>
                <div style={{width: '200px'}}>
                    <ListGroup>
                        {instances.map(d =>
                            <ListGroupItem href={'/instance/' + d.instanceId}>{d.name}</ListGroupItem>
                        )}
                    </ListGroup>
                </div>
            </div>
        )

    }
}

export default SelectedInstances;

/**
 * Created by Zipeng Liu on 2016-12-01.
 */

import React, { Component } from 'react';
import {ListGroup, ListGroupItem} from 'react-bootstrap';

class SelectedInstances extends Component {
    render() {
        let instances = [
            {name: 'Raft Put then Get (large)', instanceId: 'Put-then-Get-Large'},
            {name: 'Raft Put then Get (small)', instanceId: 'Put-then-Get-Small'},
            {name: 'Raft Put and Get', instanceId: 'Put-and-Get'},
            {name: 'Raft Put and get with Failure', instanceId: 'Put-and-Get-Fail'},
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

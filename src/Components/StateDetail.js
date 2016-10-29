/**
 * Created by Zipeng Liu on 2016-10-26.
 */

import React, { Component } from 'react';
import {Panel} from 'react-bootstrap';

class StateDetail extends Component {
    render() {
        return (
            <div>
                <Panel header="State Detail">
                    {JSON.stringify(this.props.state)}
                </Panel>
            </div>
        );
    }
}

export default StateDetail;

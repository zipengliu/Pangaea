/*
 * Created by Zipeng Liu on 2016-10-26.
 */

import React, { Component } from 'react';
import 'whatwg-fetch';
import StateDetail from './StateDetail';
import TimeCurve from './TimeCurve';
import {reduceDim} from '../utils';

class Test extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedState: null,
            points: [[10, 10], [200, 10], [150, 30]],
            states: [1, 2, 3]
        }
    }

    componentDidMount() {
        console.log('fetching data...');
        let that = this;
        // Get state from server
        fetch(`http://localhost:23333/instance/${this.props.params.instanceId}`)
            .then(function(response) {
                if (response.status >= 400) {
                    throw new Error("Bad response from server");
                }
                return response.json();
            }).then(function (data) {
                console.log(data);
                that.setState({
                    distances: data.distances,
                    coordinates: reduceDim(data.distances),
                    states: data.states
                })
            });
    }

    componentDidUpdate() {
        console.log('component did update');
    }

    render() {
        return (
            <div>
                <div>
                    {this.state.coordinates && <TimeCurve points={this.state.coordinates} />}
                </div>
                <div>
                    {/*<StateDetail state={this.state.selectedState} />*/}
                </div>

            </div>
        )
    }
}

export default Test;

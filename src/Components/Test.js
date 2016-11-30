/*
 * Created by Zipeng Liu on 2016-10-26.
 */

import React, { Component } from 'react';
import 'whatwg-fetch';
import StateDetail from './StateDetail';
import TimeCurve from './TimeCurve';

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
        let that = this;
        // Get state from server
        let transformPoints = x => (x + 2.0)*100;

        fetch(`http://localhost:23333/instance/${this.props.params.instanceId}`)
            .then(function(response) {
                if (response.status >= 400) {
                    throw new Error("Bad response from server");
                }
                return response.json();
            }).then(function (data) {
                console.log(data);
                // data.points = data.points.map(p => [transformPoints(p[0]), transformPoints(p[1])]);
                that.setState({
                    points: data.points,
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
                    <TimeCurve points={this.state.points} />
                </div>
                <div>
                    <StateDetail state={this.state.selectedState} />
                </div>

            </div>
        )
    }
}

export default Test;

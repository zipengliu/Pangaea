/*
 * Created by Stewart Grant
 */

import React, { Component } from 'react';
import 'whatwg-fetch';
import StateDetail from './StateDetail';
import TimeCurve from './TimeCurve';

class Submit extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedState: null,
            points: [],
            states: []
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {

    }

    componentDidUpdate() {
        console.log('component did update');
    }

    handleSubmit(e) {
        e.preventDefault();
        let that = this;
        // Get state from server
        let transformPoints = x => (x + 2.0)*100;
        fetch(`http://localhost:23333/dinv-output/${this.props.params.instanceId}`)
            .then(function(response) {
                if (response.status >= 400) {
                    throw new Error("Bad response from server");
                }
                return response.json();
            }).then(function (data) {
                console.log(data);
                data.points = data.points.map(p => [transformPoints(p[0]), transformPoints(p[1])]);
                that.setState({
                    points: data.points,
                    states: data.states
                })
            });
    }


    nullfunc(e) {
    }



    render() {
        return (
            <div>
                <h1>Submit Dinv json output in the box below</h1>

                <div>
                    <TimeCurve points={this.state.points} />
                </div>
                <form enctype="multipart/form-data" onSubmit={this.handleSubmit}>
                    <input type="file" accept="image/*" name="myPic" />
                    <button>{'Submit'}</button>
                </form>
                <div>
                    <StateDetail state={this.state.selectedState} />
                </div>

            </div>
        )
    }
}

export default Submit;

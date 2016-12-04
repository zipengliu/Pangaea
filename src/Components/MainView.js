/**
 * Created by Zipeng Liu on 2016-11-30.
 */

import React, { Component } from 'react';
import {connect} from 'react-redux';
import {fetchInstance} from '../actions';
import TimeCurveContainer from './TimeCurveContainer';
import InvariantGraphContainer from './InvariantGraphContainer';
import './MainView.css';

class MainView extends Component {
    componentDidMount() {
        this.props.dispatch(fetchInstance(this.props.params.instanceId));
    }

    render() {
        return (
            <div>
                {this.props.isFetching && <h1>Fetching data...</h1>}
                {!this.props.isFetching && this.props.fetchError != null &&
                <h1>{this.props.fetchError.toString() || 'Failed to fetch data.'}</h1>}
                {!this.props.isFetching && this.props.fetchError == null && this.props.instanceData &&
                    <div className="main-container">
                        <div className="time-curve-container">
                            <TimeCurveContainer />
                        </div>
                        <div className="invariant-graph-container">
                            <InvariantGraphContainer />
                        </div>
                    </div>
                }
            </div>
        )
    }
}

export default connect(state => state)(MainView);

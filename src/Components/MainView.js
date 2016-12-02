/**
 * Created by Zipeng Liu on 2016-11-30.
 */

import React, { Component } from 'react';
import {connect} from 'react-redux';
import {fetchInstance} from '../actions';
import TimeCurve from './TimeCurve';
import InvariantGraph from './InvariantGraph';

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
                    <div>
                        <TimeCurve points={this.props.overview.timeCurve.coordinates}
                                   states={this.props.instanceData.states}
                                   width={300} height={300} />
                        <InvariantGraph data={this.props.overview.invariantGraph}  />
                    </div>
                }
            </div>
        )
    }
}

export default connect(state => state)(MainView);

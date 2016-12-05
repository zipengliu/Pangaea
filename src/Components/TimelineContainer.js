/**
 * Created by Zipeng Liu on 2016-12-04.
 */

import React, { Component } from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import Timeline from './Timeline';
import {happenBefore} from '../utils';

import './MainView.css';

class TimelineContainer extends Component {
    render() {
        return (
            <div className="graph">
                <h3>Processes Communication</h3>
                <div className="svg">
                    <Timeline timeline={this.props.timeline} events={this.props.events} />
                </div>
            </div>
        )
    }
}

let getEventPosition = createSelector(
    [state => state.timeline.events],
    (events) => {
        // FIXME potential bug: should not modify the state here!
        for (let n in events) {
            for (let i = 0; i < events[n].length; i++) {
                events[n][i].level = null;
            }
        }
        let getPosLevel = (e) => {
            if (e.level !== null) return e.level;
            let just = e.justHappenBefore;
            if (just == null) return 0;
            return Math.max(getPosLevel(just), events[e.host][e.idx - 1].level || 0) + 1;
        };

        for (let n in events) {
            for (let i = 0; i < events[n].length; i++) {
                events[n][i].level = getPosLevel(events[n][i]);
            }
        }
        console.log(events);
        return events;
    }
);

let mapStateToProps = (state) => ({
    timeline: state.timeline,
    events: getEventPosition(state)
});

export default connect(mapStateToProps)(TimelineContainer);

/**
 * Created by Zipeng Liu on 2016-12-04.
 */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import Timeline from './Timeline';

import './MainView.css';

class TimelineContainer extends Component {
    componentDidUpdate() {
        let {displayCut, processes, eventGap} = this.props.timeline;
        if (displayCut) {
            let n = processes[0];
            let pos = Math.max((this.props.events[n][displayCut[n] || 0].level - 5) * eventGap, 0);
            ReactDOM.findDOMNode(this.refs.svg).scrollTop = pos;
        }
    }
    render() {
        return (
            <div className="graph">
                <h3>Processes Communication</h3>
                <div className="svg" ref="svg">
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

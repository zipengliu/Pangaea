/**
 * Created by Zipeng Liu on 2016-12-03.
 */

import React, { Component } from 'react';
import {connect} from 'react-redux';
import {ButtonGroup, Button, OverlayTrigger, Tooltip} from 'react-bootstrap';
import TimeCurve from './TimeCurve';
import {toggleClickState} from '../actions';

class TimeCurveContainer extends Component {
    render() {
        return (
            <div className="container">
                <div className="graph">
                    <h3>State Transitions</h3>
                    <div className="svg">
                        <TimeCurve timeCurve={this.props.timeCurve}
                                   states={this.props.states}
                                   processes={this.props.processes}
                                   onClickState={this.props.onClickState}/>
                    </div>
                </div>
                <div className="tools">
                    <ButtonGroup vertical bsSize="small">
                        {/*<OverlayTrigger placement="left" overlay={<Tooltip id="button-label">Show or hide the variable names on the invariant graph</Tooltip>}>*/}
                            {/*<Button onClick={this.props.onToggleLabel}>{d.showLabel? 'Hide': 'Show'} labels</Button>*/}
                        {/*</OverlayTrigger>*/}
                    </ButtonGroup>
                </div>
            </div>
        )
    }
}

let mapStateToProps = (state) => ({
    timeCurve: state.timeCurve,
    processes: state.instanceData.processes,
    states: state.instanceData.states,
});

let mapDispatchToProps = (dispatch) => ({
    onClickState: (idx) => {dispatch(toggleClickState(idx))}
});

export default connect(mapStateToProps, mapDispatchToProps)(TimeCurveContainer);


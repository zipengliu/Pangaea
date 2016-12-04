/**
 * Created by Zipeng Liu on 2016-12-03.
 */

import React, { Component } from 'react';
import {connect} from 'react-redux';
import {ButtonGroup, Button, OverlayTrigger, Tooltip} from 'react-bootstrap';
import TimeCurve from './TimeCurve';

class TimeCurveContainer extends Component {
    render() {
        return (
            <div className="container">
                <div className="graph">
                    <h3>State Transitions</h3>
                    <div className="svg">
                        <TimeCurve timeCurve={this.props.timeCurve}
                                   states={this.props.states}/>
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
    states: state.instanceData.states,
});

export default connect(mapStateToProps)(TimeCurveContainer);


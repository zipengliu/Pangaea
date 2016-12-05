/**
 * Created by Zipeng Liu on 2016-12-03.
 */

import React, { Component } from 'react';
import {connect} from 'react-redux';
import {ButtonGroup, Button, OverlayTrigger, Tooltip, FormGroup, Radio, Checkbox, Glyphicon} from 'react-bootstrap';
import TimeCurve from './TimeCurve';
import {toggleClickState, changeDiffFunc, toggleDumpVariable, toggleVariableList} from '../actions';

const BUILT_IN_ALL_VARS = '__ALL_VARIABLES__';

class TimeCurveContainer extends Component {
    render() {
        let {dumpVariables, isVariableListOpen} = this.props.timeCurve;

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
                    <div>
                        <p>State difference characterized by:</p>
                        <form>
                            <formGroup>
                                {this.props.diffFunc.map((d, i) =>
                                    <Radio inline key={i} name="diff" value={i}
                                           onChange={(e) => {e.currentTarget.value != this.props.activeDiffFuncId? this.props.onChangeDiffFunc(i): null}}
                                           checked={this.props.activeDiffFuncId == i}>{d.name}</Radio>)}
                            </formGroup>
                        </form>
                    </div>
                    <div style={{marginTop: '20px'}}>
                        <p>Filter on dumped variables:</p>
                        <div id="variable-filter">
                            <form>
                                {this.props.processes.map((p, pid) => <FormGroup key={pid}>
                                <span onClick={this.props.onToggleVariableList.bind(null, p)}>
                                    <Glyphicon glyph={isVariableListOpen[p]? 'triangle-bottom': 'triangle-right'}/>
                                </span>
                                    <Checkbox inline checked={dumpVariables[p][BUILT_IN_ALL_VARS]}
                                              onChange={this.props.onToggleDumpVariable.bind(null, p, null)}>{p}</Checkbox>
                                    {isVariableListOpen[p] && Object.keys(dumpVariables[p]).filter(v => v != BUILT_IN_ALL_VARS).map(v =>
                                        <Checkbox key={v} className="sec-level" checked={dumpVariables[p][v]}
                                                  onChange={this.props.onToggleDumpVariable.bind(null, p, v)}>{v}</Checkbox>
                                    )}
                                </FormGroup>)}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

let mapStateToProps = (state) => ({
    activeDiffFuncId: state.activeDiffFuncId,
    diffFunc: state.diffFunc,
    timeCurve: state.timeCurve,
    processes: state.instanceData.processes,
    states: state.instanceData.states,
});

let mapDispatchToProps = (dispatch) => ({
    onClickState: (idx) => {dispatch(toggleClickState(idx))},
    onChangeDiffFunc: (id) => {dispatch(changeDiffFunc(id))},
    onToggleDumpVariable: (p, v) => {dispatch(toggleDumpVariable(p, v))},
    onToggleVariableList: (p) => {dispatch(toggleVariableList(p))}
});

export default connect(mapStateToProps, mapDispatchToProps)(TimeCurveContainer);


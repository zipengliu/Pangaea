/**
 * Created by Zipeng Liu on 2016-12-03.
 */

import React, { Component } from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {ButtonGroup, Button, Glyphicon, OverlayTrigger, Tooltip} from 'react-bootstrap';
import InvariantGraph from './InvariantGraph';
import {toggleLabel, toggleHighlightInvariantNode} from '../actions';

import './MainView.css';

class InvariantGraphContainer extends Component {
    render() {
        let d = this.props.invariantGraph;
        return (
            <div className="container">
                <div className="graph">
                    <h3>Invariant Graph</h3>
                    <div className="svg">
                        <InvariantGraph data={d} highlightedNodes={this.props.highlightedNodes}
                                        onToggleHighlight={this.props.onToggleHighlight} />
                    </div>
                </div>
                <div className="tools">
                    <ButtonGroup vertical bsSize="small">
                        <OverlayTrigger placement="left" overlay={<Tooltip id="button-label">Show or hide the variable names on the invariant graph</Tooltip>}>
                            <Button onClick={this.props.onToggleLabel}>{d.showLabel? 'Hide': 'Show'} labels</Button>
                        </OverlayTrigger>
                        {/*<OverlayTrigger placement="left" overlay={<Tooltip id="button-trans">Hover to explore the transitivity of a variable</Tooltip>}>*/}
                        {/*<Button onClick={this.props.onToggleTransivityMode} active={d.transitivityMode}>Explore Transitivity</Button>*/}
                        {/*</OverlayTrigger>*/}
                    </ButtonGroup>
                </div>
            </div>
        )
    }
}

let getHighlights = createSelector(
    [state => state.instanceData.invariants, state => state.invariantGraph.highlightNodeName],
    (nodes, highlightNodeName) => {
    let highlightedNodes = {};
    let isTransitive = (op1, op2) => {
        return op1[0] == op2[0];
    };
    let dfs = (name, op) => {
        highlightedNodes[name] = true;
        let n = nodes[name];
        for (let i = 0; i < n.links.length; i++) {
            if (isTransitive(op, n.links[i].op) && !highlightedNodes[n.links[i].varName]) {
                dfs(n.links[i].varName, op);
            }
        }
    };
    if (highlightNodeName) {
        highlightedNodes[highlightNodeName] = true;
        let n = nodes[highlightNodeName];
        for (let i = 0; i < n.links.length; i++) {
            dfs(n.links[i].varName, n.links[i].op);
        }
    }

    return highlightedNodes;
});

let mapStateToProps = (state) => ({
    invariantGraph: state.invariantGraph,
    highlightedNodes: getHighlights(state)
});

let mapDispatchToProps = (dispatch) => ({
    onToggleLabel: () => {dispatch(toggleLabel())},
    // onToggleTransivityMode: () => {dispatch(toggleTransitivityMode())}
    onToggleHighlight: (name) => {dispatch(toggleHighlightInvariantNode(name))}
});

export default connect(mapStateToProps, mapDispatchToProps)(InvariantGraphContainer);


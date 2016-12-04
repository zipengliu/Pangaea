/**
 * Created by Zipeng Liu on 2016-11-30.
 */

import * as TYPE from './actionTypes';
import {reduceDim, performForceSimulation} from './utils';

let initialState = {
    instanceData: null,
    isFetching: false,
    fetchError: null,
    timeCurve: {
        coordinates: null
    },
    invariantGraph: {
        nodes: null,
        links: null,
        width: 500,
        height: 300,
        showLabel: true,
        transitivityMode: false,
        highlightNodeName: null
    }
};

function getNodeAndLinkFromInvariants(invariants) {
    let nodes = {};
    for (let i = 0; i < invariants.length; i++) {
        let d = invariants[i];
        nodes[d.LeftArgument] = true;
        nodes[d.RightArgument] = true;
    }
    return {nodes: Object.keys(nodes).map(x => ({varName: x})),
        links: invariants.map(d => ({source: d.LeftArgument, target: d.RightArgument, op: d.Operator}))};
}

let reverseOperators = {'==': '==', '<': '>', '>': '<', '<=': '>=', '>=': '<=', '!=': '!='};

function getNodes(invariants) {
    let nodes = {};
    for (let i = 0; i < invariants.length; i++) {
        let d = invariants[i];
        if (!(d.LeftArgument in nodes)) {
            nodes[d.LeftArgument] = {varName: d.LeftArgument, links: []}
        }
        if (!(d.RightArgument in nodes)) {
            nodes[d.RightArgument] = {varName: d.RightArgument, links: []}
        }

        nodes[d.LeftArgument].links.push({varName: d.RightArgument, op: d.Operator});
        nodes[d.RightArgument].links.push({varName: d.LeftArgument, op: reverseOperators[d.Operator]});
    }
    return nodes;
}

function reducer(state = initialState, action) {
    switch (action.type) {
        case TYPE.FETCH_INSTANCE_REQUEST:
            return Object.assign({}, state, {
                isFetching: true
            });
        case TYPE.FETCH_INSTANCE_SUCCESS:
            // let tmp = getNodeAndLinkFromInvariants(action.data.invariants);
            let invariantNodes = getNodes(action.data.invariants);
            let {nodes, links} = performForceSimulation(
                Object.keys(invariantNodes).map(x => invariantNodes[x]),
                action.data.invariants.map(d => ({source: d.LeftArgument, target: d.RightArgument, op: d.Operator})),
                state.invariantGraph.width, state.invariantGraph.height);
            return Object.assign({}, state, {
                isFetching: false,
                instanceData: {
                    ...action.data,
                    invariants: invariantNodes
                },
                timeCurve: {
                    ...state.timeCurve,
                    coordinates: reduceDim(action.data.distances)
                },
                invariantGraph: {
                    ...state.invariantGraph,
                    nodes,
                    links
                }
            });
        case TYPE.FETCH_INSTANCE_FAILURE:
            return Object.assign({}, state, {
                isFetching: false,
                fetchError: action.error
            });

        case TYPE.TOGGLE_LABEL:
            return Object.assign({}, state, {
                invariantGraph: {
                    ...state.invariantGraph,
                    showLabel: !state.invariantGraph.showLabel
                }
            });
        case TYPE.TOGGLE_TRANSITIVITY_MODE:
            return Object.assign({}, state, {
                invariantGraph: {
                    ...state.invariantGraph,
                    transitivityMode: !state.invariantGraph.transitivityMode
                }
            });
        case TYPE.TOGGLE_HIGHLIGHT_INVARIANT_NODE:
            return Object.assign({}, state, {
                invariantGraph: {
                    ...state.invariantGraph,
                    highlightNodeName: action.name
                }
            });


        default:
            return state;
    }
}

export default reducer;
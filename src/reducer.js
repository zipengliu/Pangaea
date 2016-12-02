/**
 * Created by Zipeng Liu on 2016-11-30.
 */

import * as TYPE from './actionTypes';
import {reduceDim, performForceSimulation} from './utils';

let initialState = {
    instanceData: null,
    isFetching: false,
    fetchError: null,
    overview: {
        timeCurve: {
            coordinates: null
        },
        invariantGraph: {
            nodes: null,
            links: null,
            width: 500,
            height: 300
        }
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

function reducer(state = initialState, action) {
    switch (action.type) {
        case TYPE.FETCH_INSTANCE_REQUEST:
            return Object.assign({}, state, {
                isFetching: true
            });
        case TYPE.FETCH_INSTANCE_SUCCESS:
            let tmp = getNodeAndLinkFromInvariants(action.data.invariants);
            let {nodes, links} = performForceSimulation(tmp.nodes, tmp.links,
                state.overview.invariantGraph.width, state.overview.invariantGraph.height);
            return Object.assign({}, state, {
                isFetching: false,
                instanceData: action.data,
                overview: {
                    ...state.overview,
                    timeCurve: {
                        ...state.overview.timeCurve,
                        coordinates: reduceDim(action.data.distances)
                    },
                    invariantGraph: {
                        ...state.overview.invariantGraph,
                        nodes,
                        links
                    }
                }
            });
        case TYPE.FETCH_INSTANCE_FAILURE:
            return Object.assign({}, state, {
                isFetching: false,
                fetchError: action.error
            });

        default:
            return state;
    }
}

export default reducer;
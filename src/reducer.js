/**
 * Created by Zipeng Liu on 2016-11-30.
 */

import * as TYPE from './actionTypes';
import {reduceDim, performForceSimulation, happenBefore} from './utils';

let initialState = {
    instanceData: null,
    isFetching: false,
    fetchError: null,
    timeCurve: {
        coordinates: null,
        width: 500,
        height: 300,
        padding: {top: 50, bottom: 50, left: 50, right: 100},
    },
    invariantGraph: {
        nodes: null,
        links: null,
        width: 500,
        height: 400,
        showLabel: true,
        transitivityMode: false,
        highlightNodeName: null
    },
    timeline: {
        padding: {left: 50, right: 50, top: 10, bottom: 10},
        processGap: 150,
        eventGap: 50,
        processes: [],
        events: {},
        cuts: []
    }
};

// function getNodeAndLinkFromInvariants(invariants) {
//     let nodes = {};
//     for (let i = 0; i < invariants.length; i++) {
//         let d = invariants[i];
//         nodes[d.LeftArgument] = true;
//         nodes[d.RightArgument] = true;
//     }
//     return {nodes: Object.keys(nodes).map(x => ({varName: x})),
//         links: invariants.map(d => ({source: d.LeftArgument, target: d.RightArgument, op: d.Operator}))};
// }

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

function getEvents(logs) {
    let events = {};
    for (let i = 0; i < logs.length; i++) {
        let d = logs[i];
        if (!(d.host in events)) {
            events[d.host] = [];
        }
        events[d.host].push({
            idx: events[d.host].length,
            host: d.host,
            clock: d.clock,
            event: d.event
        })
    }

    // Sort events according to happenBefore relation
    for (let n in events) {
        events[n] = events[n].sort((a, b) => a.clock[n] - b.clock[n]);
        // events[n] = events[n].sort((a, b) => {
        //     if (happenBefore(a.clock, b.clock)) {
        //         return 1;
        //     } else if (happenBefore(b.clock, a.clock)) {
        //         return -1;
        //     } else return a.clock[n] - b.clock[n];
        // });
    }

    let getDiff = (c1, c2) => {
        let d = [];
        for (let x in c1) {
            if (!(x in c2) || c1[x] != c2[x]) {
                d.push(x);
            }
        }
        for (let x in c2) {
            if (!(x in c1)) {
                d.push(x);
            }
        }
        return d;
    };

    // Search all events[host] find that the one satisfying clock[p] = target
    let searchEventByClock = (host, p, target) => {
        // binary search
        let l = 0, r = events[host].length - 1;
        let m, v;
        while (l <= r) {
            m = Math.floor((l + r) / 2);
            v = events[host][m].clock[p];
            if (v < target) {
                l = m + 1;
            } else if (v > target) {
                r = m - 1;
            } else {
                break;
            }
        }
        return v == target? events[host][m]: null;
    };

    // Compare vector clock on certain processes
    let compareClocks = (c1, c2, processes) => {
        for (let i = 0; i < processes.length; i++) {
            let p = processes[i];
            if (!(p in c1) || !(p in c2) || c1[p] != c2[p]) return false;
        }
        return true;
    };

    let getJustHappenBefore = (e, idx) => {
        // TODO what if there is no initialization event?
        if (idx == 0) return null;
        let lastEvent = events[e.host][idx - 1];
        let diff = getDiff(e.clock, lastEvent.clock);
        if (diff.length == 1) {
            return lastEvent;
        } else {
            // Someone has sent it a message! e must be a recv event
            // Determine who is the sender
            diff.splice(diff.indexOf(e.host), 1);
            for (let i = 0; i < diff.length; i++) {
                let s = diff[i];
                let potentialSenderEvent = searchEventByClock(s, s, e.clock[s]);

                // if all other clock values in diff are coming from that senderEvent, bingo
                if (compareClocks(e.clock, potentialSenderEvent.clock, diff)) {
                    return potentialSenderEvent;
                }
            }
            return null;
        }
    };

    for (let n in events) {
        for (let i = 0; i < events[n].length; i++) {
            events[n][i].justHappenBefore = getJustHappenBefore(events[n][i], i);
        }
    }
    return events;
}


//
// function getEventOrders(events) {
//     let orders = {};
//     for (let n in events) {
//         orders[n] = {};
//         let compare = (a, b) => {
//             if (happenBefore(events[n][a].clock, events[n][b].clock)) {
//                 return 1;
//             } else if (happenBefore(events[n][b].clock, events[n][a].clock)) {
//                 return -1;
//             } else return 0;
//         };
//         let d = events[n].map(x => x.id).sort(compare);
//         for (let n2 in events) {
//             if (n2 != n) {
//                 let compare2 = (a, b) => {
//
//                 };
//                 orders[n][n2] = d.slice().sort(compare2);
//             }
//         }
//     }
// }

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
            let events = getEvents(action.data.logs);
            return Object.assign({}, state, {
                isFetching: false,
                instanceData: {
                    ...action.data,
                    invariants: invariantNodes,
                },
                timeCurve: {
                    ...state.timeCurve,
                    coordinates: reduceDim(action.data.distances)
                },
                invariantGraph: {
                    ...state.invariantGraph,
                    nodes,
                    links
                },
                timeline: {
                    ...state.timeline,
                    events,
                    processes: Object.keys(events)
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
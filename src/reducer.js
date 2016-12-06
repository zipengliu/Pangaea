/**
 * Created by Zipeng Liu on 2016-11-30.
 */

import * as TYPE from './actionTypes';
import {scaleLinear} from 'd3-scale';
import {reduceDim, avoidOverlap, performForceSimulation, isAllChecked, isDotWithinBox} from './utils';

let initialState = {
    instanceData: null,
    isFetching: false,
    fetchError: null,
    diffFunc: [{name: 'XOR'}, {name: 'BLABLA'}],
    activeDiffFuncId: 0,
    timeCurve: {
        coordinates: null,
        pathSegments: null,
        width: 500,
        height: 300,
        padding: {top: 50, bottom: 50, left: 50, right: 100},
        dumpVariables: {},
        isVariableListOpen: {},
        selectionArea: {},
        isSelecting: false,
        selectedStates: []
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
        displayCut: null
    },
};

const BUILT_IN_ALL_VARS = '__ALL_VARIABLES__';

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

// Search all events[host] find that the one satisfying clock[p] = target
let searchEventByClock = (events, host, p, target) => {
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
                let potentialSenderEvent = searchEventByClock(events, s, s, e.clock[s]);

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

function getCutPosition(events, states, processes) {
    for (let i = 0; i < states.length; i++) {
        let s = states[i];
        let clocks = s.Cut.Clocks;
        s.cutPosition = {};
        for (let j = 0; j < processes.length; j++) {
            let p = processes[j];
            let c = clocks[j];
            let pos = searchEventByClock(events, p, p, c[p]);
            s.cutPosition[p] = pos.idx;
        }
    }
}

function getDumpVariables(states, processes) {
    let allVars = {};
    for (let i = 0; i < processes.length; i++) {
        allVars[processes[i]] = {[BUILT_IN_ALL_VARS]: true};
    }
    for (let i = 0; i < states.length; i++) {
        let d = states[i].Points;
        for (let j = 0; j < d.length; j++) {
            let variables = d[j].Dump;
            let p = processes[j];
            for (let k = 0; k < variables.length; k++) {
                let varName = variables[k].VarName;
                allVars[p][varName] = true;
            }
        }
    }
    return allVars;
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
            let events = getEvents(action.data.logs);
            getCutPosition(events, action.data.states, action.data.processes);
            let dumpVariables = getDumpVariables(action.data.states, action.data.processes);


            let normalizedCoordinates = reduceDim(action.data.distances);
            let xScale = scaleLinear().range([0, state.timeCurve.width]);
            let yScale = scaleLinear().range([0, state.timeCurve.height]);
            let points = normalizedCoordinates.map(d => ({x: xScale(d.x), y: yScale(d.y)}));
            let coordinates = avoidOverlap(points, 4);

            return Object.assign({}, state, {
                isFetching: false,
                instanceData: {
                    ...action.data,
                    invariants: invariantNodes,
                },
                timeCurve: {
                    ...state.timeCurve,
                    normalizedCoordinates,
                    coordinates,
                    dumpVariables,
                    isVariableListOpen: action.data.processes.reduce((a, p) => {a[p] = false; return a}, {})
                },
                invariantGraph: {
                    ...state.invariantGraph,
                    nodes,
                    links
                },
                timeline: {
                    ...state.timeline,
                    events,
                    processes: action.data.processes
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

        case TYPE.TOGGLE_CLICK_STATE:
            return Object.assign({}, state, {
                timeline: {
                    ...state.timeline,
                    displayCut: action.stateIdx == null? null: state.instanceData.states[action.stateIdx].cutPosition
                }
            });
        case TYPE.CHANGE_DIFF_FUNC:
            return Object.assign({}, state, {
                activeDiffFuncId: action.id
            });
        case TYPE.TOGGLE_DUMP_VARIABLE:
            let varName = action.variableName || BUILT_IN_ALL_VARS;
            let toggled = !state.timeCurve.dumpVariables[action.processName][varName];
            let newDumpVariables = {
                ...state.timeCurve.dumpVariables,
                [action.processName]: {
                    ...state.timeCurve.dumpVariables[action.processName],
                    [varName]: toggled
                }
            };
            let d = newDumpVariables[action.processName];
            if (action.variableName) {
                if (!toggled) {
                    d[BUILT_IN_ALL_VARS] = false;
                } else {
                    if (isAllChecked(d, BUILT_IN_ALL_VARS)) {
                        d[BUILT_IN_ALL_VARS] = toggled;
                    }
                }
            } else {
                for (let v in d) {
                    d[v] = toggled;
                }
            }
            return Object.assign({}, state, {
                timeCurve: {
                    ...state.timeCurve,
                    dumpVariables: newDumpVariables
                }
            });
        case TYPE.TOGGLE_VARIABLE_LIST:
            return {
                ...state,
                timeCurve: {
                    ...state.timeCurve,
                    isVariableListOpen: {
                        ...state.timeCurve.isVariableListOpen,
                        [action.processName]: !state.timeCurve.isVariableListOpen[action.processName]
                    }
                }
            };
        case TYPE.START_SELECTION:
            return {
                ...state,
                timeCurve: {
                    ...state.timeCurve,
                    isSelecting: true,
                    selectionArea: {x1: action.x, y1: action.y, x2: action.x, y2: action.y}
                }
            };
        case TYPE.END_SELECTION:
            let selectedStates = [];
            let c = state.timeCurve.coordinates;
            for (let i = 0; i < c.length; i++) {
                if (isDotWithinBox(c[i], state.timeCurve.selectionArea)) {
                    selectedStates.push(i);
                }
            }
            return {
                ...state,
                timeCurve: {
                    ...state.timeCurve,
                    isSelecting: false,
                    selectedStates
                }
            };
        case TYPE.CHANGE_SELECTION:
            return {
                ...state,
                timeCurve: {
                    ...state.timeCurve,
                    isSelecting: true,
                    selectionArea: {...state.timeCurve.selectionArea, x2: action.x, y2: action.y}
                }
            };
        case TYPE.PATH_SEGMENT_READY:
            return {
                ...state,
                timeCurve: {
                    ...state.timeCurve,
                    pathSegments: action.segments
                }
            };



        default:
            return state;
    }
}

export default reducer;
/**
 * Created by Zipeng Liu on 2016-11-30.
 */

import * as TYPE from './actionTypes';
import 'whatwg-fetch';

const baseUrl = 'http://localhost:23333';


export function fetchInstance(id) {
    console.log('Fetching data...');
    return function (dispatch) {
        dispatch(requestInstance(id));
        return fetch(baseUrl + '/instance/' + id).then(function(response) {
            if (response.status >= 400) {
                console.log("Bad response from server");
                dispatch(fetchInstanceFailure(response.statusText))
            }
            return response.json();
        }).then(function (data) {
            console.log('Get data succeeded!');
            dispatch(fetchInstanceSuccess(data));
        }).catch(function(error) {
            dispatch(fetchInstanceFailure(error));
        });

    }
}

export function postDviz(data) {
    console.log('Going to Dviz...');
    return function (dispatch) {
        return fetch('http://localhost:3119',
            {
                method: "POST",
                body: data
            }
        ).then(function(response) {
            if (response.status >= 400) {
                console.log("Bad response from server");
                dispatch(fetchInstanceFailure(response.statusText))
            }
            return response.json();
        }).then(function (data) {
            console.log('Get data succeeded!');
            dispatch(fetchInstanceSuccess(data));
        }).catch(function(error) {
            dispatch(fetchInstanceFailure(error));
        });

    }
}


export function getDinvFile(id) {
    console.log('Going to get dinv file...');
    return function (dispatch) {
        dispatch(requestInstance(id));
        //make the request
        return fetch('http://localhost:3118').then(function(response) {
            if (response.status >= 400) {
                console.log("Bad response from server");
                dispatch(fetchInstanceFailure(response.statusText))
            }
            console.log("Good response code")
            console.log(response)
            return response.json();
        }).then(function (data) {
            console.log('Get data succeeded wow!');
            console.log(data)
            //dispatch(postDviz(data))
            dispatch(fetchInstanceSuccess(data));
        }).catch(function(error) {
            console.log("failed to parse json")
            dispatch(fetchInstanceFailure(error));
        });

    }
}

function requestInstance(id) {
    return {type: TYPE.FETCH_INSTANCE_REQUEST, instanceId: id}
}

function fetchInstanceSuccess(data) {
    return {type: TYPE.FETCH_INSTANCE_SUCCESS, data};
}

function fetchInstanceFailure(error) {
    return {type: TYPE.FETCH_INSTANCE_FAILURE, error: error.toString()}
}

export function toggleLabel() {
    return {type: TYPE.TOGGLE_LABEL}
}

export function toggleTransitivityMode() {
    return {type: TYPE.TOGGLE_TRANSITIVITY_MODE}
}

export function toggleHighlightInvariantNode(name) {
    return {type: TYPE.TOGGLE_HIGHLIGHT_INVARIANT_NODE, name};
}


export function toggleClickState(stateIdx) {
    return {type: TYPE.TOGGLE_CLICK_STATE, stateIdx};
}

export function changeDiffFunc(id) {
    return {type: TYPE.CHANGE_DIFF_FUNC, id};
}

export function toggleDumpVariable(processName, variableName) {
    return {type: TYPE.TOGGLE_DUMP_VARIABLE, processName, variableName};

}
export function toggleVariableList(processName) {
    return {type: TYPE.TOGGLE_VARIABLE_LIST, processName};
}


export function startSelection(x, y) {
    return {
        type: TYPE.START_SELECTION,
        x, y
    }
}

export function endSelection() {
    return {
        type: TYPE.END_SELECTION
    }
}

export function changeSelection(x, y) {
    return {
        type: TYPE.CHANGE_SELECTION,
        x, y
    }
}

export function pathSegmentReady(segments) {
    return {type: TYPE.PATH_SEGMENT_READY, segments}
}

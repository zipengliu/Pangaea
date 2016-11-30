/**
 * Created by Zipeng Liu on 2016-11-30.
 */

import * as TYPE from './actionTypes';
import {reduceDim} from './utils';

let initialState = {
    instanceData: null,
    isFetching: false,
    fetchError: null,
    overview: {
        timeCurve: {
            coordinates: null
        }
    }
};

function reducer(state = initialState, action) {
    switch (action.type) {
        case TYPE.FETCH_INSTANCE_REQUEST:
            return Object.assign({}, state, {
                isFetching: true
            });
        case TYPE.FETCH_INSTANCE_SUCCESS:
            return Object.assign({}, state, {
                isFetching: false,
                instanceData: action.data,
                overview: {
                    ...state.overview,
                    timeCurve: {
                        ...state.timeCurve,
                        coordinates: reduceDim(action.data.distances)
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
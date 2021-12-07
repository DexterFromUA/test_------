import {createStore} from 'redux';

const SET_TICKERS = 'SET_TICKERS';
const LOADING = 'LOADING';

export const loadingAction = status => ({
  type: LOADING,
  payload: status,
});

export const setTickersAction = tickers => ({
  type: SET_TICKERS,
  payload: tickers,
});

const initialState = {
  loading: true,
  data: [],
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case SET_TICKERS:
      return {
        ...state,
        prevData: [...state.data],
        data: [...action.payload],
      };

    default:
      return state;
  }
};

const store = createStore(reducer, initialState);

export default store;

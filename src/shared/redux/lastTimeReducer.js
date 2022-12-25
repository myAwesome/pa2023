export const REMINDER_LOADED = '@lastTime/REMINDER_LOADED';
export const LAST_TIMES_LOADED = '@lastTime/LAST_TIMES_LOADED';

const initialState = {
  reminder: [],
  lastTimes: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case REMINDER_LOADED:
      return { ...state, reminder: action.payload.data };
    case LAST_TIMES_LOADED:
      return { ...state, lastTimes: action.payload.data };
    default:
      return state;
  }
};

export default reducer;

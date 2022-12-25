import { createStore, compose } from 'redux';
import rootReducer from './rootReducer';

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, storeEnhancers());

export default store;

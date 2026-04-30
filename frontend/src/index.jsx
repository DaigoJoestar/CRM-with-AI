import React from 'react';

import ReactDOM from 'react-dom/client';

import { Provider } from 'react-redux';

import { store } from './store/store';

import LogInteractionScreen from './components/LogInteractionScreen';

import './theme/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(

  <Provider store={store}>

    <LogInteractionScreen />

  </Provider>

);
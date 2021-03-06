import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';
import { Provider } from 'react-redux';

import { App } from "./components/app";
import { reducers } from './redux/reducers';

import 'antd/dist/antd.css';
import './css/index.css';

const store: any = createStore(reducers, devToolsEnhancer({}));

ReactDOM.render(
	<Provider store={store}>
		<App/>
	</Provider>,
	document.getElementById('app')
);

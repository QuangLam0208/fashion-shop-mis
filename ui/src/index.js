import React from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';

import store from '@store';
import reportWebVitals from './reportWebVitals';

import App from './App';
import LanguageProvider from '@locales/LanguageProvider';

import '@assets/scss/index.scss';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <LanguageProvider>
                <App />
            </LanguageProvider>
        </Provider>
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

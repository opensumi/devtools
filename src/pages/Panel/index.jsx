import React from 'react';
import { render } from 'react-dom';
import Devtools from '../../ui/index';

render(<Devtools />, window.document.querySelector('#panel'));

if (module.hot) module.hot.accept();

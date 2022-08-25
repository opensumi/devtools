import React from 'react';
import { render } from 'react-dom';

import Panel from '../../ui/index';

render(<Panel />, window.document.querySelector('#panel'));

if (module.hot) module.hot.accept();

import React from 'react';
import { createRoot } from 'react-dom/client';
import Devtools from '../../ui/index';

const client = createRoot(window.document.querySelector('#panel'));
client.render(<Devtools />);

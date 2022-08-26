import React from 'react';
import Rpc from './Rpc/Rpc';
import Ipc from './Ipc/Ipc';

import './index.scss';

const Devtools = () => {
  return (
    <div>
      {/* <Rpc /> */}
      <Ipc />
    </div>
  );
};

export default Devtools;

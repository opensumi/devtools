import React, { useState, useEffect, useRef } from 'react';
import Rpc from './Rpc/Rpc';
import Ipc from './Ipc/Ipc';

import './index.scss';

const Devtools = () => {
  const [isRpc, setIsRpc] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const containerRef = useRef(null);

  const showRpc = () => {
    setIsRpc(true);
  };

  const showIpc = () => {
    setIsRpc(false);
  };

  const setCompactMode = () => {
    if (containerRef.current.offsetWidth < 600) {
      setIsCompact(true);
    } else {
      setIsCompact(false);
    }
  };

  useEffect(() => {
    setCompactMode();
    window.addEventListener('resize', setCompactMode);
  }, []);

  return (
    <div ref={containerRef}>
      <div className={`devtool-container ${isRpc ? 'show' : 'hide'}`}>
        <Rpc isCompact={isCompact} showIpc={showIpc} />
      </div>
      <div className={`devtool-container ${!isRpc ? 'show' : 'hide'}`}>
        <Ipc isCompact={isCompact} showRpc={showRpc} />
      </div>
    </div>
  );
};

export default Devtools;

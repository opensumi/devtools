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
      <div style={{ display: isRpc ? 'block' : 'none' }}>
        <Rpc isCompact={isCompact} showIpc={showIpc} />
      </div>
      <div style={{ display: !isRpc ? 'block' : 'none' }}>
        <Ipc isCompact={isCompact} showRpc={showRpc} />
      </div>
    </div>
  );
};

export default Devtools;

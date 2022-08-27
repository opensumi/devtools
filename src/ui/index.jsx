import React, { useState, useEffect, useRef } from 'react';
import Rpc from './Rpc/Rpc';
import Ipc from './Ipc/Ipc';

import './index.scss';

const Devtools = () => {
  const [isRpc, setIsRpc] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  const toggle = () => {
    setIsRpc(!isRpc);
    buttonRef.current.className = `devtool-toggle ${!isRpc ? 'rpc' : 'ipc'} moving`;
    setTimeout(() => {
      buttonRef.current.className = `devtool-toggle ${!isRpc ? 'rpc' : 'ipc'}`;
    }, 200);
  };

  const setCompactMode = () => {
    if (containerRef.current.offsetWidth < 700) {
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
      <button ref={buttonRef} className={`devtool-toggle rpc`} onClick={toggle}></button>
      <div className={`devtool-container ${isRpc ? 'show' : 'hide'}`}>
        <Rpc isCompact={isCompact} />
      </div>
      <div className={`devtool-container ${!isRpc ? 'show' : 'hide'}`}>
        <Ipc isCompact={isCompact} />
      </div>
    </div>
  );
};

export default Devtools;

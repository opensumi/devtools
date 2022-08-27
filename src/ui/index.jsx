import React, { useState, useEffect, useRef } from 'react';
import Rpc from './Rpc/Rpc';
import Ipc from './Ipc/Ipc';
import { checkElectron } from '../utils/checkElectron.js';

import './index.scss';

const WebDevtools = ({ isCompact, isElectron }) => {
  return <Rpc isCompact={isCompact} isElectron={isElectron} />;
};

const ElectronDevtools = ({ isCompact, isElectron }) => {
  const [isRpc, setIsRpc] = useState(true);
  const buttonRef = useRef(null);

  const toggle = () => {
    setIsRpc(!isRpc);
    buttonRef.current.className = `devtool-toggle ${!isRpc ? 'rpc' : 'ipc'} moving`;
    setTimeout(() => {
      buttonRef.current.className = `devtool-toggle ${!isRpc ? 'rpc' : 'ipc'}`;
    }, 200);
  };

  return (
    <div>
      <button ref={buttonRef} className={`devtool-toggle rpc`} onClick={toggle}></button>
      <div className={`devtool-container ${isRpc ? 'show' : 'hide'}`}>
        <Rpc isCompact={isCompact} isElectron={isElectron} />
      </div>
      <div className={`devtool-container ${!isRpc ? 'show' : 'hide'}`}>
        <Ipc isCompact={isCompact} />
      </div>
    </div>
  );
};

const Devtools = () => {
  const [isCompact, setIsCompact] = useState(false);
  const [isElectron, setIsElectron] = useState(null);
  const containerRef = useRef(null);

  const setCompactMode = () => {
    if (containerRef.current.offsetWidth < 700) {
      setIsCompact(true);
    } else {
      setIsCompact(false);
    }
  };

  useEffect(() => {
    checkElectron().then((isElectron) => {
      if (isElectron) {
        setIsElectron(true);
      } else {
        setIsElectron(false);
      }
    });
  }, []);

  useEffect(() => {
    setCompactMode();
    window.addEventListener('resize', setCompactMode);
  }, []);

  if (isElectron === null) {
    return <div ref={containerRef} />;
  }

  return (
    <div ref={containerRef}>
      {isElectron ? (
        <ElectronDevtools isCompact={isCompact} isElectron={isElectron} />
      ) : (
        <WebDevtools isCompact={isCompact} isElectron={isElectron} />
      )}
    </div>
  );
};

export default Devtools;

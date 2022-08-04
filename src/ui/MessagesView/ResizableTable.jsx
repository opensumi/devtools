import React, { useState, useCallback, useEffect, useRef } from 'react';
import './ResizableTable.scss';

const ResizableTable = ({ children }) => {
  const [tableHeight, setTableHeight] = useState('auto');
  const [handleStatus, setHandleStatus] = useState('idle');
  const tableElement = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);

  useEffect(() => {
    setTableHeight(tableElement.current.offsetHeight);
  }, []);

  const mouseDown = () => {
    setHandleStatus('active');
  };

  const mouseMove = useCallback((e) => {
    const col1Width = e.clientX - ref1.current.offsetLeft;
    const col2Width =
      ref1.current.offsetWidth + ref2.current.offsetWidth - col1Width;
    tableElement.current.style.gridTemplateColumns = `${col1Width}px ${col2Width}px`;
  }, []);

  const removeListeners = useCallback(() => {
    window.removeEventListener('mousemove', mouseMove);
    window.removeEventListener('mouseup', removeListeners);
  }, [mouseMove]);

  const mouseUp = useCallback(() => {
    setHandleStatus('idle');
    removeListeners();
  }, [setHandleStatus, removeListeners]);

  useEffect(() => {
    if (handleStatus === 'active') {
      window.addEventListener('mousemove', mouseMove);
      window.addEventListener('mouseup', mouseUp);
    }

    return () => {
      removeListeners();
    };
  }, [handleStatus, mouseMove, mouseUp, removeListeners]);

  return (
    <table className="rt-table" ref={tableElement}>
      <thead>
        <tr>
          <td ref={ref1}>
            {children[0]}
            <div
              style={{ height: tableHeight }}
              onMouseDown={() => mouseDown()}
              className={`rt-handle ${handleStatus}`}
            />
          </td>
          <td ref={ref2}>{children[1]}</td>
        </tr>
      </thead>
    </table>
  );
};

export default ResizableTable;

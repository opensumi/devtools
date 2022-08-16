import React, { useState, useCallback, useEffect, useRef } from 'react';
import './ResizableTable.scss';

const ResizableTable = ({ children }) => {
  const [tableHeight, setTableHeight] = useState('auto');
  const [handleStatus, setHandleStatus] = useState('idle');
  const tableElement = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);

  const arrangeColumns = (col1Width, col2Width) => {
    if (col2Width < 150) {
      col2Width = 150;
      col1Width = tableElement.current.offsetWidth - col2Width;
    }
    if (col1Width < 50) {
      col1Width = 50;
      col2Width = tableElement.current.offsetWidth - col1Width;
    }
    tableElement.current.style.gridTemplateColumns = `${col1Width}px ${col2Width}px`;
  };

  useEffect(() => {
    setTableHeight(tableElement.current.offsetHeight);
  }, []);

  const mouseDown = () => {
    setHandleStatus('active');
  };

  const mouseMove = useCallback((e) => {
    let col1Width = e.clientX - ref1.current.offsetLeft;
    let col2Width = tableElement.current.offsetWidth - col1Width;
    arrangeColumns(col1Width, col2Width);
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

  const onResize = useCallback(() => {
    const col1Width = ref1.current.offsetWidth;
    const col2Width = ref2.current.offsetWidth;
    const tableWidth = tableElement.current.offsetWidth;
    let newCol1Width = (col1Width / (col1Width + col2Width)) * tableWidth;
    let newCol2Width = tableWidth - newCol1Width;

    arrangeColumns(newCol1Width, newCol2Width);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', onResize);
  }, [onResize]);

  return (
    <table className="rt-table" ref={tableElement}>
      <thead>
        <tr>
          <td id="rt-td1" ref={ref1}>
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

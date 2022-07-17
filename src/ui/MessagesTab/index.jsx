import React, { useState, useEffect, useRef } from 'react';
import { startCapturing, stopCapturing, getMessages } from '../../capturer';
import DataGrid from 'react-data-grid';

const INTERVAL = 500;

const commonColumnProperties = {
  resizable: true,
  sortable: true,
  filterable: true,
};

const columns = [
  { key: 'id', name: 'ID', width: 50, frozen: true },
  { key: 'time', name: 'Time', width: 150, frozen: true },
  { key: 'message', name: 'Message' },
].map((c) => ({ ...c, ...commonColumnProperties }));

const MessagesTab = () => {
  const [capturing, setCapturing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [timer, setTimer] = useState(null);
  const [bottomRow, setBottomRow] = useState(-1);
  const [autoScroll, setAutoScroll] = useState(true);

  const gridRef = useRef(null);

  useEffect(() => {
    gridRef.current && autoScroll && gridRef.current.scrollToRow(bottomRow);
  }, [autoScroll, bottomRow]);

  const toggleAutoScroll = () => {
    setAutoScroll(!autoScroll);
  };

  const addMessages = () => {
    getMessages()
      .then((newMessages) => {
        setMessages((oldMessages) => [...oldMessages, ...newMessages]);
        if (newMessages.length > 0) {
          setBottomRow((oldBottomRow) => oldBottomRow + newMessages.length);
        }
      })
      .catch((error) => {
        console.error('Getting messages failed!');
        console.error(error.stack || error);
      });
  };

  const toggleCapturing = () => {
    if (capturing === true) {
      stopCapturing()
        .then(() => {
          setCapturing(false);
          clearInterval(timer);
          setTimer(null);
        })
        .catch((error) => {
          console.error('Stoping capturing failed!');
          console.error(error.stack || error);
        });
    } else {
      startCapturing()
        .then(() => {
          setCapturing(true);
          setTimer(setInterval(() => addMessages(), INTERVAL));
        })
        .catch((error) => {
          console.error('Starting capturing failed!');
          console.error(error.stack || error);
        });
    }
  };

  return (
    <div>
      <button onClick={toggleCapturing}>toggleCapturing</button>
      <button onClick={toggleAutoScroll}>toggleAutoScroll</button>

      <DataGrid
        style={{ fontSize: '10px', height: 'calc(100vh - 78px' }}
        ref={gridRef}
        columns={columns}
        rows={messages.map((msg, index) => {
          return {
            id: index,
            time: msg.time,
            message: msg.msg,
          };
        })}
        rowKeyGetter={(row) => row.id}
        headerRowHeight={30}
        rowHeight={20}
      />
    </div>
  );
};

export default MessagesTab;

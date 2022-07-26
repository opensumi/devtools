import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from 'react';
import DataGrid from 'react-data-grid';
import { startCapturing, stopCapturing, getMessages } from '../../capturer';
import { useFocusRef } from './useFocusRef';
import './MessagesTab.scss';

const INTERVAL = 500;

const serviceMethodSplit = (serviceMethod) => {
  if (serviceMethod.startsWith('on')) {
    serviceMethod = serviceMethod.slice(3);
  }
  return serviceMethod.split(':');
};

const inputStopPropagation = (event) => {
  if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.stopPropagation();
  }
};

const FilterContext = createContext(undefined);

const FilterRenderer = ({ isCellSelected, column, children }) => {
  const filters = useContext(FilterContext);
  const { ref, tabIndex } = useFocusRef(isCellSelected);

  return (
    <>
      <div>{column.name}</div>
      {filters.enabled && <div>{children({ ref, tabIndex, filters })}</div>}
    </>
  );
};

const MessagesTab = () => {
  const [capturing, setCapturing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [bottomRow, setBottomRow] = useState(-1);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filters, setFilters] = useState({
    send: '',
    receive: '',
    enabled: false,
  });

  const timer = useRef(null);
  const gridRef = useRef(null);

  const commonColumnProperties = useMemo(
    () => ({
      resizable: true,
    }),
    []
  );

  const columns = useMemo(() => {
    return [
      {
        key: 'id',
        name: 'ID',
        minWidth: 40,
        width: 50,
        frozen: true,
      },
      {
        key: 'time',
        name: 'Time',
        minWidth: 75,
        width: 75,
        frozen: true,
      },
      {
        key: 'type',
        name: 'Type',
        minWidth: 40,
        width: 50,
        frozen: true,
      },
      {
        key: 'service',
        name: 'Service',
        width: 100,
        frozen: true,
      },
      {
        key: 'method',
        name: 'Method',
        width: 100,
        frozen: true,
      },
      {
        key: 'send',
        name: 'Send',
        headerCellClass: 'filter-cell',
        headerRenderer: (p) => (
          <FilterRenderer {...p}>
            {({ filters, ...rest }) => (
              <input
                {...rest}
                className="filter"
                value={filters.send}
                onChange={(e) => {
                  setFilters({ ...filters, send: e.target.value });
                }}
                onKeyDown={inputStopPropagation}
              />
            )}
          </FilterRenderer>
        ),
      },
      {
        key: 'receive',
        name: 'Receive',
        headerCellClass: 'filter-cell',
        headerRenderer: (p) => (
          <FilterRenderer {...p}>
            {({ filters, ...rest }) => (
              <input
                {...rest}
                className="filter"
                value={filters.receive}
                onChange={(e) => {
                  setFilters({ ...filters, receive: e.target.value });
                }}
                onKeyDown={inputStopPropagation}
              />
            )}
          </FilterRenderer>
        ),
      },
    ].map((c) => ({ ...c, ...commonColumnProperties }));
  }, [commonColumnProperties]);

  // run if autoScroll or bottomRow changes
  useEffect(() => {
    gridRef.current && autoScroll && gridRef.current.scrollToRow(bottomRow);
  }, [autoScroll, bottomRow]);

  const addMessages = () => {
    getMessages()
      .then((newRawMessages) => {
        const newMessages = [];
        setMessages((messages) => {
          // if new message is requestResult, the corresponding sendRequest row should be updated
          const updatedMessages = messages.concat();

          newRawMessages.forEach((message) => {
            const msg = {
              time: message.time,
              type: message.type,
            };

            let serviceMethodSplitResult;
            if (message.serviceMethod) {
              serviceMethodSplitResult = serviceMethodSplit(
                message.serviceMethod
              );
            }

            if (msg.type === 'sendNotification') {
              msg.type = '↑';
              msg.service = serviceMethodSplitResult[0];
              msg.method = serviceMethodSplitResult[1];
              msg.send = JSON.stringify(...message.arguments);
            } else if (msg.type === 'sendRequest') {
              msg.type = '↑↓';
              msg.requestId = message.requestId;
              msg.service = serviceMethodSplitResult[0];
              msg.method = serviceMethodSplitResult[1];
              msg.send = JSON.stringify(...message.arguments);
            } else if (msg.type === 'requestResult') {
              msg.type = '↑↓';
              msg.requestId = message.requestId;
              msg.status = message.status;
              if (msg.status === 'success') {
                msg.receive = JSON.stringify(message.data);
              } else if (msg.status === 'fail') {
                msg.receive = JSON.stringify(message.error);
              }
            } else if (msg.type === 'onNotification') {
              msg.type = '↓';
              msg.service = serviceMethodSplitResult[0];
              msg.method = serviceMethodSplitResult[1];
              msg.receive = JSON.stringify(...message.arguments);
            } else if (msg.type === 'onRequest') {
              msg.type = '↓';
              msg.service = serviceMethodSplitResult[0];
              msg.method = serviceMethodSplitResult[1];
              msg.status = message.status;
              if (msg.status === 'success') {
                msg.receive = JSON.stringify(...message.arguments);
              } else if (msg.status === 'fail') {
                msg.receive = 'The requested method is not registered!';
              }
            }

            if (msg.type !== '↑↓') {
              newMessages.push(msg);
            } else {
              // merge requestResult row into corresponding sendRequest row
              let isCorrespondingRowInNewMessages = false;
              let isCorrespondingRowInMessages = false;

              for (let i = newMessages.length - 1; i >= 0; i--) {
                if (newMessages[i].type === '↑↓') {
                  if (newMessages[i].requestId === msg.requestId) {
                    newMessages[i].receive = msg.receive;
                    isCorrespondingRowInNewMessages = true;
                    break;
                  }
                }
              }

              if (!isCorrespondingRowInNewMessages) {
                for (let i = messages.length - 1; i >= 0; i--) {
                  if (messages[i].type === '↑↓') {
                    if (messages[i].requestId === msg.requestId) {
                      updatedMessages[i] = structuredClone(messages[i]);
                      updatedMessages[i].receive = msg.receive;
                      isCorrespondingRowInMessages = true;
                      break;
                    }
                  }
                }
              }

              // corresponding sendRequest raw was cleared
              if (!isCorrespondingRowInNewMessages && !isCorrespondingRowInMessages) {
                newMessages.push(msg);
              }
            }
          });

          return [...updatedMessages, ...newMessages];
        });

        if (newMessages.length > 0) {
          setBottomRow((oldBottomRow) => oldBottomRow + newMessages.length);
        }
      })
      .catch((error) => {
        console.error('Getting messages failed!');
        console.error(error.stack || error);
      });
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const filteredRows = useMemo(() => {
    return messages
      .map((msg, index) => {
        msg.id = index;
        return msg;
      })
      .filter((r) => {
        return (
          (filters.send ? r.send && r.send.includes(filters.send) : true) &&
          (filters.receive ? r.receive && r.receive.includes(filters.receive) : true)
        );
      });
  }, [messages, filters]);

  const toggleCapturing = () => {
    if (capturing === true) {
      stopCapturing()
        .then(() => {
          setCapturing(false);
          clearInterval(timer.current);
          timer.current = null;
        })
        .catch((error) => {
          console.error('Stoping capturing failed!');
          console.error(error.stack || error);
        });
    } else {
      startCapturing()
        .then(() => {
          setCapturing(true);
          timer.current = setInterval(() => addMessages(), INTERVAL);
        })
        .catch((error) => {
          console.error('Starting capturing failed!');
          console.error(error.stack || error);
        });
    }
  };

  const toggleAutoScroll = () => {
    setAutoScroll(!autoScroll);
  };

  const toggleFilters = () => {
    setFilters((filters) => ({
      ...filters,
      enabled: !filters.enabled,
    }));
  };

  const clearFilters = () => {
    setFilters({
      send: '',
      receive: '',
      enabled: true,
    });
  };

  return (
    <div>
      <div className="tool-bar">
        <button onClick={toggleCapturing}>toggleCapturing</button>
        <button onClick={clearMessages}>clearMessages</button>
        <button onClick={toggleAutoScroll}>toggleAutoScroll</button>
        <button onClick={toggleFilters}>toggleFilters</button>
        <button onClick={clearFilters}>clearFilters</button>
      </div>
      <FilterContext.Provider value={filters}>
        <DataGrid
          className={filters.enabled ? 'filter-container' : undefined}
          style={{ fontSize: '10px', height: 'calc(100vh - 81px' }}
          ref={gridRef}
          columns={columns}
          rows={filteredRows}
          rowKeyGetter={(row) => row.id}
          headerRowHeight={filters.enabled ? 60 : 30}
          rowHeight={20}
        />
      </FilterContext.Provider>
    </div>
  );
};

export default MessagesTab;

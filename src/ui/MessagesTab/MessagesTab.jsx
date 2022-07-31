import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  createContext,
  useContext,
} from 'react';
import DataGrid from 'react-data-grid';
import { startCapturing, stopCapturing, getMessages } from '../../capturer';
import { useFocusRef } from './useFocusRef';
import { updateMessages } from './messagesHelper';
import './MessagesTab.scss';

const INTERVAL = 500;

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
        let newMessagesLength = 0;

        setMessages((oldMessages) => {
          const { updatedMessages, newMessages } = updateMessages(
            oldMessages,
            newRawMessages
          );
          newMessagesLength = newMessages.length;
          return [...updatedMessages, ...newMessages];
        });

        if (newMessagesLength > 0) {
          setBottomRow((oldBottomRow) => oldBottomRow + newMessagesLength);
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
          (filters.receive
            ? r.receive && r.receive.includes(filters.receive)
            : true)
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
      <div className="toolbar">
        <button
          className={`toolbar-button ${capturing ? 'active' : ''}`}
          onClick={toggleCapturing}
        >
          <span className="toolbar-icon icon-record"></span>
          Capture
        </button>
        <button className="toolbar-button" onClick={clearMessages}>
          <span className="toolbar-icon icon-clear"></span>
          Clear
        </button>
        <button
          className={`toolbar-button ${autoScroll ? 'active' : ''}`}
          onClick={toggleAutoScroll}
        >
          <span className="toolbar-icon icon-bottom"></span>
          Scroll
        </button>
        <button
          className={`toolbar-button ${filters.enabled ? 'active' : ''}`}
          onClick={toggleFilters}
        >
          <span className="toolbar-icon icon-filter"></span>
          Filters
        </button>
        <button className="toolbar-button" onClick={clearFilters}>
          <span className="toolbar-icon icon-reset"></span>
          Reset Filters
        </button>
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

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
  const [timer, setTimer] = useState(null);
  const [bottomRow, setBottomRow] = useState(-1);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filters, setFilters] = useState({
    subString: '',
    enabled: false,
  });

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
        width: 135,
        frozen: true,
      },
      {
        key: 'message',
        name: 'Message',
        headerCellClass: 'filter-cell',
        headerRenderer: (p) => (
          <FilterRenderer {...p}>
            {({ filters, ...rest }) => (
              <input
                {...rest}
                className="filter"
                value={filters.subString}
                onChange={(e) => {
                  setFilters({ ...filters, subString: e.target.value });
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

  const clearMessages = () => {
    setMessages([]);
  };

  const filteredRows = useMemo(() => {
    return messages
      .map((msg, index) => {
        return {
          id: index,
          time: msg.time,
          message: msg.msg,
        };
      })
      .filter((r) => {
        return filters.subString ? r.message.includes(filters.subString) : true;
      });
  }, [messages, filters]);

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
      subString: '',
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

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  createContext,
} from 'react';
import DataGrid from 'react-data-grid';
import { startCapturing, stopCapturing, getMessages } from '../../capturer';
import { updateMessages } from './messagesHelper';
import { generateColumns } from './columnsHelper';
import './MessagesTab.scss';

const INTERVAL = 500;

const FilterContext = createContext(undefined);

const MessagesTab = () => {
  const [capturing, setCapturing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [bottomRow, setBottomRow] = useState(-1);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    service: '',
    method: '',
    send: '',
    receive: '',
    enabled: false,
  });
  const [services, setServices] = useState([]); // all kinds of services in messages
  const [methods, setMethods] = useState([]); // all kinds of methods in messages

  const timer = useRef(null);
  const gridRef = useRef(null);
  const servicesRef = useRef(new Set()); // we need ref to get old values in all renders
  const methodsRef = useRef(new Set());

  // run if autoScroll or bottomRow changes
  useEffect(() => {
    gridRef.current && autoScroll && gridRef.current.scrollToRow(bottomRow);
  }, [autoScroll, bottomRow]);

  // it is not very elegent to use two variables to store same thing
  // but can prevent unnecessary render that will disrupt users when
  // they are selecting options from <select>
  if (services.length !== servicesRef.current.size) {
    setServices(Array.from(servicesRef.current));
  }
  if (methods.length !== methodsRef.current.size) {
    setMethods(Array.from(methodsRef.current));
  }

  const columns = useMemo(() => {
    return generateColumns(FilterContext, setFilters, services, methods);
  }, [setFilters, services, methods]);

  const filteredRows = useMemo(() => {
    return messages
      .map((msg, index) => {
        msg.id = index;
        return msg;
      })
      .filter((r) => {
        return (
          (filters.type ? r.type && r.type === filters.type : true) &&
          (filters.service
            ? r.service && r.service === filters.service
            : true) &&
          (filters.method ? r.method && r.method === filters.method : true) &&
          (filters.send ? r.send && r.send.includes(filters.send) : true) &&
          (filters.receive
            ? r.receive && r.receive.includes(filters.receive)
            : true)
        );
      });
  }, [messages, filters]);

  const addMessages = () => {
    getMessages()
      .then((newRawMessages) => {
        let newMsgs = [];

        // since addMessages is called from setInterval, if we read messages
        // directly we will always get an empty array. use setMessages to get
        // the latest messages (oldMessages) instead.
        setMessages((oldMessages) => {
          const { updatedMessages, newMessages } = updateMessages(
            oldMessages,
            newRawMessages
          );
          newMsgs = newMessages;
          return [...updatedMessages, ...newMessages];
        });

        if (newMsgs.length > 0) {
          // add to filter options set
          newMsgs.forEach((msg) => {
            servicesRef.current.add(msg.service);
            methodsRef.current.add(msg.method);
          });

          // for auto scroll
          setBottomRow((oldBottomRow) => oldBottomRow + newMsgs.length);
        }
      })
      .catch((error) => {
        console.error('Getting messages failed!');
        console.error(error.stack || error);
      });
  };

  const clearMessages = () => {
    setMessages([]);
    // should also clear filter options
    setServices([]);
    setMethods([]);
    servicesRef.current.clear();
    methodsRef.current.clear();
  };

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
      type: '',
      service: '',
      method: '',
      send: '',
      receive: '',
      enabled: filters.enabled ? true : false,
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
          className={`rdg-light ${
            filters.enabled ? 'filter-container' : undefined
          }`}
          style={{ fontSize: '10px', height: 'calc(100vh - 40px' }}
          ref={gridRef}
          columns={columns}
          rows={filteredRows}
          rowKeyGetter={(row) => row.id}
          headerRowHeight={filters.enabled ? 52 : 25}
          rowHeight={20}
        />
      </FilterContext.Provider>
    </div>
  );
};

export default MessagesTab;

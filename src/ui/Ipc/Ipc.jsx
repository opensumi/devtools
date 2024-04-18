import React, { useState, useEffect, useRef, useMemo, createContext } from 'react';
import ResizableTable from '../ResizableTable/ResizableTable';
import 'react-data-grid/lib/styles.css';
import DataGrid from 'react-data-grid';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import JsonView from 'react-json-view';
import NoMessageSelected from '../NoMessageSelected/NoMessageSelected';
import { generateColumns } from './rdgHelper';
import { startCapturingIpc, stopCapturingIpc, getIpcMessages } from '../../capturer/ipc';
import { updateMessages, getParsedMessage } from './messageHelper';

import './Ipc.scss';
import '../react-tabs.scss';

const INTERVAL = 1000;

const FilterContext = createContext(undefined);

const Ipc = ({ isCompact }) => {
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
  const [selectedRow, setSelectedRow] = useState();

  const timer = useRef(null);
  const gridRef = useRef(null);
  const servicesRef = useRef(new Set()); // we need ref to get old values in all renders
  const methodsRef = useRef(new Set());

  useEffect(() => {
    toggleCapturing();
  }, []);

  // run if autoScroll or bottomRow changes
  useEffect(() => {
    gridRef.current && autoScroll && gridRef.current.scrollToCell({ rowIdx: bottomRow });
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
          (filters.service ? r.service && r.service === filters.service : true) &&
          (filters.method ? r.method && r.method === filters.method : true) &&
          (filters.send ? r.send && r.send.includes(filters.send) : true) &&
          (filters.receive ? r.receive && r.receive.includes(filters.receive) : true)
        );
      });
  }, [messages, filters]);

  const addMessages = () => {
    getIpcMessages()
      .then((newRawMessages) => {
        let newMsgs = [];

        // since addMessages is called from setInterval, if we read messages
        // directly we will always get an empty array. use setMessages to get
        // the latest messages (oldMessages) instead.
        setMessages((oldMessages) => {
          const { updatedMessages, newMessages } = updateMessages(oldMessages, newRawMessages);
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
    setSelectedRow(null);
  };

  const toggleCapturing = () => {
    if (capturing === true) {
      stopCapturingIpc()
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
      startCapturingIpc()
        .then(() => {
          setCapturing(true);
          timer.current = setInterval(() => {
            addMessages();
          }, INTERVAL);
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

  const rjvStyles = {
    height: 'calc(100vh - 60px)',
    overflow: 'auto',
    fontSize: '12px',
  };

  return (
    <div>
      <div className='statbar'>
        <div className='toolbar electron'>
          <button className={`ipc-toolbar-button ${capturing ? 'active' : ''}`} onClick={toggleCapturing}>
            <span className='toolbar-icon ipc-icon-record'></span>
            {isCompact ? null : <span className='toolbar-text'>Capture</span>}
          </button>
          <button className='ipc-toolbar-button' onClick={clearMessages}>
            <span className='toolbar-icon ipc-icon-clear'></span>
            {isCompact ? null : <span className='toolbar-text'>Clear</span>}
          </button>
          <button className={`ipc-toolbar-button ${autoScroll ? 'active' : ''}`} onClick={toggleAutoScroll}>
            <span className='toolbar-icon ipc-icon-bottom'></span>
            {isCompact ? null : <span className='toolbar-text'>Scroll</span>}
          </button>
          <button className={`ipc-toolbar-button ${filters.enabled ? 'active' : ''}`} onClick={toggleFilters}>
            <span className='toolbar-icon ipc-icon-filter'></span>
            {isCompact ? null : <span className='toolbar-text'>Filters</span>}
          </button>
          <button className='ipc-toolbar-button' onClick={clearFilters}>
            <span className='toolbar-icon ipc-icon-reset'></span>
            {isCompact ? null : <span className='toolbar-text'>Reset Filters</span>}
          </button>
        </div>
      </div>
      <ResizableTable>
        <FilterContext.Provider value={filters}>
          <DataGrid
            className={`rdg-light ${filters.enabled ? 'filter-container' : undefined}`}
            style={{ height: 'calc(100vh - 30px)' }}
            ref={gridRef}
            columns={columns}
            rows={filteredRows}
            rowKeyGetter={(row) => row.id}
            headerRowHeight={filters.enabled ? 52 : 25}
            rowHeight={20}
            onRowClick={(row) => {
              setSelectedRow(row);
            }}
          />
        </FilterContext.Provider>
        <div>
          <Tabs forceRenderTabPanel={true}>
            <TabList>
              <Tab>Send</Tab>
              <Tab>Receive</Tab>
            </TabList>

            <TabPanel>
              {selectedRow ? (
                <JsonView
                  style={rjvStyles}
                  src={getParsedMessage(selectedRow, 'send')}
                  name={false}
                  collapsed={1}
                  displayDataTypes={false}
                  enableClipboard={false}
                />
              ) : (
                <NoMessageSelected />
              )}
            </TabPanel>
            <TabPanel>
              {selectedRow ? (
                <JsonView
                  style={rjvStyles}
                  src={getParsedMessage(selectedRow, 'receive')}
                  name={false}
                  collapsed={1}
                  displayDataTypes={false}
                  enableClipboard={false}
                />
              ) : (
                <NoMessageSelected />
              )}
            </TabPanel>
          </Tabs>
        </div>
      </ResizableTable>
    </div>
  );
};

export default Ipc;

import React, { useState, useEffect, useRef, useMemo, createContext } from 'react';
import ResizableTable from '../ResizableTable/ResizableTable';
import NetSpeed from '../NetSpeed/NetSpeed';
import NetLatency from '../NetLatency/NetLatency';
import DataGrid from 'react-data-grid';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import JsonView from 'react-json-view';
import NoMessageSelected from '../NoMessageSelected/NoMessageSelected';
import { generateColumns } from './rdgHelper';
import { startCapturing, stopCapturing, getMessages, getLatency } from '../../capturer/rpc';
import { updateMessages, getParsedMessage } from './messageHelper';

import './Rpc.scss';
import '../react-tabs.scss';

const INTERVAL = 1000;

const FilterContext = createContext(undefined);

const Rpc = ({ isCompact }) => {
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
  const [shouldParseExtProtocol, setShouldParseExtProtocol] = useState(false);
  const [netspeed, setNetspeed] = useState({
    send: 0, // the unit is bytes/s
    receive: 0,
  });
  const [latency, setLatency] = useState(null);

  const timer = useRef(null);
  const gridRef = useRef(null);
  const servicesRef = useRef(new Set()); // we need ref to get old values in all renders
  const methodsRef = useRef(new Set());

  useEffect(() => {
    toggleCapturing();
  }, []);

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
          (filters.service ? r.service && r.service === filters.service : true) &&
          (filters.method ? r.method && r.method === filters.method : true) &&
          (filters.send ? r.send && r.send.includes(filters.send) : true) &&
          (filters.receive ? r.receive && r.receive.includes(filters.receive) : true)
        );
      });
  }, [messages, filters]);

  const addMessages = () => {
    getMessages()
      .then((newRawMessages) => {
        let newMsgs = [];
        let newSendBytes = 0;
        let newReceiveBytes = 0;

        // since addMessages is called from setInterval, if we read messages
        // directly we will always get an empty array. use setMessages to get
        // the latest messages (oldMessages) instead.
        setMessages((oldMessages) => {
          const { updatedMessages, newMessages, sendBytes, receiveBytes } = updateMessages(oldMessages, newRawMessages);
          newMsgs = newMessages;
          newSendBytes = sendBytes;
          newReceiveBytes = receiveBytes;
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

        // caculate net speed
        setNetspeed({
          send: newSendBytes / (INTERVAL / 1000),
          receive: newReceiveBytes / (INTERVAL / 1000),
        });
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

  const updateLatency = () => {
    getLatency()
      .then((latency) => {
        setLatency(latency);
      })
      .catch((error) => {
        console.error('Getting latency failed!');
        console.error(error.stack || error);
      });
  };

  const toggleCapturing = () => {
    if (capturing === true) {
      stopCapturing()
        .then(() => {
          setCapturing(false);
          clearInterval(timer.current);
          timer.current = null;
          setNetspeed({
            send: 0,
            receive: 0,
          });
          setLatency(null);
        })
        .catch((error) => {
          console.error('Stoping capturing failed!');
          console.error(error.stack || error);
        });
    } else {
      startCapturing()
        .then(() => {
          setCapturing(true);
          timer.current = setInterval(() => {
            addMessages();
            updateLatency();
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

  const toggleShouldParseExtProtocol = () => {
    setShouldParseExtProtocol(!shouldParseExtProtocol);
  };

  const rjvStyles = {
    height: 'calc(100vh - 60px)',
    overflow: 'auto',
    fontSize: '12px',
  };

  return (
    <div>
      <div className='statbar'>
        <div className='toolbar'>
          <button className={`toolbar-button ${capturing ? 'active' : ''}`} onClick={toggleCapturing}>
            <span className='toolbar-icon icon-record'></span>
            {isCompact ? null : <span className='toolbar-text'>Capture</span>}
          </button>
          <button className='toolbar-button' onClick={clearMessages}>
            <span className='toolbar-icon icon-clear'></span>
            {isCompact ? null : <span className='toolbar-text'>Clear</span>}
          </button>
          <button className={`toolbar-button ${autoScroll ? 'active' : ''}`} onClick={toggleAutoScroll}>
            <span className='toolbar-icon icon-bottom'></span>
            {isCompact ? null : <span className='toolbar-text'>Scroll</span>}
          </button>
          <button className={`toolbar-button ${filters.enabled ? 'active' : ''}`} onClick={toggleFilters}>
            <span className='toolbar-icon icon-filter'></span>
            {isCompact ? null : <span className='toolbar-text'>Filters</span>}
          </button>
          <button className='toolbar-button' onClick={clearFilters}>
            <span className='toolbar-icon icon-reset'></span>
            {isCompact ? null : <span className='toolbar-text'>Reset Filters</span>}
          </button>
          <button
            className={`toolbar-button ${shouldParseExtProtocol ? 'active' : ''}`}
            onClick={toggleShouldParseExtProtocol}
          >
            <span className='toolbar-icon icon-braces'></span>
            {isCompact ? null : <span className='toolbar-text'>Parse ExtProtocol</span>}
          </button>
        </div>
        <div className='netbar'>
          <NetSpeed capturing={capturing} upload={netspeed.send} download={netspeed.receive} />
          <NetLatency capturing={capturing} latency={latency} />
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
                  src={getParsedMessage(selectedRow, 'send', shouldParseExtProtocol)}
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
                  src={getParsedMessage(selectedRow, 'receive', shouldParseExtProtocol)}
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

export default Rpc;

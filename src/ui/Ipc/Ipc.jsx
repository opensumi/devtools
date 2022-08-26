import React, { useState, useEffect, useRef, useMemo, createContext } from 'react';
import ResizableTable from '../ResizableTable/ResizableTable';
import DataGrid from 'react-data-grid';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import JsonView from 'react-json-view';
import NoMessageSelected from '../NoMessageSelected/NoMessageSelected';
import { generateColumns } from './rdgHelper';
import { startCapturingIpc, stopCapturingIpc, getIpcMessages } from '../../capturer/ipc';

import './Ipc.scss';
import '../react-tabs.scss';

const INTERVAL = 1000;

const FilterContext = createContext(undefined);

const Ipc = () => {
  const [capturing, setCapturing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [bottomRow, setBottomRow] = useState(-1);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filters, setFilters] = useState({
    ipcMethod: '',
    channel: '',
    arguments: '',
    enabled: false,
  });
  const [channels, setChannels] = useState([]); // all channels in messages
  const [selectedRow, setSelectedRow] = useState();
  const [isCompact, setIsCompact] = useState(false);

  const timer = useRef(null);
  const statbarRef = useRef(null);
  const gridRef = useRef(null);
  const channelsRef = useRef(new Set()); // we need ref to get old values in all renders

  const setCompactMode = () => {
    if (statbarRef.current.offsetWidth < 600) {
      setIsCompact(true);
    } else {
      setIsCompact(false);
    }
  };

  useEffect(() => {
    setCompactMode();
    window.addEventListener('resize', setCompactMode);
    toggleCapturing();
  }, []);

  // run if autoScroll or bottomRow changes
  useEffect(() => {
    gridRef.current && autoScroll && gridRef.current.scrollToRow(bottomRow);
  }, [autoScroll, bottomRow]);

  // it is not very elegent to use two variables to store same thing
  // but can prevent unnecessary render that will disrupt users when
  // they are selecting options from <select>
  if (channels.length !== channelsRef.current.size) {
    setChannels(Array.from(channelsRef.current));
  }

  const columns = useMemo(() => {
    return generateColumns(FilterContext, setFilters, channels);
  }, [setFilters, channels]);

  const filteredRows = useMemo(() => {
    return messages
      .map((msg, index) => {
        msg.id = index;
        return msg;
      })
      .filter((r) => {
        return (
          (filters.ipcMethod ? r.ipcMethod && r.ipcMethod === filters.ipcMethod : true) &&
          (filters.channel ? r.channel && r.channel === filters.channel : true) &&
          (filters.arguments ? r.arguments && r.arguments.includes(filters.arguments) : true)
        );
      });
  }, [messages, filters]);

  const addMessages = () => {
    getIpcMessages()
      .then((messages) => {
        const newMessages = messages.map((message) => {
          return {
            time: message.time,
            ipcMethod: message.ipcMethod,
            channel: message.channel,
            arguments: JSON.stringify(message.arguments),
          };
        });

        // since addMessages is called from setInterval, if we read messages
        // directly we will always get an empty array. use setMessages to get
        // the latest messages (oldMessages) instead.
        setMessages((oldMessages) => {
          return [...oldMessages, ...newMessages];
        });

        if (messages.length > 0) {
          // add to filter options set
          messages.forEach((msg) => {
            channelsRef.current.add(msg.channel);
          });

          // for auto scroll
          setBottomRow((oldBottomRow) => oldBottomRow + messages.length);
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
    setChannels([]);
    channelsRef.current.clear();
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
      ipcMethod: '',
      channel: '',
      arguments: '',
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
      <div ref={statbarRef} className='statbar'>
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
              <Tab>Arguments</Tab>
            </TabList>

            <TabPanel>
              {selectedRow ? (
                <JsonView
                  style={rjvStyles}
                  src={JSON.parse(selectedRow.arguments)}
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

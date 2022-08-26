import React, { useContext } from 'react';
import { useFocusRef } from '../useFocusRef';

const inputStopPropagation = (event) => {
  if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.stopPropagation();
  }
};

const commonColumnProperties = {
  resizable: true,
};

const generateColumns = (FilterContext, setFilters, channels) => {
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

  return [
    {
      key: 'id',
      name: 'ID',
      minWidth: 40,
      width: 50,
      cellClass: 'rdg-body-cell',
      headerCellClass: 'rdg-header-cell',
      frozen: true,
    },
    {
      key: 'time',
      name: 'Time',
      minWidth: 75,
      width: 75,
      cellClass: 'rdg-body-cell',
      headerCellClass: 'rdg-header-cell',
    },
    {
      key: 'ipcMethod',
      name: 'IPC Method',
      minWidth: 100,
      width: 150,
      cellClass: 'rdg-body-cell',
      headerCellClass: 'rdg-header-cell filter-cell',
      headerRenderer: (p) => (
        <FilterRenderer {...p}>
          {({ filters, ...rest }) => (
            <select
              {...rest}
              className='filter'
              value={filters.ipcMethod}
              onChange={(e) => {
                setFilters({ ...filters, ipcMethod: e.target.value });
              }}
            >
              <option value=''>All</option>
              <option value='ipcMain.on'>ipcMain.on</option>
              <option value='ipcMain.handle'>ipcMain.handle</option>
              <option value='ipcRenderer.on'>ipcRenderer.on</option>
              <option value='ipcRenderer.send'>ipcRenderer.send</option>
              <option value='ipcRenderer.sendSync'>ipcRenderer.sendSync</option>
              <option value='ipcRenderer.invoke'>ipcRenderer.invoke</option>
            </select>
          )}
        </FilterRenderer>
      ),
    },
    {
      key: 'channel',
      name: 'Channel',
      width: 250,
      cellClass: 'rdg-body-cell',
      headerCellClass: 'rdg-header-cell filter-cell',
      headerRenderer: (p) => (
        <FilterRenderer {...p}>
          {({ filters, ...rest }) => (
            <select
              {...rest}
              className='filter'
              value={filters.channel}
              onChange={(e) => {
                setFilters({ ...filters, channel: e.target.value });
              }}
            >
              <option value=''>All</option>
              {Array.from(channels)
                .sort()
                .map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
            </select>
          )}
        </FilterRenderer>
      ),
    },
    {
      key: 'arguments',
      name: 'Arguments',
      cellClass: 'rdg-body-cell',
      headerCellClass: 'rdg-header-cell filter-cell',
      headerRenderer: (p) => (
        <FilterRenderer {...p}>
          {({ filters, ...rest }) => (
            <input
              {...rest}
              className='filter'
              value={filters.arguments}
              onChange={(e) => {
                setFilters({ ...filters, arguments: e.target.value });
              }}
              onKeyDown={inputStopPropagation}
            />
          )}
        </FilterRenderer>
      ),
    },
  ].map((c) => ({ ...c, ...commonColumnProperties }));
};

export { generateColumns };

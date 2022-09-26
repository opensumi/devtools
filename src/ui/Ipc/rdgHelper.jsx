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
      key: 'type',
      name: 'Type',
      minWidth: 40,
      width: 50,
      cellClass: 'rdg-body-cell column-type',
      headerCellClass: 'rdg-header-cell filter-cell',
      headerRenderer: (p) => (
        <FilterRenderer {...p}>
          {({ filters, ...rest }) => (
            <select
              {...rest}
              className='filter'
              value={filters.type}
              onChange={(e) => {
                setFilters({ ...filters, type: e.target.value });
              }}
            >
              <option value=''>All</option>
              <option value='↑'>↑</option>
              <option value='↓'>↓</option>
              <option value='↑↓'>↑↓</option>
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
      key: 'send',
      name: 'Send',
      cellClass: 'rdg-body-cell',
      headerCellClass: 'rdg-header-cell filter-cell',
      headerRenderer: (p) => (
        <FilterRenderer {...p}>
          {({ filters, ...rest }) => (
            <input
              {...rest}
              className='filter'
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
      cellClass: 'rdg-body-cell',
      headerCellClass: 'rdg-header-cell filter-cell',
      headerRenderer: (p) => (
        <FilterRenderer {...p}>
          {({ filters, ...rest }) => (
            <input
              {...rest}
              className='filter'
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
};

export { generateColumns };

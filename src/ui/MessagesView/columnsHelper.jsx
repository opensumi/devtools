import React, { useContext } from 'react';
import { useFocusRef } from './useFocusRef';

const inputStopPropagation = (event) => {
  if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.stopPropagation();
  }
};

const commonColumnProperties = {
  resizable: true,
};

const generateColumns = (FilterContext, setFilters, services, methods) => {
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
      frozen: true,
    },
    {
      key: 'time',
      name: 'Time',
      minWidth: 75,
      width: 75,
    },
    {
      key: 'type',
      name: 'Type',
      minWidth: 40,
      width: 50,
      headerCellClass: 'filter-cell',
      headerRenderer: (p) => (
        <FilterRenderer {...p}>
          {({ filters, ...rest }) => (
            <select
              {...rest}
              className="filter"
              value={filters.type}
              onChange={(e) => {
                setFilters({ ...filters, type: e.target.value });
              }}
            >
              <option value="">All</option>
              <option value="↑">↑</option>
              <option value="↓">↓</option>
              <option value="↑↓">↑↓</option>
              <option value="↓↑">↓↑</option>
            </select>
          )}
        </FilterRenderer>
      ),
    },
    {
      key: 'service',
      name: 'Service',
      width: 100,
      headerCellClass: 'filter-cell',
      headerRenderer: (p) => (
        <FilterRenderer {...p}>
          {({ filters, ...rest }) => (
            <select
              {...rest}
              className="filter"
              value={filters.service}
              onChange={(e) => {
                setFilters({ ...filters, service: e.target.value });
              }}
            >
              <option value="">All</option>
              {Array.from(services)
                .sort()
                .map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>
          )}
        </FilterRenderer>
      ),
    },
    {
      key: 'method',
      name: 'Method',
      width: 100,
      headerCellClass: 'filter-cell',
      headerRenderer: (p) => (
        <FilterRenderer {...p}>
          {({ filters, ...rest }) => (
            <select
              {...rest}
              className="filter"
              value={filters.method}
              onChange={(e) => {
                setFilters({ ...filters, method: e.target.value });
              }}
            >
              <option value="">All</option>
              {Array.from(methods)
                .sort()
                .map((m) => (
                  <option key={m} value={m}>
                    {m}
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
};

export { generateColumns };

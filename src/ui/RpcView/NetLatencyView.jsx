import React from 'react';
import './NetLatencyView.scss';

const NetLatencyView = ({ capturing, latency }) => {
  if (!capturing) return null;

  if (latency === null || typeof latency === 'undefined') {
    latency = '-·-';
  } else if (latency > 999) {
    latency = '999+';
  }

  return (
    <div className='netlatency'>
      <div>
        <span>{latency}</span>
      </div>
      <div>
        <span>ms</span>
      </div>
    </div>
  );
};

export default NetLatencyView;

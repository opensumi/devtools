import React from 'react';

import './NetSpeed.scss';

const NetSpeed = ({ capturing, upload, download }) => {
  if (!capturing) return null;

  const uploadSpeed = format(upload / 1000);
  const downloadSpeed = format(download / 1000);

  return (
    <div className='netspeed'>
      <div>
        <span className='netspeed-icon icon-upload'></span>
        <span>{uploadSpeed.number}</span> <span>{uploadSpeed.unit}</span>
      </div>
      <div>
        <span className='netspeed-icon icon-download'></span>
        <span>{downloadSpeed.number}</span> <span>{downloadSpeed.unit}</span>
      </div>
    </div>
  );
};

const format = (num) => {
  const si = [
    { value: 1, symbol: 'KB/s' },
    { value: 1e3, symbol: 'MB/s' },
  ];
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return {
    number: (num / si[i].value).toFixed(2),
    unit: si[i].symbol,
  };
};

export default NetSpeed;

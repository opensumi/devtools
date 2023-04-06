export const updateMessages = (oldMessages, newRawMessages) => {
  const newMessages = [];
  const updatedMessages = oldMessages.concat();

  for (const message of newRawMessages) {
    const msg = {
      time: message.time,
      service: message.service,
      method: message.method,
    };
    if (message.type === 'event') {
      msg.type = '↓';
      msg.receive = JSON.stringify(message.args);
      newMessages.push(msg);
    }
    if (message.type === 'request') {
      msg.type = '↑↓';
      msg.requestId = message.requestId;
      msg.send = JSON.stringify(message.args);
      newMessages.push(msg);
    }
    if (message.type === 'response') {
      let isCorrespondingRowInNewMessages = false;
      let isCorrespondingRowInMessages = false;
      for (let i = newMessages.length - 1; i >= 0; i--) {
        if (newMessages[i].requestId === message.requestId && newMessages[i].service === message.service) {
          newMessages[i].receive = JSON.stringify(message.args);
          isCorrespondingRowInNewMessages = true;
          break;
        }
      }
      if (!isCorrespondingRowInNewMessages) {
        for (let i = oldMessages.length - 1; i >= 0; i--) {
          if (oldMessages[i].requestId === message.requestId && oldMessages[i].service === message.service) {
            updatedMessages[i] = structuredClone(oldMessages[i]);
            updatedMessages[i].receive = JSON.stringify(message.args);
            isCorrespondingRowInMessages = true;
            break;
          }
        }
      }
      if (!isCorrespondingRowInNewMessages && !isCorrespondingRowInMessages) {
        msg.type = '↑↓';
        newMessages.push(msg);
      }
    }
  }

  return {
    updatedMessages,
    newMessages,
  };
};

export const getParsedMessage = (row, sendOrReceive) => {
  if (!row) return undefined;
  if (!row[sendOrReceive]) return undefined;

  let parsed = JSON.parse(row[sendOrReceive]);
  if (typeof parsed !== 'object') {
    parsed = {
      '': parsed,
    };
  }
  return parsed;
};

export const updateMessages = (oldMessages, newRawMessages) => {
  const newMessages = [];
  const updatedMessages = oldMessages.concat();

  for (const message of newRawMessages) {
    const msg = {
      time: message.time,
      channel: message.channel,
    };
    if (message.ipcMethod === 'ipcRenderer.on') {
      msg.type = '↓';
      msg.receive = JSON.stringify(message.arguments);
    } else if (message.ipcMethod === 'ipcRenderer.send') {
      msg.type = '↑';
      msg.send = JSON.stringify(message.arguments);
    } else if (message.ipcMethod === 'ipcRenderer.sendSync' || message.ipcMethod === 'ipcRenderer.invoke') {
      msg.type = '↑↓';
      msg.requestId = message.requestId;
      if (message.arguments) msg.send = JSON.stringify(message.arguments);
      if (message.result) msg.receive = JSON.stringify(message.result);
    }

    if (msg.requestId) {
      let isCorrespondingRowInNewMessages = false;
      let isCorrespondingRowInMessages = false;

      for (let i = newMessages.length - 1; i >= 0; i--) {
        if (newMessages[i].type === '↑↓') {
          if (newMessages[i].requestId === msg.requestId) {
            newMessages[i].receive = msg.receive;
            isCorrespondingRowInNewMessages = true;
            break;
          }
        }
      }

      if (!isCorrespondingRowInNewMessages) {
        for (let i = oldMessages.length - 1; i >= 0; i--) {
          if (oldMessages[i].type === '↑↓') {
            if (oldMessages[i].requestId === msg.requestId) {
              updatedMessages[i] = structuredClone(oldMessages[i]);
              updatedMessages[i].receive = msg.receive;
              isCorrespondingRowInMessages = true;
              break;
            }
          }
        }
      }

      if (!isCorrespondingRowInNewMessages && !isCorrespondingRowInMessages) {
        newMessages.push(msg);
      }
    } else {
      newMessages.push(msg);
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

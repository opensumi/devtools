const serviceMethodSplit = (serviceMethod) => {
  if (serviceMethod.startsWith('on')) {
    serviceMethod = serviceMethod.slice(3);
  }
  if (serviceMethod.includes('||')) {
    // for ExtProtocol
    return serviceMethod.split('||');
  }

  return serviceMethod.split(':');
};

const tSend = '↑';
const tSendAndReceive = '↑↓';
const tReceive = '↓';
const tReceiveAndSend = '↓↑';

const updateMessages = (oldMessages, newRawMessages) => {
  const newMessages = [];
  let sendBytes = 0;
  let receiveBytes = 0;

  // if new message is requestResult/onRequestResult
  // the corresponding sendRequest/onRequest row should be updated
  const updatedMessages = oldMessages.concat();

  for (const message of newRawMessages) {
    // ignore rtt messages
    if (message.serviceMethod === 'ConnectionBackServicePath:$measure') {
      continue;
    }

    const msg = {
      time: message.time,
      type: message.type,
    };

    let serviceMethodSplitResult;
    if (message.serviceMethod) {
      serviceMethodSplitResult = serviceMethodSplit(message.serviceMethod);
    }

    if (msg.type === 'sendNotification') {
      msg.type = tSend;
      msg.service = serviceMethodSplitResult[0];
      msg.method = serviceMethodSplitResult[1];
      msg.send = JSON.stringify(message.arguments);
    } else if (msg.type === 'sendRequest') {
      msg.type = tSendAndReceive;
      msg.requestId = message.requestId;
      msg.service = serviceMethodSplitResult[0];
      msg.method = serviceMethodSplitResult[1];
      msg.send = JSON.stringify(message.arguments);
    } else if (msg.type === 'requestResult') {
      msg.type = tSendAndReceive;
      msg.requestId = message.requestId;
      msg.status = message.status;
      if (msg.status === 'success') {
        msg.receive = JSON.stringify(message.data);
      } else if (msg.status === 'fail') {
        msg.receive = JSON.stringify(message.error);
      }
    } else if (msg.type === 'onNotification') {
      msg.type = tReceive;
      msg.service = serviceMethodSplitResult[0];
      msg.method = serviceMethodSplitResult[1];
      msg.receive = JSON.stringify(message.arguments);
    } else if (msg.type === 'onRequest') {
      msg.type = tReceiveAndSend;
      msg.requestId = message.requestId;
      msg.service = serviceMethodSplitResult[0];
      msg.method = serviceMethodSplitResult[1];
      msg.receive = JSON.stringify(message.arguments);
    } else if (msg.type === 'onRequestResult') {
      msg.type = tReceiveAndSend;
      msg.requestId = message.requestId;
      msg.status = message.status;
      if (msg.status === 'success') {
        msg.send = JSON.stringify(message.data);
      } else if (msg.status === 'fail') {
        msg.send = JSON.stringify(message.error);
      }
    }

    // total send/receive bytes of new messages
    // for caculating the net speeds
    if (msg.send) {
      sendBytes += new Blob([msg.send]).size;
    }
    if (msg.receive) {
      receiveBytes += new Blob([msg.receive]).size;
    }

    if (msg.type === tSendAndReceive) {
      // merge requestResult row into corresponding sendRequest row
      let isCorrespondingRowInNewMessages = false;
      let isCorrespondingRowInMessages = false;

      for (let i = newMessages.length - 1; i >= 0; i--) {
        if (newMessages[i].type === tSendAndReceive) {
          if (newMessages[i].requestId === msg.requestId) {
            newMessages[i].receive = msg.receive;
            isCorrespondingRowInNewMessages = true;
            break;
          }
        }
      }

      if (!isCorrespondingRowInNewMessages) {
        for (let i = oldMessages.length - 1; i >= 0; i--) {
          if (oldMessages[i].type === tSendAndReceive) {
            if (oldMessages[i].requestId === msg.requestId) {
              updatedMessages[i] = structuredClone(oldMessages[i]);
              updatedMessages[i].receive = msg.receive;
              isCorrespondingRowInMessages = true;
              break;
            }
          }
        }
      }

      // corresponding sendRequest raw was cleared
      if (!isCorrespondingRowInNewMessages && !isCorrespondingRowInMessages) {
        newMessages.push(msg);
      }
    } else if (msg.type === tReceiveAndSend) {
      // merge onRequestResult row into corresponding onRequest row
      let isCorrespondingRowInNewMessages = false;
      let isCorrespondingRowInMessages = false;

      for (let i = newMessages.length - 1; i >= 0; i--) {
        if (newMessages[i].type === tReceiveAndSend) {
          if (newMessages[i].requestId === msg.requestId) {
            newMessages[i].send = msg.send;
            isCorrespondingRowInNewMessages = true;
            break;
          }
        }
      }

      if (!isCorrespondingRowInNewMessages) {
        for (let i = oldMessages.length - 1; i >= 0; i--) {
          if (oldMessages[i].type === tReceiveAndSend) {
            if (oldMessages[i].requestId === msg.requestId) {
              updatedMessages[i] = structuredClone(oldMessages[i]);
              updatedMessages[i].send = msg.send;
              isCorrespondingRowInMessages = true;
              break;
            }
          }
        }
      }

      // corresponding onRequest raw was cleared
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
    sendBytes,
    receiveBytes,
  };
};

const getParsedMessage = (row, sendOrReceive, shouldParseExtProtocol) => {
  if (!row) return undefined;
  if (!row[sendOrReceive]) return undefined;

  let parsed = JSON.parse(row[sendOrReceive]);
  if (row.service === 'ExtProtocol' && shouldParseExtProtocol) {
    parsed = JSON.parse(parsed);
  }
  if (typeof parsed !== 'object') {
    parsed = {
      '': parsed,
    };
  }
  return parsed;
};

export { updateMessages, getParsedMessage };

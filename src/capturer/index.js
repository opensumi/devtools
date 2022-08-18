import evalInWindow from '../utils/eval';

const startCapturing = () => {
  return evalInWindow(() => {
    // Return if messages are already being listened to prevent duplicates
    // when reloading the extension
    if (window.__opensumi_devtools.messages != null) {
      window.__opensumi_devtools.messages = [];
      return;
    }

    window.__opensumi_devtools.messages = [];

    window.__opensumi_devtools.capture = (message) => {
      if (window.__opensumi_devtools.evaling) return;

      const msg = {
        time: new Date().toLocaleString().split(' ')[1],
        type: message.type,
        serviceMethod: message.serviceMethod,
      };

      if (msg.type === 'sendNotification') {
        msg.arguments = message.arguments;
      } else if (msg.type === 'sendRequest') {
        msg.requestId = message.requestId;
        msg.arguments = message.arguments;
      } else if (msg.type === 'requestResult') {
        msg.requestId = message.requestId;
        msg.status = message.status;
        if (msg.status === 'success') {
          msg.data = message.data;
        } else if (msg.status === 'fail') {
          msg.error = message.error;
        }
      } else if (msg.type === 'onNotification') {
        msg.arguments = message.arguments;
      } else if (msg.type === 'onRequest') {
        msg.requestId = message.requestId;
        msg.arguments = message.arguments;
      } else if (msg.type === 'onRequestResult') {
        msg.requestId = message.requestId;
        msg.status = message.status;
        if (msg.status === 'success') {
          msg.data = message.data;
        } else if (msg.status === 'fail') {
          msg.error = message.error;
        }
      }

      window.__opensumi_devtools.messages.push(msg);
    };
  });
};

const stopCapturing = () => {
  return evalInWindow(() => {
    if (window.__opensumi_devtools.messages)
      delete window.__opensumi_devtools.messages;
    if (window.__opensumi_devtools.capture)
      delete window.__opensumi_devtools.capture;
    if (window.__opensumi_devtools.latency)
      delete window.__opensumi_devtools.latency;
  });
};

const getMessages = () => {
  return evalInWindow(() => {
    const messages = window.__opensumi_devtools.messages;
    if (messages) window.__opensumi_devtools.messages = [];
    return messages;
  }).then((messages) => {
    if (messages) return messages;

    // Start listening for messages if array is missing meaning
    // the window was reloaded
    return startCapturing().then(() => []);
  });
};

const getLatency = () => {
  return evalInWindow(() => {
    return window.__opensumi_devtools.latency;
  }).then((latency) => {
    return latency;
  });
};

export { startCapturing, stopCapturing, getMessages, getLatency };

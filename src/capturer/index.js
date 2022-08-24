import evalInWindow from '../utils/eval.js';

const startCapturing = () => {
  return evalInWindow(() => {
    // Return if messages are already being listened to prevent duplicates
    // when reloading the extension
    if (window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.messages != null) {
      window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.messages = [];
      return;
    }

    window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.messages = [];

    window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.capture = (message) => {
      if (window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.evaling) return;

      // if the length of messages is greater than 9999, devtools window
      // is regarded to be closed in capturing state. So stop capturing.
      if (window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.messages.length > 9999) {
        window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__ = {};
        return;
      }

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

      window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.messages.push(msg);
    };

    // send notification to opensumi core by custom event
    const latencyEvent = new CustomEvent('devtools:latency', {
      detail: {
        command: 'start',
      },
    });
    window.dispatchEvent(latencyEvent);
  });
};

const stopCapturing = () => {
  return evalInWindow(() => {
    const latencyEvent = new CustomEvent('devtools:latency', {
      detail: {
        command: 'stop',
      },
    });
    window.dispatchEvent(latencyEvent);

    window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__ = {};
  });
};

const getMessages = () => {
  return evalInWindow(() => {
    const messages = window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.messages;
    // clear messages after getting them each time
    if (messages) window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.messages = [];
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
    return window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.latency;
  }).then((latency) => {
    return latency;
  });
};

export { startCapturing, stopCapturing, getMessages, getLatency };

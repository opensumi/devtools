import evalInWindow from '../utils/eval.js';

const startCapturingRpc = () => {
  return evalInWindow(() => {
    // Return if messages are already being listened to prevent duplicates
    // when reloading the extension
    if (window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.rpcMessages != null) {
      window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.rpcMessages = [];
      return;
    }

    window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.rpcMessages = [];

    window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.captureRpc = (message) => {
      if (window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.evaling) return;

      // if the length of messages is greater than 9999, devtools window
      // is regarded to be closed in capturing state. So stop capturing.
      if (window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.rpcMessages.length > 9999) {
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

      window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.rpcMessages.push(msg);
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

const stopCapturingRpc = () => {
  return evalInWindow(() => {
    const latencyEvent = new CustomEvent('devtools:latency', {
      detail: {
        command: 'stop',
      },
    });
    window.dispatchEvent(latencyEvent);

    window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.rpcMessages = undefined;
    window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.captureRpc = undefined;
  });
};

const getRpcMessages = () => {
  return evalInWindow(() => {
    const messages = window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.rpcMessages;
    // clear messages after getting them each time
    if (messages) window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.rpcMessages = [];
    return messages;
  }).then((messages) => {
    if (messages) return messages;

    // Start listening for messages if array is missing meaning
    // the window was reloaded
    return startCapturingRpc().then(() => []);
  });
};

const getLatency = () => {
  return evalInWindow(() => {
    return window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.latency;
  }).then((latency) => {
    return latency;
  });
};

export { startCapturingRpc, stopCapturingRpc, getRpcMessages, getLatency };

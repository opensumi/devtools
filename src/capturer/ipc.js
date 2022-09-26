import evalInWindow from '../utils/eval.js';

const startCapturingIpc = () => {
  return evalInWindow(() => {
    // Return if messages are already being listened to prevent duplicates
    // when reloading the extension
    if (window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.IPCMessages != null) {
      window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.IPCMessages = [];
      return;
    }

    window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.IPCMessages = [];

    window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.captureIPC = (message) => {
      if (window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.evaling) return;

      // if the length of messages is greater than 9999, devtools window
      // is regarded to be closed in capturing state. So stop capturing.
      if (window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.IPCMessages.length > 9999) {
        window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__ = {};
        return;
      }

      const msg = {
        time: new Date().toLocaleString().split(' ')[1],
        ipcMethod: message.ipcMethod,
        channel: message.channel,
      };
      if (message.requestId) msg.requestId = message.requestId;
      if (message.args) msg.arguments = message.args;
      if (message.result) msg.result = message.result;

      window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.IPCMessages.push(msg);
    };
  });
};

const stopCapturingIpc = () => {
  return evalInWindow(() => {
    window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.IPCMessages = undefined;
    window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.captureIPC = undefined;
  });
};

const getIpcMessages = () => {
  return evalInWindow(() => {
    const messages = window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.IPCMessages;
    // clear messages after getting them each time
    if (messages) window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.IPCMessages = [];
    return messages;
  }).then((messages) => {
    if (messages) return messages;

    // Start listening for messages if array is missing meaning
    // the window was reloaded
    return startCapturingIpc().then(() => []);
  });
};

export { startCapturingIpc, stopCapturingIpc, getIpcMessages };

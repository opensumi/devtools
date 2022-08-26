import evalInWindow from '../utils/eval.js';

const startCapturingIpc = () => {
  return evalInWindow(() => {
    // Return if messages are already being listened to prevent duplicates
    // when reloading the extension
    if (window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.ipcMessages != null) {
      window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.ipcMessages = [];
      return;
    }

    window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.ipcMessages = [];

    window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.captureIpc = (message) => {
      if (window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.evaling) return;

      // if the length of messages is greater than 9999, devtools window
      // is regarded to be closed in capturing state. So stop capturing.
      if (window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.ipcMessages.length > 9999) {
        window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__ = {};
        return;
      }

      window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.ipcMessages.push({
        time: new Date().toLocaleString().split(' ')[1],
        ipcMethod: message.ipcMethod,
        channel: message.channel,
        arguments: message.args,
      });
    };
  });
};

const stopCapturingIpc = () => {
  return evalInWindow(() => {
    window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.ipcMessages = undefined;
    window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.captureIpc = undefined;
  });
};

const getIpcMessages = () => {
  return evalInWindow(() => {
    const messages = window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.ipcMessages;
    // clear messages after getting them each time
    if (messages) window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.ipcMessages = [];
    return messages;
  }).then((messages) => {
    if (messages) return messages;

    // Start listening for messages if array is missing meaning
    // the window was reloaded
    return startCapturingIpc().then(() => []);
  });
};

export { startCapturingIpc, stopCapturingIpc, getIpcMessages };

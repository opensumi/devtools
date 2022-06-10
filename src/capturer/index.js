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

    window.__opensumi_devtools.capture = (msg) => {
      if (window.__opensumi_devtools.evaling) return;

      try {
        msg = JSON.stringify(msg);
      } catch (error) {
        msg = `Failed to serialize args to JSON: ${error.message || error}`;
      }

      window.__opensumi_devtools.messages.push({
        time: new Date().toLocaleString(),
        msg: msg,
      });
    };
  });
};

const stopCapturing = () => {
  return evalInWindow(() => {
    if (window.__opensumi_devtools.messages)
      delete window.__opensumi_devtools.messages;
    if (window.__opensumi_devtools.capture)
      delete window.__opensumi_devtools.capture;
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

export { startCapturing, stopCapturing, getMessages };

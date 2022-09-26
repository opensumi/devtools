import evalInWindow from './eval.js';

export const checkElectron = () => {
  return evalInWindow(() => {
    const electronEnv = window.electronEnv;
    if (electronEnv) {
      return electronEnv;
    }
  }).then((electronEnv) => {
    if (electronEnv && electronEnv.metadata.devtools) {
      return true;
    } else {
      return false;
    }
  });
};

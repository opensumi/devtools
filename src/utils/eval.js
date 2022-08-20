const evalInWindow = (expression, ...rest) => {
  if (typeof expression === 'function') {
    expression = `(${expression})`;
    if (rest.length > 0) {
      let expressionArgs = JSON.stringify(rest);
      expression += `.apply(this, ${expressionArgs})`;
    } else {
      expression += '()';
    }
  }

  expression = `
      (function () {
        window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.evaling = true

        try {
          return ${expression}
        } finally {
          window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__.evaling = false
        }
      })()
    `;

  return new Promise((resolve, reject) => {
    window.chrome.devtools.inspectedWindow.eval(expression, (result, error) => {
      if (error) {
        if (error.isException && error.value) {
          let stack = error.value;
          error = new Error(stack.split('\n')[0]);
          error.stack = stack;
        }
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

export default evalInWindow;

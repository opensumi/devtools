const run = () => {
  window.chrome.devtools.inspectedWindow.eval(
    `window.__OPENSUMI_DEVTOOLS_GLOBAL_HOOK__`,
    (result, exception) => {
      if (exception) {
        console.log(exception);
      } else {
        if (result) {
          chrome.devtools.panels.create(
            'OpenSumi DevTools',
            'logo.png',
            'panel.html'
          );
        }
      }
    }
  );
};

run();

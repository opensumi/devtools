# OpenSumi DevTools


## Contributing

Please read [CONTRIBUTING](./CONTRIBUTING.md) if you are new here or not familiar with the basic rules of Git/GitHub world.

### Quickstart

1. Clone this repository

2. cd into this repository

3. yarn install

4. yarn run start

5. Load the freshly built unpacked extension on Chrome following:

   1. Access chrome://extensions/

   2. Check "Developer mode"

   3. Click on "Load unpacked extension"

   4. Select the "build" folder under the project root directory

   5. Keep "service worker" DevTools page open ([why?](https://github.com/hypertrons/hypertrons-crx/pull/274#discussion_r811878203))

6. Happy hacking!

### HMR & auto-reload

If you are developing Options page or Popup page, each time you save files the pages will hot replace the modules without refreshing, which means you can see the changes right away.

However, if you are developing Background or ContentScripts, each time you save files the service worker will reload the extension automatically. And if you are developing ContentScripts, then pages that injected with ContentScripts will refresh themselves to run the newest scripts.

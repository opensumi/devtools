# OpenSumi DevTools

A Chrome DevTools Extension for any [OpenSumi](https://github.com/opensumi/core) based IDE.

<table>
  <thead>
    <tr>
      <th width="50%">Web</th>
      <th width="50%">Electron</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img
          src="https://user-images.githubusercontent.com/32434520/192236137-fa3495a7-3999-416c-ad59-9a6aa8a2e2d0.png"
        />
      </td>
      <td>
        <img
          src="https://user-images.githubusercontent.com/32434520/192235671-52dfe310-21a6-40f9-8c39-1582daddfc30.png"
        />
      </td>
    </tr>
  </tbody>
</table>

## Features

Currently OpenSumi DevTools focuses on messages capturing and presenting:

- [x] RPC messages between frontend and backend
- [x] IPC messages between Electron processes (Electron client only)

Users are allowed to:

- [x] Toggle capturing
- [x] Filter messages
- [x] View parsed messages
- [x] Check communication traffic
- [x] Check network latency

## Install

> IMPORTANT: The devtools supports must be [enabled](https://opensumi.com/en/docs/integrate/browser-extension/opensumi-devtools#integrate) in OpenSumi first, otherwise this extension won't work!

Users can install OpenSumi DevTools either from **Chrome webstore** or from **a local folder**.

### Option 1: Install from Chrome webstore

This way is easier and more recommended.

**Web client**

1. Visit the extension in [Chrome webstore](https://chrome.google.com/webstore/detail/opensumi-devtools/ombdblngipgeakodomcednfdiabohmgl) and install it to your browser
2. Open DevTools in your page and you will see it!

**Electron client**

1. Install [electron-devtools-installer](https://www.npmjs.com/package/electron-devtools-installer) to your project
2. In your Electron app's entry point do similar things like below:

```javascript
import { app, session } from 'electron';
import installExtension from 'electron-devtools-installer';

import { ElectronMainApp } from '@opensumi/ide-core-electron-main';

const electronApp = new ElectronMainApp({
  ...
});

const OPENSUMI_DEVTOOLS_CHROME_WEBSTORE_ID = 'ombdblngipgeakodomcednfdiabohmgl';

electronApp.init().then(() => {
  ...
  app.whenReady().then(() => {
    installExtension(OPENSUMI_DEVTOOLS_CHROME_WEBSTORE_ID);
  });
});
```
4. Open DevTools in your app and you will see it!

### Option 2: Install from a folder

In the following way, users can install other versions of OpenSumi DevTools except for the one that published in Chrome webstore.

**Web**

1. Download `opensumi-devtools-vx.x.x.zip` from [releases](https://github.com/opensumi/devtools/releases)
2. Unzip it and get a folder
3. Vist chrome [extensions](chrome://extensions/) page and check "Developer mode"
4. Click "Load unpacked extension" and select the folder
5. Open DevTools in your page and you will see it!

**Electron**

1. Download `opensumi-devtools-vx.x.x.zip` from [releases](https://github.com/opensumi/devtools/releases)
2. Unzip it and get a folder
3. In your Electron app's entry point do similar things like below:

```javascript
import { app, session } from 'electron';
import { ElectronMainApp } from '@opensumi/ide-core-electron-main';

const electronApp = new ElectronMainApp({
  ...
});

electronApp.init().then(() => {
  ...
  const opensumiDevtoolsPath = 'your unpacked folder path';
  session.defaultSession.loadExtension(opensumiDevtoolsPath);
});
```
4. Open DevTools in your app and you will see it!

## Contributing

Please read [CONTRIBUTING](./CONTRIBUTING.md) if you are new here or not familiar with the basic rules of Git/GitHub world.

### Quickstart

1. `git clone` this repository

2. `cd` into this repository

3. `yarn install`

4. `yarn run start`

5. Load the freshly built unpacked extension on Chrome following:

   1. Access chrome://extensions/

   2. Check "Developer mode"

   3. Click on "Load unpacked extension"

   4. Select the "build" folder under the project root directory

   5. Keep "service worker" DevTools page open ([why?](https://github.com/hypertrons/hypertrons-crx/pull/274#discussion_r811878203))

6. Happy hacking!

## Others

If you are interested in the early developing phase of this devtools, you can visit [this issue](https://github.com/opensumi/core/issues/1098) and [this branch](https://github.com/tyn1998/opensumi-devtools/tree/main-backup).

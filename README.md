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
          src="https://user-images.githubusercontent.com/32434520/186371187-dc68ccb0-76d5-4731-8a15-1e122a927931.png"
        />
      </td>
      <td>
        <img
          src="https://user-images.githubusercontent.com/32434520/186371624-675d51f8-429f-4612-89f3-e9ee45f22a1b.png"
        />
      </td>
    </tr>
  </tbody>
</table>

## Features

Currently OpenSumi DevTools focuses on message capturing and presenting:

- [x] OpenSumi RPC messages
- [ ] Electron IPC messages (working on it...)

Users are allowed to:

- [x] toggle capturing
- [x] filter messages
- [x] viewing parsed messages
- [x] detect message netspeed
- [x] detect network latency
- [ ] ...


## Install

Before we publish it to chrome webstore, you can install OpenSumi DevTools in your OpenSumi based Web/Electron IDE by steps below:

**Web**

1. Download `opensumi-devtools-vx.x.x.zip` from [releases](https://github.com/opensumi/devtools/releases)
2. Unzip it and get a folder
3. Vist chrome [extensions](chrome://extensions/) page and check "Developer mode"
4. Click "Load unpacked extension" and select the folder
5. Open DevTools in your page and have fun!

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
4. Open DevTools in your app and have fun!

Things will get easier after we publish the extension to chrome store. Stay tuned!
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

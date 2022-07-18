import React from 'react';
import './Panel.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import MessagesTab from './MessagesTab/MessagesTab';

const Panel = () => {
  return (
    <Tabs forceRenderTabPanel={true}>
      <TabList>
        <Tab>Messages</Tab>
        <Tab>XXX</Tab>
      </TabList>

      <TabPanel>
        <MessagesTab />
      </TabPanel>
      <TabPanel>
        <div>XXX</div>
      </TabPanel>
    </Tabs>
  );
};

export default Panel;

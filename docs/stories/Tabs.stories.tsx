import React from 'react';

import { TabSet, TabItem } from 'myst-to-react';
import { TabStateProvider } from '@myst-theme/providers';

export default {
  title: 'Components/Tabs',
  component: TabSet,
};

type Tab = {
  title: string;
  id: string;
  sync?: string;
  selected?: boolean;
  children: React.ReactNode;
};

const Template = ({ tabSets }: { tabSets: Tab[][] }) => (
  <article className="prose m-auto mt-6 max-w-[80ch]">
    <TabStateProvider>
      {tabSets.map((tabs, index) => (
        <TabSet tabs={tabs} key={index}>
          {tabs.map(({ id, children }) => (
            <TabItem id={id} key={id}>
              {children}
            </TabItem>
          ))}
        </TabSet>
      ))}
    </TabStateProvider>
  </article>
);

export const SingleTabs = Template.bind({});
SingleTabs.args = {
  tabSets: [
    [
      { id: 'one', title: 'Tab1', children: <p>Content of Tab 1</p> },
      { id: 'two', title: 'Tab2', children: <p>Content of Tab 2</p> },
    ],
  ],
};

export const DisconnectedTabs = Template.bind({});
DisconnectedTabs.args = {
  tabSets: [
    [
      { id: 'one', title: 'Tab1', children: <p>Content of Tab 1</p> },
      { id: 'two', title: 'Tab2', children: <p>Content of Tab 2</p> },
    ],
    [
      { id: 'one', title: 'Tab1', children: <p>Content of Tab 1</p> },
      { id: 'two', title: 'Tab2', children: <p>Content of Tab 2</p> },
    ],
  ],
};

export const SyncedTabs = Template.bind({});
SyncedTabs.args = {
  tabSets: [
    [
      { id: 'one', sync: 'one', title: 'Tab1', children: <p>Content of Tab 1</p> },
      { id: 'two', sync: 'two', title: 'Tab2', children: <p>Content of Tab 2</p> },
    ],
    [
      { id: 'one', sync: 'one', title: 'Tab1', children: <p>Content of Tab 1</p> },
      { id: 'two', sync: 'two', title: 'Tab2', children: <p>Content of Tab 2</p> },
    ],
  ],
};

export const SemiSyncedTabs = Template.bind({});
SemiSyncedTabs.args = {
  tabSets: [
    [
      { id: 'one', sync: 'one', title: 'Tab1', children: <p>Content of Tab 1</p> },
      { id: 'two', sync: 'two', title: 'Tab2', children: <p>Content of Tab 2</p> },
    ],
    [
      { id: 'one', sync: 'one', title: 'Tab1', children: <p>Content of Tab 1</p> },
      { id: 'two', sync: 'two', title: 'Tab2', children: <p>Content of Tab 2</p> },
    ],
    [
      { id: 'one', title: 'Something ', children: <p>Content of Tab "Something"</p> },
      { id: 'ok1', sync: 'one', title: 'Tab1', children: <p>Content of Tab 1</p> },
      { id: 'two', title: 'Something Else', children: <p>Content of Tab "Something Else"</p> },
      { id: 'ok2', sync: 'two', title: 'Tab2', children: <p>Content of Tab 2</p> },
    ],
  ],
};

export const SelectedTabs = Template.bind({});
SelectedTabs.args = {
  tabSets: [
    [
      { id: 'one', title: 'Tab1', children: <p>Content of Tab 1</p> },
      { id: 'two', title: 'Selected!', children: <p>Content of Tab 2</p>, selected: true },
    ],
  ],
};

export const SelectedTabsWithSync = Template.bind({});
SelectedTabsWithSync.args = {
  tabSets: [
    [
      { id: 'one', sync: 'one', title: 'Tab1', children: <p>Content of Tab 1</p> },
      { id: 'two', sync: 'two', title: 'Tab2', children: <p>Content of Tab 2</p> },
    ],
    [
      { id: 'one', sync: 'one', title: 'Tab1', children: <p>Content of Tab 1</p> },
      {
        id: 'two',
        sync: 'two',
        title: 'Tab2 (selected!)',
        children: <p>Content of Tab 2</p>,
        selected: true,
      },
    ],
    [
      { id: 'one', title: 'Something ', children: <p>Content of Tab "Something"</p> },
      {
        id: 'ok1',
        sync: 'one',
        title: 'Tab1 (selected!)',
        children: <p>Content of Tab 1</p>,
        selected: true,
      },
      { id: 'two', title: 'Something Else', children: <p>Content of Tab "Something Else"</p> },
      { id: 'ok2', sync: 'two', title: 'Tab2', children: <p>Content of Tab 2</p> },
    ],
  ],
};

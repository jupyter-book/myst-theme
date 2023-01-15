import classNames from 'classnames';
import type { GenericNode } from 'myst-common';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { selectAll } from 'unist-util-select';
import type { NodeRenderer } from '@myst-theme/providers';
import { useTabSet } from '@myst-theme/providers';

interface TabItem extends GenericNode {
  key: string;
  title: string;
  sync?: string;
  selected?: boolean;
}

const TabSetContext = createContext<string | undefined>(undefined);

// Create a provider for components to consume and subscribe to changes
function TabSetStateProvider({ active, children }: { active: string; children: React.ReactNode }) {
  return <TabSetContext.Provider value={active}>{children}</TabSetContext.Provider>;
}

type Tab = { title: string | React.ReactNode; id: string; sync?: string; selected?: boolean };

export function TabSet({ tabs, children }: { tabs: Tab[]; children: React.ReactNode }) {
  const [lastClickedTab, onClickSyncedTab] = useTabSet() ?? [];
  const [active, setActive] = useState<string>(tabs.find((t) => t.selected)?.id ?? tabs[0].id);
  const onClick = (tab: Tab) => {
    setActive(tab.id);
    if (tab.sync) {
      if (!onClickSyncedTab) {
        console.error('TabStateProvider is not defined, synced tabs will not work.');
      }
      onClickSyncedTab?.(tab.sync);
    }
  };

  useEffect(() => {
    if (!lastClickedTab) return;
    const tab = tabs.find((item) => item.sync === lastClickedTab);
    if (!tab) return;
    setActive(tab?.id);
  }, [tabs, lastClickedTab, setActive]);

  return (
    <TabSetStateProvider active={active}>
      <div>
        <div className="flex flex-row border-b border-b-gray-100 overflow-x-auto">
          {tabs.map((tab) => {
            return (
              <div
                key={tab.id}
                className={classNames('flex-none px-3 py-1 font-semibold cursor-pointer', {
                  'text-blue-600 border-b-2 border-b-blue-600 dark:border-b-white dark:text-white':
                    active === tab.id,
                  'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100':
                    active !== tab.id,
                })}
                onClick={() => onClick(tab)}
              >
                {tab.title}
              </div>
            );
          })}
        </div>
        <div className="shadow flex">
          <div className="w-full px-6">{children}</div>
        </div>
      </div>
    </TabSetStateProvider>
  );
}

export function TabItem({
  id,
  children,
}: Omit<Tab, 'title' | 'sync'> & { children: React.ReactNode }) {
  const active = useContext(TabSetContext);
  const open = active === id;
  return <div className={classNames({ hidden: !open })}>{children}</div>;
}

export const TabSetRenderer: NodeRenderer = (node, children) => {
  // Add the key as the ID (key is special in react)
  const tabs = (selectAll('tabItem', node) as TabItem[]).map((tab) => ({
    title: tab.title,
    id: tab.key,
    sync: tab.sync,
  }));
  return (
    <TabSet key={node.key} tabs={tabs}>
      {children}
    </TabSet>
  );
};

export const TabItemRenderer: NodeRenderer<TabItem> = (node, children) => {
  return (
    <TabItem key={node.key} id={node.key}>
      {children}
    </TabItem>
  );
};

const TAB_RENDERERS: Record<string, NodeRenderer> = {
  tabSet: TabSetRenderer,
  tabItem: TabItemRenderer,
};

export default TAB_RENDERERS;

import PropTypes from "prop-types";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import SanayaEntityPage from "./SanayaEntityPage";
import { Button } from "./ui/button";

const EntityWorkspace = ({ defaultTab, moduleDescription, moduleTitle, tabs }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabMap = useMemo(
    () =>
      tabs.reduce((acc, tab) => {
        acc[tab.key] = tab;
        return acc;
      }, {}),
    [tabs],
  );

  const fallbackTab = defaultTab || tabs[0]?.key;
  const requestedTab = searchParams.get("tab");
  const activeTabKey = tabMap[requestedTab] ? requestedTab : fallbackTab;
  const activeTab = tabMap[activeTabKey] || tabs[0];

  const activeEntities =
    activeTab?.entities ||
    (activeTab?.entityKey
      ? [
          {
            entityKey: activeTab.entityKey,
            subtitle: activeTab.subtitle,
            title: activeTab.title,
          },
        ]
      : []);

  const updateTab = (nextTab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", nextTab);
    setSearchParams(nextParams, { replace: true });
  };

  if (!activeTab || activeEntities.length === 0) return null;

  return (
    <>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{moduleTitle}</h1>
          <p className="mt-1 text-sm text-slate-600">{moduleDescription}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = tab.key === activeTabKey;
              return (
                <Button
                  key={tab.key}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => updateTab(tab.key)}
                >
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </section>
      </div>

      {activeEntities.map((entity) => (
        <SanayaEntityPage
          key={`${activeTab.key}-${entity.entityKey}`}
          entityKey={entity.entityKey}
          title={entity.title}
          subtitle={entity.subtitle}
          showHeader
        />
      ))}
    </>
  );
};

EntityWorkspace.propTypes = {
  defaultTab: PropTypes.string,
  moduleDescription: PropTypes.string.isRequired,
  moduleTitle: PropTypes.string.isRequired,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      entityKey: PropTypes.string,
      entities: PropTypes.arrayOf(
        PropTypes.shape({
          entityKey: PropTypes.string.isRequired,
          subtitle: PropTypes.string.isRequired,
          title: PropTypes.string.isRequired,
        }),
      ),
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      subtitle: PropTypes.string,
      title: PropTypes.string,
    }),
  ).isRequired,
};

EntityWorkspace.defaultProps = {
  defaultTab: "",
};

export default EntityWorkspace;

import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Tabs from '../shared/components/Tabs';

function Transactions() {
  const location = useLocation();
  const [activeTab, setActiveTab] = React.useState(location.pathname);

  return (
    <div>
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            label: 'List',
            mobile: { label: 'List' },
            path: '/transactions/list',
          },
          {
            label: 'Add',
            mobile: { label: 'Add' },
            path: '/transactions/add',
            hideOnMobile: true,
          },
          {
            label: 'Categories',
            mobile: { label: 'Cats' },
            path: '/transactions/categories',
          },
          {
            label: 'Statistics',
            mobile: { label: 'Stats' },
            path: '/transactions/statistics',
          },
        ]}
      />
      <br /> <br />
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
    </div>
  );
}

export default Transactions;

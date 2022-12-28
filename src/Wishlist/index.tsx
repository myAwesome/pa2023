import React, { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Tabs from '../shared/components/Tabs';

const Wishlist = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = React.useState(location.pathname);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  return (
    <div>
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            label: 'List',
            mobile: { label: 'List' },
            path: '/wishlist/list',
          },
          {
            label: 'Add',
            mobile: { label: 'Add' },
            path: '/wishlist/add',
          },
        ]}
      />
      <br /> <br />
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
    </div>
  );
};

export default Wishlist;

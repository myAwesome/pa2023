import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import Tabs from '../shared/components/Tabs';

const Days = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = React.useState(location.pathname);
  return (
    <div>
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            label: 'Last 25 posts',
            mobile: {
              label: 'Last posts',
            },
            path: '/days',
          },
          {
            label: 'This day in history',
            mobile: {
              label: 'This day',
            },
            path: '/days/history',
          },
          {
            label: 'All posts',
            mobile: {
              label: 'All',
            },
            path: '/days/app',
          },
          {
            label: 'Settings',
            // icon: <SettingsIcon />,
            mobile: {
              icon: <SettingsIcon />,
            },
            path: '/days/settings',
          },
          {
            icon: <SearchIcon />,
            mobile: {
              icon: <SearchIcon />,
            },
            path: '/days/search',
          },
        ]}
      />
      <br /> <br />
      <Outlet />
    </div>
  );
};

export default Days;

import React, { ReactElement } from 'react';
import { Tab, Tabs as MuiTabs, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

type Props = {
  value: string;
  onChange: (path: string) => void;
  tabs: {
    label?: string;
    icon?: ReactElement;
    path: string;
    mobile: {
      label?: string;
      icon?: ReactElement;
    };
    onClick?: () => void;
    hideOnMobile?: boolean;
  }[];
};

const Tabs = ({ value, onChange, tabs }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const tabsToUse = isMobile
    ? tabs.filter(({ hideOnMobile }) => !hideOnMobile)
    : tabs;
  const index = tabsToUse.findIndex(({ path }) => path === value);
  const navigate = useNavigate();
  return (
    <MuiTabs
      value={index}
      onChange={(e, newVal) => onChange(tabsToUse[newVal].path)}
      indicatorColor="primary"
      textColor="primary"
      variant={
        isMobile ? (tabs.length > 3 ? 'scrollable' : 'fullWidth') : 'standard'
      }
    >
      {tabs.map((t, i) =>
        t.hideOnMobile && isMobile ? null : (
          <Tab
            key={t.label || i}
            label={isMobile ? t.mobile.label : t.label}
            icon={isMobile ? t.mobile.icon : t.icon}
            onClick={() => navigate(t.path)}
          />
        ),
      )}
    </MuiTabs>
  );
};

export default Tabs;

import React from 'react';
import PropTypes from 'prop-types';
import { Tab, Tabs as MuiTabs, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Tabs = ({ value, onChange, tabs }) => {
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

Tabs.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      icon: PropTypes.node,
      mobile: PropTypes.shape({
        label: PropTypes.string,
        icon: PropTypes.node,
      }).isRequired,
      onClick: PropTypes.func,
      hideOnMobile: PropTypes.bool,
    }),
  ),
};

export default Tabs;

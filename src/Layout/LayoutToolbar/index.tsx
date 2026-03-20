import React from 'react';
import {
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Link as MuiLink,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Alarm,
  CardGiftcard,
  Equalizer,
  EventNote,
  ListAlt,
  ViewWeek,
  Public,
  HourglassTop,
  Tv,
} from '@mui/icons-material';
import { AppKey, isAppEnabled } from '../../shared/hooks/useUserApps';

type Props = {
  open: boolean;
  enabledApps: AppKey[];
};

const LayoutToolbar = ({ open, enabledApps }: Props) => {
  return (
    <List>
      {open ? <ListSubheader component="span"> Personal </ListSubheader> : null}
      {isAppEnabled(enabledApps, 'days') && (
        <MuiLink component={Link} to="/days" underline="none">
          <ListItemButton>
            <ListItemIcon>
              <EventNote />
            </ListItemIcon>
            <ListItemText primary="Days" />
          </ListItemButton>
        </MuiLink>
      )}
      {isAppEnabled(enabledApps, 'projects') && (
        <MuiLink component={Link} to="/projects" underline="none">
          <ListItemButton>
            <ListItemIcon>
              <ViewWeek />
            </ListItemIcon>
            <ListItemText primary="Projects" />
          </ListItemButton>
        </MuiLink>
      )}
      {isAppEnabled(enabledApps, 'last-time') && (
        <MuiLink component={Link} to="/last-time" underline="none">
          <ListItemButton>
            <ListItemIcon>
              <Alarm />
            </ListItemIcon>
            <ListItemText primary="Last Time" />
          </ListItemButton>
        </MuiLink>
      )}
      {isAppEnabled(enabledApps, 'countdown') && (
        <MuiLink component={Link} to="/countdown" underline="none">
          <ListItemButton>
            <ListItemIcon>
              <HourglassTop />
            </ListItemIcon>
            <ListItemText primary="Countdown" />
          </ListItemButton>
        </MuiLink>
      )}
      {isAppEnabled(enabledApps, 'notes') && (
        <MuiLink component={Link} to="/notes" underline="none">
          <ListItemButton>
            <ListItemIcon>
              <ListAlt />
            </ListItemIcon>
            <ListItemText primary="Notes" />
          </ListItemButton>
        </MuiLink>
      )}
      {isAppEnabled(enabledApps, 'watch') && (
        <MuiLink component={Link} to="/watch" underline="none">
          <ListItemButton>
            <ListItemIcon>
              <Tv />
            </ListItemIcon>
            <ListItemText primary="Watch" />
          </ListItemButton>
        </MuiLink>
      )}
      {isAppEnabled(enabledApps, 'world-map') && (
        <MuiLink component={Link} to="/world-map" underline="none">
          <ListItemButton>
            <ListItemIcon>
              <Public />
            </ListItemIcon>
            <ListItemText primary="World map" />
          </ListItemButton>
        </MuiLink>
      )}
      {open ? (
        <ListSubheader component="span"> Family </ListSubheader>
      ) : (
        <Divider
          sx={{
            borderColor: (theme) => theme.palette.primary[theme.palette.mode],
          }}
        />
      )}
      {isAppEnabled(enabledApps, 'transactions') && (
        <MuiLink component={Link} to="/transactions/list" underline="none">
          <ListItemButton>
            <ListItemIcon>
              <Equalizer />
            </ListItemIcon>
            <ListItemText primary="Transactions" />
          </ListItemButton>
        </MuiLink>
      )}
      {isAppEnabled(enabledApps, 'wishlist') && (
        <MuiLink component={Link} to="/wishlist/list" underline="none">
          <ListItemButton>
            <ListItemIcon>
              <CardGiftcard />
            </ListItemIcon>
            <ListItemText primary="Wishlist" />
          </ListItemButton>
        </MuiLink>
      )}
    </List>
  );
};

export default LayoutToolbar;

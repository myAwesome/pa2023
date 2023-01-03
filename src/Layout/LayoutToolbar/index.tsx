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
} from '@mui/icons-material';

type Props = {
  open: boolean;
};

const LayoutToolbar = ({ open }: Props) => {
  return (
    <List>
      {open ? <ListSubheader component="span"> Personal </ListSubheader> : null}
      <MuiLink component={Link} to="/days" underline="none">
        <ListItemButton>
          <ListItemIcon>
            <EventNote />
          </ListItemIcon>
          <ListItemText primary="Days" />
        </ListItemButton>
      </MuiLink>
      <MuiLink component={Link} to="/projects" underline="none">
        <ListItemButton>
          <ListItemIcon>
            <ViewWeek />
          </ListItemIcon>
          <ListItemText primary="Projects" />
        </ListItemButton>
      </MuiLink>
      <MuiLink component={Link} to="/last-time" underline="none">
        <ListItemButton>
          <ListItemIcon>
            <Alarm />
          </ListItemIcon>
          <ListItemText primary="Last Time" />
        </ListItemButton>
      </MuiLink>
      <MuiLink component={Link} to="/countdown" underline="none">
        <ListItemButton>
          <ListItemIcon>
            <HourglassTop />
          </ListItemIcon>
          <ListItemText primary="Countdown" />
        </ListItemButton>
      </MuiLink>
      <MuiLink component={Link} to="/notes" underline="none">
        <ListItemButton>
          <ListItemIcon>
            <ListAlt />
          </ListItemIcon>
          <ListItemText primary="Notes" />
        </ListItemButton>
      </MuiLink>
      <MuiLink component={Link} to="/world-map" underline="none">
        <ListItemButton>
          <ListItemIcon>
            <Public />
          </ListItemIcon>
          <ListItemText primary="World map" />
        </ListItemButton>
      </MuiLink>
      {open ? (
        <ListSubheader component="span"> Family </ListSubheader>
      ) : (
        <Divider
          sx={{
            borderColor: (theme) => theme.palette.primary[theme.palette.mode],
          }}
        />
      )}
      <MuiLink component={Link} to="/transactions/list" underline="none">
        <ListItemButton>
          <ListItemIcon>
            <Equalizer />
          </ListItemIcon>
          <ListItemText primary="Transactions" />
        </ListItemButton>
      </MuiLink>
      <MuiLink component={Link} to="/wishlist/list" underline="none">
        <ListItemButton>
          <ListItemIcon>
            <CardGiftcard />
          </ListItemIcon>
          <ListItemText primary="Wishlist" />
        </ListItemButton>
      </MuiLink>
    </List>
  );
};

export default LayoutToolbar;

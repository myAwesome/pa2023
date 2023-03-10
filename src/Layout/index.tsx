import React, { PropsWithChildren, useContext } from 'react';
import { styled } from '@mui/material/styles';
import { Menu, ChevronLeft, ExitToApp } from '@mui/icons-material';
import {
  IconButton,
  Toolbar,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Divider,
  Drawer as MuiDrawer,
  Container,
  Box,
  Theme,
  CSSObject,
} from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '../shared/api/routes';
import GPhotosContext from '../shared/context/GPhotosContext';
import UIContext from '../shared/context/UIContext';
import LayoutToolbar from './LayoutToolbar';
import TasksInProgress from './TasksInProgress';
import Reminder from './Reminder';

const drawerWidth = 183;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  backgroundImage: `linear-gradient(${
    theme.palette.mode === 'light' ? '#eee' : '#222'
  } 0.1em, transparent 0.1em)`,
  backgroundSize: '100% 1.2em',
  borderRight: `2px solid ${theme.palette.primary[theme.palette.mode]}`,
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  backgroundImage: `linear-gradient(${
    theme.palette.mode === 'light' ? '#eee' : '#222'
  } 0.1em, transparent 0.1em)`,
  backgroundSize: '100% 1.2em',
  borderRight: `2px solid ${theme.palette.primary[theme.palette.mode]}`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

const Layout = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = React.useState(false);

  const { handleUserThemeChanged } = useContext(UIContext);
  const { handleUserLoggedOut } = useContext(GPhotosContext);

  useQuery(['user'], () => {
    return getUser().then((data) => {
      handleUserThemeChanged(data.theme);
      return data;
    });
  });

  const handleLogout = () => {
    handleUserLoggedOut();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" open={open}>
        <Toolbar variant="dense">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpen(true)}
            edge="start"
            sx={{
              marginRight: 3,
              ...(open && { display: 'none' }),
            }}
          >
            <Menu />
          </IconButton>
          <TasksInProgress />
          <Reminder />
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={() => setOpen(false)}>
            <ChevronLeft />
          </IconButton>
        </DrawerHeader>
        <LayoutToolbar open={open} />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
          }}
        >
          <Divider
            sx={{
              borderColor: (theme) => theme.palette.primary[theme.palette.mode],
            }}
          />
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          backgroundImage: (theme) =>
            `linear-gradient(${
              theme.palette.mode === 'light' ? '#eee' : '#222'
            } 0.1em, transparent 0.1em)`,
          backgroundSize: '100% 1.2em',
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mb: 4 }}>
          <div>{children}</div>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;

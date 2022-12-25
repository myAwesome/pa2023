import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { styled } from '@mui/material/styles';
import { Menu, ChevronLeft, ExitToApp } from '@mui/icons-material';
import {
  AppBar as MuiAppBar,
  IconButton,
  Toolbar,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Divider,
  Drawer as MuiDrawer,
  CssBaseline,
  ThemeProvider,
  Container,
  Box,
} from '@mui/material';
import { getUser } from '../shared/api/handlers';
import { USER_SIGN_OUT } from '../shared/redux/photosReducer';
import LayoutToolbar from './LayoutToolbar';
import TasksInProgress from './TasksInProgress';
import Reminder from './Reminder';

const drawerWidth = 183;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
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

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
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

const Layout = ({ children }) => {
  const [open, setOpen] = React.useState(false);

  const { userTheme } = useSelector((state) => state.root);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    getUser(dispatch);
  }, [dispatch]);

  const handleLogout = () => {
    dispatch({ type: USER_SIGN_OUT });
    navigate('/auth/login');
  };

  return (
    <ThemeProvider theme={userTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setOpen(true)}
              edge="start"
              sx={{
                marginRight: 36,
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
          <Divider />
          <LayoutToolbar open={open} />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
            }}
          >
            <Divider />
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
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <div>{children}</div>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;

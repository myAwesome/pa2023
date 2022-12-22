import { NavLink, Outlet } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Link as MUILink,
} from '@mui/material';
import React from 'react';
import {
  Alarm,
  CardGiftcard,
  CollectionsBookmark,
  Equalizer,
  EventNote,
  HistoryEdu,
  ListAlt,
  Public,
  ViewWeek,
} from '@mui/icons-material';
import theme from './theme';

const drawerWidth = 230;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        <MUILink component={NavLink} underline="none" to="/days">
          {/*// @ts-ignore */}
          {({ isActive }: { isActive: boolean }) => (
            <ListItemButton selected={isActive}>
              <ListItemIcon>
                <EventNote />
              </ListItemIcon>
              <ListItemText primary="New entry" />
            </ListItemButton>
          )}
        </MUILink>
        <MUILink component={NavLink} underline="none" to="/days/history">
          {/*// @ts-ignore */}
          {({ isActive }: { isActive: boolean }) => (
            <ListItemButton selected={isActive}>
              <ListItemIcon>
                <HistoryEdu />
              </ListItemIcon>
              <ListItemText primary="This day in history" />
            </ListItemButton>
          )}
        </MUILink>
        <MUILink component={NavLink} underline="none" to="/days/all">
          {/*// @ts-ignore */}
          {({ isActive }: { isActive: boolean }) => (
            <ListItemButton selected={isActive}>
              <ListItemIcon>
                <CollectionsBookmark />
              </ListItemIcon>
              <ListItemText primary="All entries" />
            </ListItemButton>
          )}
        </MUILink>
        <Divider />
        <MUILink component={NavLink} underline="none" to="/projects">
          {/*// @ts-ignore */}
          {({ isActive }: { isActive: boolean }) => (
            <ListItemButton selected={isActive}>
              <ListItemIcon>
                <ViewWeek />
              </ListItemIcon>
              <ListItemText primary="Projects" />
            </ListItemButton>
          )}
        </MUILink>
        <MUILink component={NavLink} underline="none" to="/last-time">
          {/*// @ts-ignore */}
          {({ isActive }: { isActive: boolean }) => (
            <ListItemButton selected={isActive}>
              <ListItemIcon>
                <Alarm />
              </ListItemIcon>
              <ListItemText primary="Last Time" />
            </ListItemButton>
          )}
        </MUILink>
        <MUILink component={NavLink} underline="none" to="/notes">
          {/*// @ts-ignore */}
          {({ isActive }: { isActive: boolean }) => (
            <ListItemButton selected={isActive}>
              <ListItemIcon>
                <ListAlt />
              </ListItemIcon>
              <ListItemText primary="Notes" />
            </ListItemButton>
          )}
        </MUILink>
        <MUILink component={NavLink} underline="none" to="/world-map">
          {/*// @ts-ignore */}
          {({ isActive }: { isActive: boolean }) => (
            <ListItemButton selected={isActive}>
              <ListItemIcon>
                <Public />
              </ListItemIcon>
              <ListItemText primary="World map" />
            </ListItemButton>
          )}
        </MUILink>
        <Divider />
        <MUILink component={NavLink} underline="none" to="/transactions">
          {/*// @ts-ignore */}
          {({ isActive }: { isActive: boolean }) => (
            <ListItemButton selected={isActive}>
              <ListItemIcon>
                <Equalizer />
              </ListItemIcon>
              <ListItemText primary="Transactions" />
            </ListItemButton>
          )}
        </MUILink>
        <MUILink component={NavLink} underline="none" to="/wishlist">
          {/*// @ts-ignore */}
          {({ isActive }: { isActive: boolean }) => (
            <ListItemButton selected={isActive}>
              <ListItemIcon>
                <CardGiftcard />
              </ListItemIcon>
              <ListItemText primary="Wishlist" />
            </ListItemButton>
          )}
        </MUILink>
      </List>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar variant="dense">
            <Typography variant="h6" color="inherit" component="div">
              Photos
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="mailbox folders"
        >
          <Drawer
            container={document.body}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;

import React from 'react'
import PropTypes from 'prop-types'
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Home as HomeIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const drawerWidth = 240

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'isMobile',
})(({ theme, open, isMobile }) => ({
  flexShrink: 0,
  whiteSpace: 'nowrap',
  '& .MuiDrawer-paper': {
    position: 'fixed',
    width: isMobile ? '100%' : drawerWidth,
    height: isMobile ? 'auto' : 'calc(100% - 64px)',
    maxHeight: isMobile ? '130px' : 'none',
    boxSizing: 'border-box',
    top: 64,
    borderRight: isMobile ? 'none' : `1px solid ${theme.palette.divider}`,
    borderBottom: isMobile ? `1px solid ${theme.palette.divider}` : 'none',
    overflowX: 'hidden',
    transition: theme.transitions.create(['transform'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    ...(!open && {
      transform: isMobile
        ? 'translateY(-100%)'
        : `translateX(-${drawerWidth}px)`,
      visibility: 'hidden',
    }),
  },
  '& .MuiBackdrop-root': {
    display: 'none',
  },
}))

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Eventos', icon: <EventIcon />, path: '/eventos' },
    { text: 'Notificaciones', icon: <NotificationsIcon />, path: '/notificaciones' },
  ]

  const handleNavigation = (path) => {
    navigate(path)
    if (isMobile) onClose()
  }

  return (
    <StyledDrawer
      variant="persistent"
      anchor={isMobile ? 'top' : 'left'}
      open={open}
      hideBackdrop
      isMobile={isMobile}
      ModalProps={{
        keepMounted: true,
        disablePortal: true,
        hideBackdrop: true,
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </StyledDrawer>
  )
}

Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}

export default Sidebar

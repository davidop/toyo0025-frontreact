import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box, ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material'
import { createAppTheme } from './theme'
import Dashboard from './pages/Dashboard'
import Eventos from './pages/Eventos'
import CreateEvent from './pages/createEvent'
import EditEvent from './pages/EditEvent'
import SubEvents from './pages/SubEvents'
import CreateSubEvent from './pages/createSubevent'
import EditSubEvent from './pages/editSubevent'
import Home from './pages/Home'
import Notificaciones from './pages/Notificaciones'
import Sidebar from './components/Layout/Sidebar'
import Navbar from './components/Layout/Navbar'

const drawerWidth = 240
const App = () => {
  const theme = createAppTheme('light')
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'))
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop)

  useEffect(() => {
    setSidebarOpen(isDesktop)
  }, [isDesktop])



  const handleDrawerOpen = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleDrawerClose = () => {
    setSidebarOpen(false)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          overflowX: 'hidden',
        }}
      >
        <>
          <Navbar
            onMenuClick={handleDrawerOpen}
            isDrawerOpen={sidebarOpen}
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1,
              width: '100%',
              position: 'fixed',
            }}
          />
          <Sidebar open={sidebarOpen} onClose={handleDrawerClose} />
        </>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: '100%',
            minHeight: '100vh',
            bgcolor: 'background.default',
            mt: '64px',
            transition: (theme) =>
              theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            [theme.breakpoints.up('sm')]: {
              ...(sidebarOpen && {
                width: `calc(100% - ${drawerWidth}px)`,
                marginLeft: `${drawerWidth}px`,
              }),
            },
            [theme.breakpoints.down('sm')]: {
              ...(sidebarOpen && {
                marginTop: '180px',
              }),
            },
            overflowX: 'hidden',
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/eventos/crear" element={<CreateEvent />} />
            <Route path="/eventos/crear/completo" element={<CreateSubEvent />} />
            <Route path="/eventos/edit/:id" element={<EditEvent />} />
            <Route path="/eventos/:id/subeventos" element={<SubEvents />} />
            <Route path="/eventos/:id/subeventos/crear" element={<CreateSubEvent />} />
            <Route path="/eventos/:id/subeventos/edit/:subeventId" element={<EditSubEvent />} />
            <Route path="/notificaciones" element={<Notificaciones />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App

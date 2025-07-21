import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Box,
  styled,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Logo from '../../assets/icons/Logo'
import MenuToggleIcon from './MenuToggleIcon'

const LogoWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginRight: '8px',
})

const StyledLogo = styled(Logo)({
  width: 28,
  height: 18,
  color: 'white',
})

const Navbar = ({ onMenuClick, sx, isDrawerOpen }) => {
  const navigate = useNavigate()

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: 1200,
        borderBottom: 'none',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -6,
          left: 0,
          right: 0,
          height: '6px',
          backgroundColor: '#E60012',
        },
        ...sx,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuToggleIcon isOpen={isDrawerOpen} />
        </IconButton>
        <LogoWrapper>
          <StyledLogo />
        </LogoWrapper>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            color: 'white',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/dashboard')}
        >
          Administración Eventos Toyota
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Avatar
          sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
        >
          U
        </Avatar>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar

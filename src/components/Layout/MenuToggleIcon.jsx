import React from 'react'
import { Box, styled } from '@mui/material'

const Line = styled('div')(({ theme, isOpen, position }) => ({
  width: '20px',
  height: '2px',
  backgroundColor: 'white',
  position: 'absolute',
  transformOrigin: 'center',
  transition: theme.transitions.create(['transform', 'opacity'], {
    duration: theme.transitions.duration.complex,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    delay: position === 'top' ? 0 : position === 'middle' ? 50 : 100, // Stagger effect
  }),
  ...(position === 'top' && {
    top: '6px',
    transform: isOpen
      ? 'rotate(45deg) translate(5px, 5px) scaleX(1.2)'
      : 'scaleX(1)',
  }),
  ...(position === 'middle' && {
    top: '11px',
    opacity: isOpen ? 0 : 1,
    transform: isOpen ? 'scaleX(0)' : 'scaleX(1)',
  }),
  ...(position === 'bottom' && {
    top: '16px',
    transform: isOpen
      ? 'rotate(-45deg) translate(5px, -5px) scaleX(1.2)'
      : 'scaleX(1)',
  }),
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 20,
  height: 24,
  cursor: 'pointer',
  '&:hover': {
    '& > div': {
      backgroundColor: theme.palette.primary.light,
      transform: (props) => {
        if (props.isOpen) return // No alterar si está abierto
        return props.position === 'top'
          ? 'scaleX(1.2)'
          : props.position === 'middle'
            ? 'scaleX(0.8)'
            : 'scaleX(0.6)'
      },
    },
  },
}))

const MenuToggleIcon = ({ isOpen }) => {
  return (
    <IconWrapper>
      <Line isOpen={isOpen} position="top" />
      <Line isOpen={isOpen} position="middle" />
      <Line isOpen={isOpen} position="bottom" />
    </IconWrapper>
  )
}

export default MenuToggleIcon

"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Box, Button, TextField, Typography } from '@mui/material';
import { auth } from '@/firebase';

const loginContainerStyle = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  bgcolor: 'white', // Background color matching the app
};

const loginBoxStyle = {
  width: '90%',
  maxWidth: 400,
  bgcolor: 'white',
  p: 4,
  borderRadius: 2,
  border: '1px solid #f5e0d1', // Nude color border
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

const buttonStyle = {
  mt: 2,
  bgcolor: '#f5e0d1', // Nude color for the button background
  color: '#000000', // Text color on the button
  '&:hover': {
    bgcolor: '#e0c4b0', // Slightly darker nude color on hover
  },
};

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Box sx={loginContainerStyle}>
      <Box sx={loginBoxStyle}>
        <Typography variant="h4" textAlign="center">Login</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          sx={buttonStyle}
        >
          Login
        </Button>
        <Typography variant="body2" textAlign="center">
          Don't have an account? <Button variant="text" color="primary" onClick={() => console.log('Redirect to register')}>Register</Button>
        </Typography>
      </Box>
    </Box>
  );
}

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Login, PersonAdd } from '@mui/icons-material';
import { postModel } from '../../lib/fetchModelData';
import './styles.css';

function LoginRegister({ onLogin }) {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Login state
  const [loginForm, setLoginForm] = useState({
    login_name: '',
    password: ''
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Registration state
  const [registerForm, setRegisterForm] = useState({
    login_name: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    location: '',
    description: '',
    occupation: ''
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleLoginChange = (field) => (e) => {
    setLoginForm(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleRegisterChange = (field) => (e) => {
    setRegisterForm(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!loginForm.login_name.trim()) {
      setError('Please enter a login name');
      return;
    }
    
    if (!loginForm.password.trim()) {
      setError('Please enter a password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await postModel('/admin/login', {
        login_name: loginForm.login_name.trim(),
        password: loginForm.password.trim()
      });
      onLogin(response);
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = ['login_name', 'password', 'confirmPassword', 'first_name', 'last_name'];
    for (const field of requiredFields) {
      if (!registerForm[field].trim()) {
        setError(`${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`);
        return;
      }
    }
    
    // Password match validation
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const registrationData = {
        login_name: registerForm.login_name.trim(),
        password: registerForm.password.trim(),
        first_name: registerForm.first_name.trim(),
        last_name: registerForm.last_name.trim(),
        location: registerForm.location.trim(),
        description: registerForm.description.trim(),
        occupation: registerForm.occupation.trim()
      };

      const response = await postModel('/user', registrationData);
      
      setSuccess('Registration successful! You can now log in with your credentials.');
      
      // Clear form
      setRegisterForm({
        login_name: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        location: '',
        description: '',
        occupation: ''
      });
      
      // Switch to login tab after a delay
      setTimeout(() => {
        setTabValue(0);
        setSuccess('');
      }, 3000);
      
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      className="login-container"
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      sx={{ 
        padding: 2
      }}
    >
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent sx={{ padding: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            Photo Sharing App
          </Typography>
          
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered
            sx={{ mb: 3 }}
          >
            <Tab icon={<Login />} label="Login" />
            <Tab icon={<PersonAdd />} label="Register" />
          </Tabs>

          {/* Login Tab */}
          {tabValue === 0 && (
            <Box component="form" onSubmit={handleLogin}>
              <Typography variant="body1" gutterBottom align="center" color="textSecondary" sx={{ mb: 3 }}>
                Please log in to continue
              </Typography>
              
              <TextField
                fullWidth
                label="Login Name"
                onChange={handleLoginChange('login_name')}
                placeholder="Enter your login name"
                disabled={isLoading}
                autoFocus
                autoComplete='off'
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                type={showLoginPassword ? 'text' : 'password'}
                label="Password"
                onChange={handleLoginChange('password')}
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete='off'
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        edge="end"
                      >
                        {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Button 
                type="submit" 
                variant="contained"
                fullWidth
                size="large"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <Login />}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </Box>
          )}

          {/* Registration Tab */}
          {tabValue === 1 && (
            <Box component="form" onSubmit={handleRegister}>
              <Typography variant="body1" gutterBottom align="center" color="textSecondary" sx={{ mb: 3 }}>
                Create a new account
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Login Name*"
                    value={registerForm.login_name}
                    onChange={handleRegisterChange('login_name')}
                    placeholder="Choose a unique login name"
                    disabled={isLoading}
                    autoFocus
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name*"
                    value={registerForm.first_name}
                    onChange={handleRegisterChange('first_name')}
                    placeholder="Enter your first name"
                    disabled={isLoading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name*"
                    value={registerForm.last_name}
                    onChange={handleRegisterChange('last_name')}
                    placeholder="Enter your last name"
                    disabled={isLoading}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type={showRegisterPassword ? 'text' : 'password'}
                    label="Password*"
                    value={registerForm.password}
                    onChange={handleRegisterChange('password')}
                    placeholder="Choose a strong password"
                    disabled={isLoading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            edge="end"
                          >
                            {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password*"
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange('confirmPassword')}
                    placeholder="Re-enter your password"
                    disabled={isLoading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={registerForm.location}
                    onChange={handleRegisterChange('location')}
                    placeholder="Your location (optional)"
                    disabled={isLoading}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Occupation"
                    value={registerForm.occupation}
                    onChange={handleRegisterChange('occupation')}
                    placeholder="Your occupation (optional)"
                    disabled={isLoading}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={registerForm.description}
                    onChange={handleRegisterChange('description')}
                    placeholder="Tell us about yourself (optional)"
                    disabled={isLoading}
                  />
                </Grid>
              </Grid>
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {success}
                </Alert>
              )}
              
              <Button 
                type="submit" 
                variant="contained"
                fullWidth
                size="large"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <PersonAdd />}
                sx={{ mt: 3 }}
              >
                {isLoading ? 'Registering...' : 'Register Me'}
              </Button>
              
              <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 2 }}>
                * Required fields
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginRegister; 
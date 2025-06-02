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
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { postModel } from '../../lib/fetchModelData';
import './styles.css';

function LoginRegister({ onLogin }) {
  const [loginName, setLoginName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!loginName.trim()) {
      setError('Please enter a login name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await postModel('/admin/login', { login_name: loginName.trim() });
      onLogin(response);
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const availableLogins = [
    'aprilludgate',
    'ellenripley', 
    'ianmalcolm',
    'johnousterhout',
    'peregrintook',
    'reykenobi'
  ];

  return (
    <Box 
      className="login-container"
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ padding: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            Photo Sharing App
          </Typography>
          <Typography variant="body1" gutterBottom align="center" color="textSecondary" sx={{ mb: 3 }}>
            Please log in to continue
          </Typography>
          
          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Login Name"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              placeholder="Enter your login name"
              disabled={isLoading}
              autoFocus
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
              sx={{ mb: 3 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </Box>
          
          <Box>
            <Typography variant="h6" gutterBottom>
              Available login names:
            </Typography>
            <List dense>
              {availableLogins.map((login, index) => (
                <React.Fragment key={login}>
                  <ListItem 
                    button 
                    onClick={() => setLoginName(login)}
                    sx={{ 
                      borderRadius: 1,
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <ListItemText 
                      primary={login}
                      sx={{ 
                        '& .MuiListItemText-primary': { 
                          fontFamily: 'monospace',
                          fontSize: '0.9rem'
                        }
                      }}
                    />
                  </ListItem>
                  {index < availableLogins.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginRegister; 
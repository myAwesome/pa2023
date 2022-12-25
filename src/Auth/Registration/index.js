import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Grid, TextField } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import VisibleIcon from '@mui/icons-material/VisibilityOutlined';
import NotVisibleIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useNavigate } from 'react-router';
import { sendRegistration } from '../../shared/api/routes';
import { setItemToStorage, TOKEN_KEY } from '../../shared/utils/storage';
import ErrorSnackbar from '../../shared/components/ErrorSnackbar';

const RegistrationPage = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [visible, setVisible] = React.useState(false);
  const [visible2, setVisible2] = React.useState(false);
  const [error, setError] = React.useState('');
  const navigate = useNavigate();
  const handleSubmit = () => {
    if (password === confirmPassword) {
      sendRegistration({ email, password, theme: '{mode:"dark"}' })
        .then((resp) => {
          setItemToStorage(TOKEN_KEY, resp.data.Token);
          navigate('/days');
        })
        .catch((err) => {
          setError(err.message);
        });
    } else {
      setError("Passwords don't match!");
    }
  };

  const handleClose = () => {
    setError('');
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{
        flex: 1,
        height: '100vh',
        '& a': {
          color: 'grey',
          textDecoration: 'none',
        },
      }}
    >
      <ErrorSnackbar handleClose={handleClose} error={error} />
      <form onSubmit={(e) => e.preventDefault()}>
        <Grid
          item
          container
          direction="column"
          spacing={2}
          sx={{
            width: 300,
          }}
        >
          <Grid item>
            <TextField
              label="Email"
              variant="standard"
              fullWidth
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>
          <Grid item>
            <TextField
              label="Password"
              variant="standard"
              type={visible ? 'text' : 'password'}
              fullWidth
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment
                    position="end"
                    sx={{
                      cursor: 'pointer',
                    }}
                  >
                    {visible ? (
                      <NotVisibleIcon onClick={() => setVisible(false)} />
                    ) : (
                      <VisibleIcon onClick={() => setVisible(true)} />
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item>
            <TextField
              label="Confirm Password"
              type={visible2 ? 'text' : 'password'}
              fullWidth
              variant="standard"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment
                    position="end"
                    sx={{
                      cursor: 'pointer',
                    }}
                  >
                    {visible2 ? (
                      <NotVisibleIcon onClick={() => setVisible2(false)} />
                    ) : (
                      <VisibleIcon onClick={() => setVisible2(true)} />
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid
            item
            container
            justifyContent="space-between"
            alignItems="center"
          >
            <Button type="submit" onClick={handleSubmit}>
              Submit
            </Button>
            <Link to="/signin">Login</Link>
          </Grid>
        </Grid>
      </form>
    </Grid>
  );
};

export default RegistrationPage;

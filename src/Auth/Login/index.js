import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router';
import { sendLogin } from '../../shared/api/routes';
import { setItemToStorage, TOKEN_KEY } from '../../shared/utils/storage';
import ErrorSnackbar from '../../shared/components/ErrorSnackbar';

const LoginPage = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    sendLogin({ email, password })
      .then((resp) => {
        setItemToStorage(TOKEN_KEY, resp.data.Token);
        navigate('/days');
      })
      .catch((err) => {
        setError(err.message);
      });
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
      <ErrorSnackbar error={error} handleClose={handleClose} />
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
              fullWidth
              name="email"
              variant="standard"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>
          <Grid item>
            <TextField
              label="Password"
              type="password"
              fullWidth
              name="password"
              variant="standard"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            <Link to="/signup">Register</Link>
          </Grid>
        </Grid>
      </form>
    </Grid>
  );
};

export default LoginPage;

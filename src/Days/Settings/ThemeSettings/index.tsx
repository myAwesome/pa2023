import React, { FormEvent, useContext } from 'react';
import JSONInput from 'react-json-editor-ajrm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Typography, Grid, Button } from '@mui/material';
// @ts-ignore
import locale from 'react-json-editor-ajrm/locale/en';
import { Color, SketchPicker } from 'react-color';
import UIContext from '../../../shared/context/UIContext';
import { putUser } from '../../../shared/api/routes';

const ThemeSettings = () => {
  const { rawUserTheme, userTheme, handleUserThemeChanged } =
    useContext(UIContext);
  const [newTheme, setNewTheme] = React.useState(rawUserTheme);
  const [color, setColor] = React.useState<Color | undefined>();
  const queryClient = useQueryClient();
  const updateMutation = useMutation(
    () => {
      return putUser({ theme: JSON.stringify(newTheme) });
    },
    {
      onSuccess: () => {
        handleUserThemeChanged(newTheme);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['user']);
      },
    },
  );

  React.useEffect(() => {
    setNewTheme(rawUserTheme);
  }, [rawUserTheme]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleChange = (a: any) => {
    console.log('change', a);
    setNewTheme(a.jsObject);
  };

  return (
    <Grid container spacing={2} direction="column">
      <Grid item>
        <Typography variant="h6">Theme:</Typography>
        <SketchPicker color={color} onChange={(c) => setColor(c.rgb)} />
      </Grid>
      <Grid item container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography>Editor:</Typography>
          <JSONInput
            id="a_unique_id"
            locale={locale}
            placeholder={newTheme}
            height="600px"
            onChange={handleChange}
            style={{
              outerBox: { width: '100%' },
              container: { width: '100%' },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography>Full theme:</Typography>
          <JSONInput
            id="a_unique_id_2"
            locale={locale}
            placeholder={userTheme}
            height="600px"
            viewOnly
            style={{
              outerBox: { width: '100%' },
              container: { width: '100%' },
            }}
          />
        </Grid>
      </Grid>
      <Grid item>
        <Button color="primary" variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </Grid>
    </Grid>
  );
};

export default ThemeSettings;

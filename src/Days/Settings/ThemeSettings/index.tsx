import React, { FormEvent } from 'react';
import JSONInput from 'react-json-editor-ajrm';
import { useSelector, useDispatch } from 'react-redux';
import { Typography, Grid, Button } from '@mui/material';
// @ts-ignore
import locale from 'react-json-editor-ajrm/locale/en';
import { Color, SketchPicker } from 'react-color';
import { editUserAction } from '../../../shared/api/handlers';

const ThemeSettings = () => {
  const { rawUserTheme, userTheme } = useSelector(
    (state: { root: any }) => state.root,
  );
  const [newTheme, setNewTheme] = React.useState(rawUserTheme);
  const [color, setColor] = React.useState<Color | undefined>();
  const dispatch = useDispatch();

  React.useEffect(() => {
    setNewTheme(rawUserTheme);
  }, [rawUserTheme]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    editUserAction(dispatch, { data: { theme: JSON.stringify(newTheme) } });
  };

  const handleChange = (a: any) => {
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

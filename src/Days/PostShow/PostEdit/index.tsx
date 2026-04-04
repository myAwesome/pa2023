import React, { FormEvent } from 'react';
import { Box, TextField, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import MarkdownToolbar from '../../../shared/components/MarkdownToolbar';
import MarkdownRenderer from '../../../shared/components/MarkdownRenderer';

type Props = {
  body: string;
  onCancel: () => void;
  handleSubmit: (e: FormEvent, newVal: string) => void;
};

const PostEdit = ({ body, onCancel, handleSubmit }: Props) => {
  const [updatedValue, setUpdatedValue] = React.useState(body);
  const [isPreview, setIsPreview] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement | HTMLInputElement | null>(
    null,
  );

  React.useEffect(() => {
    setUpdatedValue(body);
    setIsPreview(false);
  }, [body]);

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedValue(e.target.value);
  };

  return (
    <form style={{ marginTop: 10 }}>
      <Grid container justifyContent="center">
        <Grid size={12}>
          {isPreview ? (
            <Box
              sx={{
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                minHeight: 120,
                textAlign: 'left',
                padding: 1.5,
              }}
            >
              <MarkdownRenderer body={updatedValue} />
            </Box>
          ) : (
            <TextField
              multiline
              fullWidth
              value={updatedValue}
              variant="standard"
              onChange={handleText}
              inputRef={inputRef}
            />
          )}
          <MarkdownToolbar
            value={updatedValue}
            onChange={setUpdatedValue}
            inputRef={inputRef}
            isPreview={isPreview}
            onTogglePreview={() => setIsPreview((prev) => !prev)}
          />
        </Grid>
        <Grid>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" onClick={(e) => handleSubmit(e, updatedValue)}>
            Submit
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default PostEdit;

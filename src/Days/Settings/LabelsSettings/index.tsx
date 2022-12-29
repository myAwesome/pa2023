import React, { FormEvent } from 'react';
import {
  TextField,
  Button,
  Grid,
  Typography,
  IconButton,
  Popover,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useQuery } from '@tanstack/react-query';
import PostLabel from '../../PostLabel';
import ColorPicker from '../../../shared/components/ColorPicker';
import {
  deleteLabel,
  getLabels,
  postLabel,
  putLabel,
} from '../../../shared/api/routes';
import { useUpdateMutation } from '../../../shared/hooks/useUpdateMutation';
import { useDeleteMutation } from '../../../shared/hooks/useDeleteMutation';
import { useCreateMutation } from '../../../shared/hooks/useCreateMutation';
import { LabelType } from '../../../shared/types';

const LabelsSettings = () => {
  const [activeLabels, setActiveLabels] = React.useState<number[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const [itemToDelete, setItemToDelete] = React.useState<number | null>(null);
  const [isAdd, setIsAdd] = React.useState(false);
  const [newLabelName, setNewLabelName] = React.useState('');
  const [newLabelColor, setNewLabelColor] = React.useState<
    [string, string] | []
  >([]);
  const [isNewLabelActive, setIsNewLabelActive] = React.useState(false);
  const [labelToEdit, setLabelToEdit] = React.useState<number | null>(null);
  const [isEdit, setIsEdit] = React.useState(false);
  const labelsData = useQuery(['labels'], getLabels);

  const editLabelMutation = useUpdateMutation(
    () =>
      putLabel(labelToEdit, {
        name: newLabelName,
        color: newLabelColor[0],
        color_active: newLabelColor[1],
      }),
    ['labels'],
    labelToEdit,
    () => ({
      name: newLabelName,
      color: newLabelColor[0],
      color_active: newLabelColor[1],
    }),
    () => {
      setIsEdit(false);
      setNewLabelName('');
      setNewLabelColor([]);
      setIsNewLabelActive(false);
    },
  );
  const addLabelMutation = useCreateMutation(
    () =>
      postLabel({
        name: newLabelName,
        color: newLabelColor[0],
        color_active: newLabelColor[1],
      }),
    ['labels'],
    (old: LabelType[]) => [
      ...old,
      {
        id: 'new',
        name: newLabelName,
        color: newLabelColor[0],
        color_active: newLabelColor[1],
      },
    ],
  );
  const deleteLabelMutation = useDeleteMutation(
    () => deleteLabel(itemToDelete),
    ['labels'],
    itemToDelete,
  );

  const handleLabelClick = (
    e: React.MouseEvent<HTMLDivElement>,
    isActive: boolean,
    labelId: number,
  ) => {
    const newLabels = isActive
      ? activeLabels.filter((l) => l !== labelId)
      : [...activeLabels, labelId];
    setActiveLabels(newLabels);
    setAnchorEl(e.currentTarget);
    setItemToDelete(labelId);
    setLabelToEdit(labelId);
  };

  const handleLabelEdit = (e: FormEvent) => {
    e.preventDefault();
    editLabelMutation.mutate();
  };

  const handleLabelAdd = (e: FormEvent) => {
    e.preventDefault();
    addLabelMutation.mutate();
  };

  const handleClose = () => {
    setItemToDelete(null);
    setAnchorEl(null);
  };

  const cancelForm = () => {
    setItemToDelete(null);
    setLabelToEdit(null);
    setAnchorEl(null);
    setIsAdd(false);
    setIsEdit(false);
    setNewLabelName('');
    setNewLabelColor([]);
    setIsNewLabelActive(false);
  };

  const handleLabelEditClick = () => {
    const editLabel = labelsData.data.find(
      (l: LabelType) => l.id === labelToEdit,
    );
    setIsEdit(true);
    setIsAdd(false);
    setNewLabelName(editLabel.name);
    setNewLabelColor([editLabel.color, editLabel.color_active]);
  };

  const handleAddClicked = () => {
    setIsAdd(true);
    setIsEdit(false);
    setLabelToEdit(null);
    setNewLabelName('');
    setNewLabelColor([]);
    setIsNewLabelActive(false);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">My labels: </Typography>
        {(labelsData.data || []).map((l: LabelType) => (
          <PostLabel
            key={l.id}
            label={l}
            isActive={activeLabels.includes(l.id)}
            onClick={(e, active) => handleLabelClick(e, active, l.id)}
          />
        ))}
        <IconButton onClick={handleAddClicked}>
          <AddIcon />
        </IconButton>
      </Grid>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <IconButton onClick={() => deleteLabelMutation.mutate()}>
          <DeleteIcon />
        </IconButton>
        <IconButton onClick={handleLabelEditClick}>
          <EditIcon />
        </IconButton>
      </Popover>
      {(isAdd || isEdit) && (
        <Grid item xs={12}>
          <form onSubmit={isAdd ? handleLabelAdd : handleLabelEdit}>
            <Grid container spacing={3} justifyContent="space-between">
              <Grid item>
                <TextField
                  name="labelName"
                  variant="standard"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  label="Name"
                />
              </Grid>
              <Grid item>
                <Typography>Color</Typography>
                <ColorPicker
                  value={newLabelColor}
                  onChange={(val) => setNewLabelColor(val)}
                />
              </Grid>
              <Grid item>
                <Typography>Preview</Typography>
                <PostLabel
                  key="new-label"
                  label={
                    {
                      id: -1,
                      name: newLabelName,
                      color: newLabelColor[0],
                      color_active: newLabelColor[1],
                    } as LabelType
                  }
                  isActive={isNewLabelActive}
                  onClick={() => setIsNewLabelActive(!isNewLabelActive)}
                />
              </Grid>
              <Grid item>
                <Button type="submit" variant="outlined">
                  Submit
                </Button>
                <Button variant="outlined" onClick={cancelForm}>
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      )}
    </Grid>
  );
};

export default LabelsSettings;

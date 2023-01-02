import React from 'react';
import { TextField, Button, Box } from '@mui/material';
import Modal from '@mui/material/Modal';
import { useUpdateMutation } from '../../shared/hooks/useUpdateMutation';
import { editTask } from '../../shared/api/routes';
import { TaskType } from '../../shared/types';

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  task: TaskType | null;
  projectId: string;
};

const AddTIL = ({ isOpen, handleClose, task, projectId }: Props) => {
  const [value, setValue] = React.useState(task ? task.outcome : '');
  const editMutation = useUpdateMutation(
    ({ id, ...values }: TaskType) => editTask(id, values),
    ['tasks', projectId],
    null,
    (val: TaskType) => val,
    handleClose,
    undefined,
    (old: TaskType) => old,
  );

  React.useEffect(() => {
    setValue(task ? task.outcome : '');
  }, [task]);

  const submitTIL = () => {
    editMutation.mutate({
      id: task!.id,
      outcome: value,
      today_i_learned: true,
    });
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <Box
        sx={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',

          position: 'absolute',
          width: 400,
          backgroundColor: (theme) => theme.palette.background.paper,
          border: '2px solid #000',
          boxShadow: (theme) => theme.shadows[5],
          padding: (theme) => theme.spacing(2, 4, 3),
        }}
      >
        <h2 id="simple-modal-title">{task ? task.body : ''}</h2>
        <TextField
          multiline
          name="description"
          fullWidth
          label="Description"
          value={value}
          variant="standard"
          onChange={(e) => setValue(e.target.value)}
        />
        <Button onClick={submitTIL} fullWidth>
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export default AddTIL;

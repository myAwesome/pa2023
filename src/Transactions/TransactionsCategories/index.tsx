import React from 'react';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import {
  deleteTransactionCategory,
  getTransactionsCategories,
  patchTransactionCategory,
  postTransactionsCategories,
} from '../../shared/api/routes';
import { TransactionCategoryType } from '../../shared/types';
import { useCreateMutation } from '../../shared/hooks/useCreateMutation';
import { useUpdateMutation } from '../../shared/hooks/useUpdateMutation';
import { useDeleteMutation } from '../../shared/hooks/useDeleteMutation';
import TransactionsCategoriesCreate from './AddCategory';

const TransactionsCategories = () => {
  const [categoryToEdit, setCategoryToEdit] =
    React.useState<TransactionCategoryType | null>(null);
  const [categoryToDelete, setCategoryToDelete] =
    React.useState<TransactionCategoryType | null>(null);
  const [isAdd, setIsAdd] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const addMutation = useCreateMutation(
    (name) => postTransactionsCategories({ name }),
    ['transactions_categories'],
    (
      old: TransactionCategoryType[],
      val: Omit<TransactionCategoryType, 'id'>,
    ) => [...old, { id: 'new', ...val }],
    () => {
      setIsAdd(false);
    },
  );
  const editMutation = useUpdateMutation(
    (values: TransactionCategoryType) =>
      patchTransactionCategory(categoryToEdit?.id || 0, values),
    ['transactions_categories'],
    categoryToEdit?.id,
    (values: TransactionCategoryType) => values,
    () => {
      setIsEdit(false);
      setIsEdit(false);
      setCategoryToEdit(null);
    },
  );
  const deleteMutation = useDeleteMutation(
    () => deleteTransactionCategory(categoryToDelete?.id || 0),
    ['transactions_categories'],
    categoryToDelete?.id,
    () => {
      setCategoryToDelete(null);
    },
  );

  const handleSubmit = (name: string) => {
    if (isAdd) {
      addMutation.mutate(name);
    } else {
      editMutation.mutate({ name });
    }
  };

  const handleEditClick = (
    e: React.MouseEvent<HTMLDivElement>,
    category: TransactionCategoryType,
  ) => {
    document
      .getElementsByTagName('main')[0]
      ?.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setIsEdit(true);
    setIsAdd(false);
    setCategoryToEdit(category);
  };

  const transCatsData = useQuery(
    ['transactions_categories'],
    getTransactionsCategories,
    {
      initialData: [],
    },
  );

  const handleCancel = () => {
    setIsEdit(false);
    setIsAdd(false);
    setCategoryToDelete(null);
    setCategoryToEdit(null);
  };

  const handleAdd = () => {
    setIsAdd(true);
    setIsEdit(false);
    setCategoryToEdit(null);
  };

  const handleDeleteClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    category: TransactionCategoryType,
  ) => {
    e.stopPropagation();
    setCategoryToDelete(category);
  };

  return (
    <Stack direction="column" gap={4}>
      <Button
        variant="outlined"
        onClick={handleAdd}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add +
      </Button>
      {isAdd || isEdit ? (
        <TransactionsCategoriesCreate
          handleCancel={handleCancel}
          handleSubmit={handleSubmit}
          initialValue={categoryToEdit?.name}
        />
      ) : null}
      <List component="nav">
        {transCatsData.data.map((c: TransactionCategoryType) => (
          <ListItemButton key={c.id} onClick={(e) => handleEditClick(e, c)}>
            <ListItemIcon>{c.id}</ListItemIcon>
            <ListItemText primary={c.name} />
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemIcon>
              <IconButton onClick={(e) => handleDeleteClick(e, c)}>
                <CloseIcon />
              </IconButton>
            </ListItemIcon>
          </ListItemButton>
        ))}
      </List>
      <Dialog
        open={!!categoryToDelete}
        fullScreen={fullScreen}
        onClose={handleCancel}
      >
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete category &quot;
            {categoryToDelete?.name}&quot;?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} variant="outlined">
            Nooo
          </Button>
          <Button onClick={deleteMutation.mutate} variant="contained">
            Yes, delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default TransactionsCategories;

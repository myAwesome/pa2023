import React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useCreateMutation } from '../../../shared/hooks/useCreateMutation';
import { postTransactionsCategories } from '../../../shared/api/routes';
import { TransactionCategoryType } from '../../../shared/types';

const TransactionsCategoriesCreate = () => {
  const [showInput, setShowInput] = React.useState(false);
  const [value, setValue] = React.useState('');
  const addMutation = useCreateMutation(
    () => postTransactionsCategories({ name: value }),
    ['transactions_categories'],
    (
      old: TransactionCategoryType[],
      val: Omit<TransactionCategoryType, 'id'>,
    ) => [...old, { id: 'new', ...val }],
    () => {
      setValue('');
      toggleInput();
    },
  );

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const toggleInput = () => {
    setShowInput(!showInput);
  };

  return (
    <div>
      <Button variant="outlined" onClick={toggleInput}>
        Add +
      </Button>
      {showInput ? (
        <span>
          <TextField
            type="text"
            variant="standard"
            sx={{
              marginLeft: (theme) => theme.spacing(1),
              marginRight: (theme) => theme.spacing(1),
              width: 200,
            }}
            value={value}
            onChange={handleText}
          />
          <Button variant="outlined" onClick={() => addMutation.mutate()}>
            Save
          </Button>
        </span>
      ) : (
        ''
      )}
    </div>
  );
};

export default TransactionsCategoriesCreate;

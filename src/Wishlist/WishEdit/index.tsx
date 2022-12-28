import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import WishForm from '../WishForm';
import { WishType } from '../../shared/types';

type Props = {
  isOpen: boolean;
  wish: WishType | null;
  onSubmit: (val: Omit<WishType, 'is_done' | 'created_at'>) => void;
  handleClose: () => void;
};

const emptyWish = {
  id: '',
  name: '',
  picture: '',
  price_from: 0,
  price_to: 0,
  is_done: false,
  created_at: '',
};

const WishEdit = ({ isOpen, wish, onSubmit, handleClose }: Props) => {
  const [values, setValues] = React.useState(wish || emptyWish);
  React.useEffect(() => {
    setValues(wish || emptyWish);
  }, [wish]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };
  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogContent>
        <WishForm
          values={values}
          handleChange={handleChange}
          onSubmit={(e) => {
            e.preventDefault();
            handleClose();
            const { created_at, ...vals } = values;
            onSubmit({
              ...vals,
              id: wish?.id || '',
              price_from: Number(values.price_from),
              price_to: Number(values.price_to),
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default WishEdit;

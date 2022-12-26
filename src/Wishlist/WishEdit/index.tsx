import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import WishForm from '../WishForm';
import { WishType } from '../../shared/types';

type Props = {
  isOpen: boolean;
  wish: WishType | null;
  onSubmit: (val: WishType) => void;
  handleClose: () => void;
};

const emptyWish = {
  id: '',
  name: '',
  picture: '',
  priceFrom: 0,
  priceTo: 0,
  isDone: false,
  createdAt: '',
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
            onSubmit({
              ...values,
              id: wish?.id || '',
              priceFrom: Number(values.priceFrom),
              priceTo: Number(values.priceTo),
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default WishEdit;

import React from 'react';
import { useNavigate } from 'react-router';
import WishForm from '../WishForm';
import { postWish } from '../../shared/api/routes';
import { useCreateMutation } from '../../shared/hooks/useCreateMutation';
import { WishType } from '../../shared/types';

const initialValues = {
  name: '',
  picture: '',
  price_from: 0,
  price_to: 0,
};

const WishCreate = () => {
  const [values, setValues] =
    React.useState<Omit<WishType, 'id' | 'is_done' | 'created_at'>>(
      initialValues,
    );
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };
  const addWishMutation = useCreateMutation(
    () =>
      postWish({
        ...values,
        price_from: Number(values.price_from),
        price_to: Number(values.price_to),
        user_id: process.env.REACT_APP_USER_ID,
        is_done: false,
      }),
    ['wishes'],
    (old: WishType[]) => [...old, values],
    () => {
      setValues(initialValues);
      navigate('/wishlist/list');
    },
  );
  return (
    <div>
      <WishForm
        onSubmit={(e) => {
          e.preventDefault();
          addWishMutation.mutate();
        }}
        handleChange={handleChange}
        values={values}
      />
    </div>
  );
};

export default WishCreate;

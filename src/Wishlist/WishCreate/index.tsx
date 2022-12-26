import React from 'react';
import { useNavigate } from 'react-router';
import WishForm from '../WishForm';
import { postWish } from '../../shared/api/routes';
import { useCreateMutation } from '../../shared/hooks/useCreateMutation';
import { WishType } from '../../shared/types';

const initialValues = {
  name: '',
  picture: '',
  priceFrom: 0,
  priceTo: 0,
};

const WishCreate = () => {
  const [values, setValues] =
    React.useState<Omit<WishType, 'id' | 'isDone' | 'createdAt'>>(
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
        priceFrom: Number(values.priceFrom),
        priceTo: Number(values.priceTo),
        userId: process.env.REACT_APP_USER_ID,
        createdAt: new Date(),
        isDone: false,
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

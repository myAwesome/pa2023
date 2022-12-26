import React from 'react';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { useQuery } from '@tanstack/react-query';
import { getTransactionsCategories } from '../../shared/api/routes';
import { TransactionCategoryType } from '../../shared/types';
import TransactionsCategoriesCreate from './AddCategory';

const TransactionsCategories = () => {
  const transCatsData = useQuery(
    ['transactions_categories'],
    getTransactionsCategories,
    {
      initialData: [],
    },
  );

  return (
    <div>
      <TransactionsCategoriesCreate />
      <br />
      <List component="nav">
        {transCatsData.data.map((c: TransactionCategoryType) => (
          <ListItemButton key={c.id}>
            <ListItemIcon>{c.id}</ListItemIcon>
            <ListItemText primary={c.name} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );
};

export default TransactionsCategories;

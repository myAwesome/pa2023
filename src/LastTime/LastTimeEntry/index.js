import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import BeenhereIcon from '@mui/icons-material/Beenhere';
import moment from 'moment';
import React from 'react';

const LastTimeEntry = ({ handleItemClicked, handleListItemClick, item }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <ListItem
      button
      onClick={() => handleItemClicked(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ListItemIcon onClick={(e) => handleListItemClick(e, item)}>
        <BeenhereIcon
          color={
            moment().diff(moment(item.date), 'days') >= item.remind_after_days
              ? 'error'
              : 'inherit'
          }
        />
      </ListItemIcon>
      <ListItemText
        primary={item.body}
        secondary={
          isHovered
            ? moment(item.date).format('HH:mm DD/MM/YYYY')
            : moment(item.date).fromNow(true)
        }
      />
    </ListItem>
  );
};

export default LastTimeEntry;

import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import BeenhereIcon from '@mui/icons-material/Beenhere';
import dayjs from 'dayjs';
import React from 'react';
import { LastTimeItemType } from '../../shared/types';

type Props = {
  handleItemClicked: (item: LastTimeItemType) => void;
  item: LastTimeItemType;
  handleListItemClick: (
    e: React.MouseEvent<HTMLDivElement>,
    item: LastTimeItemType,
  ) => void;
};

const LastTimeEntry = ({
  handleItemClicked,
  handleListItemClick,
  item,
}: Props) => {
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <ListItemButton
      onClick={() => handleItemClicked(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ListItemIcon onClick={(e) => handleListItemClick(e, item)}>
        <BeenhereIcon color={item.expired ? 'error' : 'inherit'} />
      </ListItemIcon>
      <ListItemText
        primary={item.body}
        secondary={
          isHovered
            ? dayjs(item.date).utc(true).local().format('HH:mm DD/MM/YYYY')
            : dayjs(item.date).utc(true).local().fromNow()
        }
      />
    </ListItemButton>
  );
};

export default LastTimeEntry;

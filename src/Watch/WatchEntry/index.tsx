import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Rating,
  Stack,
} from '@mui/material';
import BeenhereIcon from '@mui/icons-material/Beenhere';
import dayjs from 'dayjs';
import React from 'react';
import { WatchItemType } from '../../shared/types';

type Props = {
  handleItemClicked: (item: WatchItemType) => void;
  item: WatchItemType;
  handleListItemClick: (
    e: React.MouseEvent<HTMLDivElement>,
    item: WatchItemType,
  ) => void;
};

const WatchEntry = ({
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
        <BeenhereIcon color={item.is_seen ? 'inherit' : 'warning'} />
      </ListItemIcon>
      <ListItemText
        primary={item.name}
        secondary={
          isHovered
            ? dayjs(item.last_seen).utc(true).local().format('HH:mm DD/MM/YYYY')
            : dayjs(item.last_seen).utc(true).local().fromNow()
        }
      />
      <Stack alignItems="center" gap={1}>
        <Rating value={item.rating / 2} size="small" precision={0.5} readOnly />
      </Stack>
    </ListItemButton>
  );
};

export default WatchEntry;

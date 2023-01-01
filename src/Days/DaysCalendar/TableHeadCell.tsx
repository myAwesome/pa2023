import { Typography } from '@mui/material';

const TableHeadCell = ({ text }: { text: string }) => {
  return (
    <td align="center">
      <Typography
        variant="caption"
        sx={{ color: (theme) => theme.palette.text.secondary, padding: 1 }}
      >
        {text}
      </Typography>
    </td>
  );
};

export default TableHeadCell;

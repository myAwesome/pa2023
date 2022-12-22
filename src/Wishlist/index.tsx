import { Typography } from '@mui/material';
import { apiGetWishlist } from '../api';

export async function wishlistLoader() {
  const { data } = await apiGetWishlist();
  return data;
}

const WishlistPage = () => {
  return (
    <div>
      <Typography>WishlistPage</Typography>
    </div>
  );
};

export default WishlistPage;

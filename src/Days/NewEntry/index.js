import PostCreate from '../PostList/PostCreate';
import PostList from '../PostList';

const NewEntry = () => {
  return (
    <>
      <PostCreate />
      <PostList tab="last" />
    </>
  );
};

export default NewEntry;

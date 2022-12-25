export const TRANS_CATEGORIES_LOADED = '@transactions/TRANS_CATEGORIES_LOADED';
export const TRANSACTIONS_LOADED = '@transactions/TRANSACTIONS_LOADED';

const initialState = {
  categories: [],
  transactions: [],
  transactionsByCat: [],
  total: 0,
};

const countSum = (transactions) => {
  let total = 0;
  transactions.forEach((tr) => (total += tr.amount));
  return total;
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case TRANS_CATEGORIES_LOADED:
      const { data } = action.payload;
      const categories = Object.keys(data).map((key) => {
        return {
          id: data[key].id,
          name: data[key].name,
        };
      });
      return { ...state, categories };
    case TRANSACTIONS_LOADED:
      const { data: trData } = action.payload;
      if (trData) {
        const newTransactions = trData.reverse().map((tr) => ({
          ...tr,
          category: state.categories.find((c) => c.id === tr.category)?.name,
        }));
        const newTotal = countSum(newTransactions);
        const newCategoryData = state.categories
          .map((category) => {
            const filtered = newTransactions.filter((tr) => tr.category === category.name);
            const sum = countSum(filtered);
            const percentage = ((sum / newTotal) * 100).toFixed(1);
            return { sum, percentage, category: category.name };
          })
          .sort((a, b) => (a.sum > b.sum ? -1 : 1));
        return {
          ...state,
          total: newTotal,
          transactions: newTransactions,
          transactionsByCat: newCategoryData,
        };
      }
      return state;
    default:
      return state;
  }
};

export default reducer;

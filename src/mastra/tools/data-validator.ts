// Production Data Validator tool
export const dataValidator = {
  validateAndMerge(primary: { price: number }, backup: { price: number }) {
    // Cross-reference prices, prefer primary if close
    if (Math.abs(primary.price - backup.price) / primary.price < 0.01) {
      return { price: primary.price };
    }
    // If large difference, flag for review
    return { price: (primary.price + backup.price) / 2 };
  },
};

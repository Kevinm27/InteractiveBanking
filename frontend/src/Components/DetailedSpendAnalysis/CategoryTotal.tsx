import React from "react";

interface CategoryTotalProps {
  category: string;
}

const CategoryTotal = ({ category }: CategoryTotalProps) => {
  // Calculate the total for the category
  // This is a placeholder, replace this with your actual data source
  const total = 1000;

  return (
    <div>
      <h2>Total: ${total.toFixed(2)}</h2>
    </div>
  );
};

export default CategoryTotal;

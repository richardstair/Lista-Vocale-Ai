
import React from 'react';
import { ShoppingListCategory } from '../types';
import { CategoryIcon } from './icons/CategoryIcon';

interface ShoppingListProps {
  categories: ShoppingListCategory[];
}

const ShoppingList: React.FC<ShoppingListProps> = ({ categories }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-full">
      <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">La Tua Lista della Spesa</h2>
      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={index}>
            <h3 className="text-lg font-semibold text-teal-600 flex items-center gap-2 mb-2">
              <CategoryIcon />
              {category.category}
            </h3>
            <ul className="space-y-2 list-inside pl-2">
              {category.items.map((item, itemIndex) => (
                <li key={itemIndex} className="text-slate-700 flex items-center">
                   <input type="checkbox" className="mr-3 h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                   <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingList;

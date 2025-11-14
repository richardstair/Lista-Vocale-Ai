
import React from 'react';
import { Suggestion, RecipeSuggestion } from '../types';
import { RecipeIcon } from './icons/RecipeIcon';
import { BulbIcon } from './icons/BulbIcon';

interface SuggestionsProps {
  title: string;
  items: Suggestion[];
  type: 'recipe' | 'item';
}

const isRecipe = (item: Suggestion): item is RecipeSuggestion => {
    return (item as RecipeSuggestion).name !== undefined;
}

const Suggestions: React.FC<SuggestionsProps> = ({ title, items, type }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-full">
      <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">{title}</h2>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="p-3 bg-slate-50 rounded-lg">
            {type === 'recipe' && isRecipe(item) ? (
              <div>
                <h4 className="font-semibold text-teal-700 flex items-center gap-2">
                  <RecipeIcon />
                  {item.name}
                </h4>
                <p className="text-sm text-slate-500 ml-6">
                  Ingredienti: {item.ingredients.join(', ')}
                </p>
              </div>
            ) : (
              <p className="text-slate-700 flex items-center gap-2">
                <BulbIcon />
                {String(item)}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Suggestions;

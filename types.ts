
export interface ShoppingListCategory {
  category: string;
  items: string[];
}

export interface RecipeSuggestion {
  name: string;
  ingredients: string[];
}

export type Suggestion = RecipeSuggestion | string;

export interface ShoppingListData {
  shoppingList: ShoppingListCategory[];
  recipeSuggestions: RecipeSuggestion[];
  forgottenItemSuggestions: string[];
}

export enum AppState {
    IDLE,
    LISTENING,
    PROCESSING,
    RESULT,
    ERROR
}

export type MealLite = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strArea?: string;
  strCategory?: string;
};

export type MealDetails = MealLite & {
  strInstructions?: string;
  strYoutube?: string;
  strSource?: string;
  [key: string]: any; // TheMealDB ma pola strIngredient1..20, strMeasure1..20
};

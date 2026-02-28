export interface CategoryType {
  id: number;
  type: string;
}

export interface Categories {
  id: number;
  type: number;
  subtype: string;
  CategoryType: CategoryType | null;   // normalized to a single object
}


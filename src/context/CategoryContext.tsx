import { createContext, useContext, useEffect, useState } from "react";
import {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../libs/ApiGatewayDatasource";

export interface Category {
  categoryId: number;
  categoryName: string;
  categoryDescription: string;
}

interface CategoryContextType {
  categories: Category[];
  refreshCategories: () => Promise<void>;
  createCategory: (data: Partial<Category>) => Promise<void>;
  updateCategoryData: (id: number, data: Partial<Category>) => Promise<void>;
  removeCategory: (id: number) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType>({
  categories: [],
  refreshCategories: async () => {},
  createCategory: async () => {},
  updateCategoryData: async () => {},
  removeCategory: async () => {},
});

export const useCategoryContext = () => useContext(CategoryContext);

export default function CategoryProvider({ children }: any) {
  const [categories, setCategories] = useState<Category[]>([]);

  const refreshCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const createCategory = async (data: Partial<Category>) => {
    await addCategory(data);
    await refreshCategories();
  };

  const updateCategoryData = async (
    id: number,
    data: Partial<Category>
  ) => {
    await updateCategory(id, data);
    await refreshCategories();
  };

  const removeCategory = async (id: number) => {
    await deleteCategory(id);
    await refreshCategories();
  };

  useEffect(() => {
    refreshCategories();
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        refreshCategories,
        createCategory,
        updateCategoryData,
        removeCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

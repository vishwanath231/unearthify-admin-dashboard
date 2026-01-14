import api from "./axios";

export const getAllCategoriesApi = () => api.get("/categories");

export const createCategoryApi = (data: FormData) =>
  api.post("/categories", data);

export const deleteCategoryApi = (id: string) =>
  api.delete(`/categories/${id}`);
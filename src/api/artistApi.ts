import api from "./axios";
import { API } from "./api";

export const getAllArtistsApi = () =>
  api.get(API.ARTIST);

export const createArtistApi = (data: FormData) =>
  api.post("/artists", data);

export const updateArtistApi = (id: string, data: FormData) =>
  api.put(`/artists/${id}`, data);

export const deleteArtistApi = (id: string) =>
  api.delete(`/artists/${id}`);

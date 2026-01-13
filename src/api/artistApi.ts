import axios from "axios";
import { API } from "./api";

export const getAllArtistsApi = () => axios.get(API.ARTIST);

export const createArtistApi = (data: FormData, token: string) =>
  axios.post("/artists", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const updateArtistApi = (id: string, data: FormData, token: string) =>
  axios.put(`/artists/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const deleteArtistApi = (id: string, token: string) =>
  axios.delete(`/artists/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

//   export const toggleFeaturedApi = (id: string, token: string) =>
//   axios.patch(`/artists/${id}/toggle-featured`, {}, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
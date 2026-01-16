/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./axios";

export const getAllEventsApi = () =>
  api.get("/events");

export const getEventByIdApi = (id: string) =>{

    api.get(`/events/${id}`);
}

export const createEventApi = (data: FormData) =>
  api.post("/events", data);

export const updateEventApi = (id: string, data: FormData) =>
  api.put(`/events/${id}`, data);

export const deleteEventApi = (id: string) =>
  api.delete(`/events/${id}`);

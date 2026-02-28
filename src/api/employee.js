import api from "./axios";

export const createEmployee = (data) =>
  api.post("/api/v1/employee", data);

export const getEmployees = (site) =>
  api.get(`/api/v1/employee?site=${site}`);

export const getEmployee = (empNo) =>
  api.get(`/api/v1/employee/${empNo}`);

export const updateEmployee = (empNo, data) =>
  api.put(`/api/v1/employee/${empNo}`, data);

export const deleteEmployee = (empNo) =>
  api.delete(`/api/v1/employee/${empNo}`);

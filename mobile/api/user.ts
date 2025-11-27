import { postData } from "./client";

export const updateNameApi = async (name: string) => {
  return await postData("/api/auth/update-name", { name });
};

export const deleteAccountApi = async (password: string) => {
  return await postData("/api/auth/delete-account", { password });
};

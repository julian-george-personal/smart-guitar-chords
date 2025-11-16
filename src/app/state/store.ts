import { AxiosError } from "axios";
import { getCookie } from "../util";

export const UnknownErrorMessage = "Unknown Server Error";

export type ErrorResponse = {
  error?: string;
};

export type StoreResponse =
  | {
      isError: false;
      errorMessage?: undefined;
      errorCode?: undefined;
    }
  | {
      isError: true;
      errorMessage: string;
      errorCode: number | undefined;
    };

export const apiUrl = `${window.location.protocol}//${window.location.host}/api`;

export const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getCookie("auth")}`,
  },
});

export const toStoreResponse = (error: unknown): StoreResponse => ({
  isError: true,
  errorMessage:
    error instanceof AxiosError ? error.response?.data?.error : UnknownErrorMessage,
  errorCode: error instanceof AxiosError ? error.status : undefined,
});

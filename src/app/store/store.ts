export const UnknownErrorMessage = "Unknown Server Error";

export type ApiResponse = {
  error?: string;
};

export type StoreResponse =
  | {
      isError: false;
      errorMessage?: undefined;
    }
  | {
      isError: true;
      errorMessage: string;
    };

export const apiUrl = import.meta.env.VITE_API_URL;

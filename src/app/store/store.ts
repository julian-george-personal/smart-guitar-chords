export const UnknownErrorMessage = "Unknown Server Error";

export type ErrorResponse = {
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

export const apiUrl = `${window.location.protocol}//${window.location.host}/api`;

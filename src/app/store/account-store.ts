import axios, { Axios, AxiosError, AxiosResponse } from "axios";
import {
  StoreResponse,
  apiUrl,
  ApiResponse,
  UnknownErrorMessage,
} from "./store";

const accountUrl = apiUrl + "/account";

export async function signUp(
  username: string,
  email: string,
  password: string
): Promise<StoreResponse> {
  try {
    const response: AxiosResponse<ApiResponse> = await axios.post(
      accountUrl + "/signup",
      {
        username,
        email,
        password,
      }
    );
    return { isError: false };
  } catch (e) {
    console.log(e);
    return {
      isError: true,
      errorMessage: e instanceof AxiosError ? e.message : UnknownErrorMessage,
    };
  }
}

export function login(username: string, password: string) {}

import axios, { AxiosError } from "axios";
import { StoreResponse, apiUrl, UnknownErrorMessage } from "./store";
import { getCookie } from "../util";

const accountUrl = apiUrl + "/account";

export async function signUp(
  username: string,
  email: string,
  password: string
): Promise<StoreResponse> {
  try {
    await axios.post(accountUrl + "/signup", {
      username,
      email,
      password,
    });
    return { isError: false };
  } catch (e) {
    return {
      isError: true,
      errorMessage: e instanceof AxiosError ? e.message : UnknownErrorMessage,
    };
  }
}

export type LoginResponse = {
  username: string;
  email: string;
  token: string;
};

export async function login(
  username: string,
  password: string
): Promise<StoreResponse & Partial<LoginResponse>> {
  try {
    const { data } = await axios.post<LoginResponse>(
      accountUrl + "/login",
      {
        username,
        password,
      },
      { withCredentials: true }
    );
    return {
      username: data.username,
      email: data.email,
      token: data.token,
      isError: false,
    };
  } catch (e) {
    return {
      isError: true,
      errorMessage: e instanceof AxiosError ? e.message : UnknownErrorMessage,
    };
  }
}

export type GetUserResponse = {
  username: string;
  email: string;
};

export async function getUser(): Promise<
  StoreResponse & Partial<LoginResponse>
> {
  try {
    var { data } = await axios.get<GetUserResponse>(accountUrl + "/get", {
      headers: {
        Authorization: `Bearer ${getCookie("auth")}`,
      },
    });
    return { username: data.username, email: data.email, isError: false };
  } catch (e) {
    return {
      isError: true,
      errorMessage: e instanceof AxiosError ? e.message : UnknownErrorMessage,
    };
  }
}

export async function logout(): Promise<StoreResponse> {
  try {
    await axios.delete(accountUrl + "/logout");
    return { isError: false };
  } catch (e) {
    return {
      isError: true,
      errorMessage: e instanceof AxiosError ? e.message : UnknownErrorMessage,
    };
  }
}

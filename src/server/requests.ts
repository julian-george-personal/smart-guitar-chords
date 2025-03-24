export type TCreateAccountRequest = {
  username: string;
  email: string;
  password: string;
};

export type TLoginRequest = {
  username: string;
  password: string;
};

export type TLoginResponse = {
  username: string;
  email: string;
  token: string;
};

export type TGetAccountResponse = {
  username: string;
  email: string;
};

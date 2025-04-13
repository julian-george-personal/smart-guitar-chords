import {
  signup,
  AccountStatus,
  login,
  setNewPassword,
  recoverPassword,
  getAccount,
} from "./account-service";
import {
  TCreateAccountRequest,
  TGetAccountRequest,
  TLoginRequest,
  TRecoverPasswordRequest,
  TSetNewPasswordRequest,
} from "./account-requests";
import { verifyAuthorization } from "../clients/auth-client";
import { TRoutes } from "../types";

function addCookieHeader(res: Response, token: string | null) {
  if (token) {
    res.headers.set("Set-Cookie", `auth=${token}; SameSite=Strict; Path=/`);
  } else {
    res.headers.set(
      "Set-Cookie",
      "auth=; SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    );
  }
  return res;
}

const accountRoutes: TRoutes = {
  "/api/account/signup": {
    POST: async (req) => {
      const request = (await req.json()) as TCreateAccountRequest;
      const [status, error] = await signup(request);
      let response;
      switch (status) {
        case AccountStatus.Success:
          response = Response.json({}, { status: 200 });
          break;
        case AccountStatus.InvalidRequest:
          response = Response.json(
            { error },
            { status: 400, statusText: error?.toString() }
          );
          break;
        default:
          response = Response.json({}, { status: 500 });
          break;
      }
      return response;
    },
  },
  "/api/account/login": {
    POST: async (req) => {
      const request = (await req.json()) as TLoginRequest;
      const [loginResponse, status] = await login(request);
      let response: Response;
      switch (status) {
        case AccountStatus.Success:
          response = Response.json(loginResponse, { status: 200 });
          break;
        case AccountStatus.InvalidRequest:
          response = Response.json({}, { status: 400 });
          break;
        default:
          response = Response.json({}, { status: 500 });
          break;
      }
      if (loginResponse?.token) {
        response = addCookieHeader(response, loginResponse.token);
      }
      return response;
    },
  },
  "/api/account/get": {
    GET: async (req) => {
      const authorizedUsername = verifyAuthorization(req);
      const [accountInfo, status] = await getAccount(authorizedUsername);
      let response;
      switch (status) {
        case AccountStatus.Success:
          response = Response.json(accountInfo, { status: 200 });
          break;
        case AccountStatus.InvalidRequest:
          response = Response.json({}, { status: 400 });
          break;
        default:
          response = Response.json({}, { status: 500 });
          break;
      }
      return response;
    },
  },
  "/api/account/logout": {
    DELETE: async (req) => {
      let response = new Response(null, { status: 200 });
      response = addCookieHeader(response, null);
      return response;
    },
  },
  "/api/account/recoverPassword": {
    POST: async (req) => {
      const request = (await req.json()) as TRecoverPasswordRequest;
      const [status, error] = await recoverPassword(request);
      let response;
      switch (status) {
        case AccountStatus.Success:
          response = Response.json({}, { status: 200 });
          break;
        case AccountStatus.InvalidRequest:
          response = Response.json(
            { error },
            { status: 400, statusText: error?.toString() }
          );
          break;
        default:
          response = Response.json({}, { status: 500 });
          break;
      }
      return response;
    },
  },
  "/api/account/setNewPassword": {
    POST: async (req) => {
      const request = (await req.json()) as TSetNewPasswordRequest;
      const [status, error] = await setNewPassword(request);
      let response;
      switch (status) {
        case AccountStatus.Success:
          response = Response.json({}, { status: 200 });
          break;
        case AccountStatus.InvalidRequest:
          response = Response.json(
            { error },
            { status: 400, statusText: error?.toString() }
          );
          break;
        case AccountStatus.InvalidToken:
          response = Response.json({}, { status: 400 });
          break;
        case AccountStatus.UnknownError:
          response = Response.json({}, { status: 500 });
          break;
      }
      return response;
    },
  },
};

export default accountRoutes;

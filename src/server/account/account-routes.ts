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
      switch (status) {
        case AccountStatus.Success:
          return Response.json({}, { status: 200 });
        case AccountStatus.InvalidRequest:
          return Response.json(
            { error },
            { status: 400, statusText: error?.toString() }
          );
        default:
          return Response.json({}, { status: 500 });
      }
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
      switch (status) {
        case AccountStatus.Success:
          return Response.json({}, { status: 200 });
        case AccountStatus.InvalidRequest:
          return Response.json(
            { error },
            { status: 400, statusText: error?.toString() }
          );
        default:
          return Response.json({}, { status: 500 });
      }
    },
  },
  "/api/account/setNewPassword": {
    POST: async (req) => {
      const request = (await req.json()) as TSetNewPasswordRequest;
      const [status, error] = await setNewPassword(request);
      switch (status) {
        case AccountStatus.Success:
          return Response.json({}, { status: 200 });
        case AccountStatus.InvalidRequest:
          return Response.json(
            { error },
            { status: 400, statusText: error?.toString() }
          );
        default:
          return Response.json({}, { status: 500 });
      }
    },
  },
};

export default accountRoutes;

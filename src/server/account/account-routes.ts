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
        case AccountStatus.Conflict:
          return Response.json(
            { error },
            { status: 409, statusText: error?.toString() }
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
      switch (status) {
        case AccountStatus.Success:
          return addCookieHeader(
            Response.json(loginResponse, { status: 200 }),
            loginResponse?.token as string
          );
        case AccountStatus.InvalidRequest:
          return Response.json({}, { status: 400 });
        case AccountStatus.NotFound:
          return Response.json({}, { status: 404 });
        default:
          return Response.json({}, { status: 500 });
      }
    },
  },
  "/api/account/get": {
    GET: async (req) => {
      const authorizedUsername = verifyAuthorization(req);
      const [accountInfo, status] = await getAccount(authorizedUsername);
      switch (status) {
        case AccountStatus.Success:
          return Response.json(accountInfo, { status: 200 });
        case AccountStatus.InvalidRequest:
          return Response.json({}, { status: 400 });
        default:
          return Response.json({}, { status: 500 });
      }
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

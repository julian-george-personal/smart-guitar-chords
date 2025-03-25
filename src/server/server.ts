import Bun from "bun";
import {
  signup,
  AccountStatus,
  login,
  setNewPassword,
} from "./account-service";
import {
  TCreateAccountRequest,
  TLoginRequest,
  TSetNewPasswordRequest,
} from "./requests";
import { verifyToken } from "./auth-client";
import { getAccountByUsername } from "./dynamo-client";

const port = 3000;

const processResponse = (res: Response, setCookie?: string | null) => {
  // res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.headers.set("Access-Control-Allow-Credentials", "true");
  if (setCookie) {
    res.headers.set("Set-Cookie", `auth=${setCookie}; SameSite=Strict; Path=/`);
  } else if (setCookie === null) {
    res.headers.set(
      "Set-Cookie",
      `auth=; SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    );
  }

  return res;
};

const verifyAuthorization = (req: Bun.BunRequest): string | null => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    return verifyToken<{ username: string }>(token)?.username ?? null;
  } catch (err) {
    return null;
  }
};

Bun.serve({
  routes: {
    "/api/account/signup": {
      POST: async (req) => {
        const request: TCreateAccountRequest = await req.json();
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
          case AccountStatus.UnknownError:
            response = Response.json({}, { status: 500 });
            break;
        }
        return processResponse(response);
      },
    },
    "/api/account/login": {
      POST: async (req) => {
        const request: TLoginRequest = await req.json();
        const [loginResponse, status] = await login(request);
        let response;
        switch (status) {
          case AccountStatus.Success:
            response = Response.json(loginResponse, { status: 200 });
            break;
          case AccountStatus.InvalidRequest:
            response = Response.json({}, { status: 400 });
            break;
          case AccountStatus.UnknownError:
            response = Response.json({}, { status: 500 });
            break;
        }
        return processResponse(response, loginResponse?.token);
      },
    },
    "/api/account/get": {
      GET: async (req) => {
        const authorizedUsername = verifyAuthorization(req);
        let response;
        if (!authorizedUsername) {
          response = Response.json({}, { status: 401 });
        } else {
          const account = await getAccountByUsername(authorizedUsername);
          response = Response.json(account, { status: 200 });
        }
        return processResponse(response, authorizedUsername ? undefined : null);
      },
    },
    "/api/account/logout": {
      DELETE: async (req) => {
        return processResponse(Response.json({}, { status: 200 }), null);
      },
    },
    "/api/account/setNewPassword": {
      POST: async (req) => {
        const request: TSetNewPasswordRequest = await req.json();
        const [status] = await setNewPassword(request);
        let response;
        switch (status) {
          case AccountStatus.Success:
            response = Response.json({}, { status: 200 });
          case AccountStatus.InvalidRequest:
          case AccountStatus.InvalidToken:
            response = Response.json({}, { status: 400 });
            break;
          case AccountStatus.UnknownError:
            response = Response.json({}, { status: 500 });
            break;
        }
        return processResponse(response);
      },
    },
    "/*": {
      OPTIONS: async (req) => {
        return processResponse(new Response(null, { status: 200 }));
      },
    },
  },
  fetch(req) {
    const url = new URL(req.url);
    return new Response(
      Bun.file(`./dist${url.pathname === "/" ? "/index.html" : url.pathname}`)
    );
  },
  port,
});

console.log("server.ts listening on port", port);

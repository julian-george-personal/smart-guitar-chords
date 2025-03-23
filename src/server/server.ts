import Bun from "bun";
import { signup, CreateAccountStatus } from "./account-service";
import { TCreateAccountRequest } from "./requests";
import cors from "cors";

const port = 3000;

const processResponse = (res: Response) => {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return res;
};

Bun.serve({
  routes: {
    "/api/account/signup": {
      POST: async (req) => {
        const request: TCreateAccountRequest = await req.json();
        const [status, error] = await signup(request);
        let response;
        switch (status) {
          case CreateAccountStatus.Success:
            response = Response.json({}, { status: 200 });
            break;
          case CreateAccountStatus.InvalidRequest:
            response = Response.json({ error }, { status: 400 });
            break;
          case CreateAccountStatus.UnknownError:
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

  // fetch(req) {
  //   const url = new URL(req.url);
  //   return new Response(
  //     Bun.file(`./dist${url.pathname === "/" ? "/index.html" : url.pathname}`)
  //   );
  // },
  port,
});

console.log("server.ts listening on port", port);

import Bun from "bun";
import { createAccount, CreateAccountStatus } from "./account-service";
import { TCreateAccountRequest } from "./requests";

const port = 3000;

Bun.serve({
  routes: {
    "/api/account/create/": {
      POST: async (req) => {
        const request: TCreateAccountRequest = await req.json();
        const [status, error] = await createAccount(request);
        switch (status) {
          case CreateAccountStatus.Success:
            return Response.json({}, { status: 200 });
          case CreateAccountStatus.InvalidRequest:
            return Response.json({ error }, { status: 400 });
          case CreateAccountStatus.UnknownError:
            return Response.json({}, { status: 500 });
        }
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

import Bun from "bun";
import config, { Environment } from "./config";

const port = config.port;

const processResponse = (res: Response, setCookie?: string | null) => {
  res.headers.set("Access-Control-Allow-Origin", "*");
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

// TODO: this needs top-level try-catch for 500s
Bun.serve({
  routes: {
    "/*": {
      OPTIONS: async (req) => {
        return processResponse(new Response(null, { status: 200 }));
      },
    },
  },
  async fetch(req) {
    const url = new URL(req.url);
    try {
      if (config.environment == Environment.Local) {
        const viteUrl = new URL(
          url.pathname + url.search,
          "http://localhost:5173"
        );
        // Forward the original request method, headers, and body to Vite
        const viteResponse = await fetch(viteUrl, {
          method: req.method,
          headers: req.headers,
          body: req.body,
        });

        // Return the Vite response, preserving status code and headers
        return new Response(viteResponse.body, {
          status: viteResponse.status,
          headers: viteResponse.headers,
        });
      } else if (config.environment == Environment.Production) {
        return new Response(
          Bun.file(
            `./dist${url.pathname === "/" ? "/index.html" : url.pathname}`
          )
        );
      }
    } catch (e) {
      console.log(e);
      return new Response(null, { status: 404 });
    }
  },
  port,
});

console.log("server.ts listening on port", port);

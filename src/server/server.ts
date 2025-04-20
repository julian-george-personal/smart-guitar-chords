import Bun from "bun";
import config, { Environment } from "./config";
import accountRoutes from "./account/account-routes";
import { TRoutes } from "./types";
import songRoutes from "./song/song-routes";

const port = config.port;

function addCorsHeaders(res: Response): Response {
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

  return res;
}

function processResponse(res: Response): Response {
  res = addCorsHeaders(res);
  return res;
}

function addResponseMiddleware(routes: TRoutes) {
  const newRoutes: TRoutes = {};
  Object.keys(routes).forEach((url) => {
    newRoutes[url] = {};
    Object.keys(routes[url]).forEach((verb) => {
      newRoutes[url][verb] = async (req) =>
        processResponse(await routes[url][verb](req));
    });
  });
  return newRoutes;
}

// TODO: this needs top-level try-catch for 500s
Bun.serve({
  routes: {
    ...addResponseMiddleware(accountRoutes),
    ...addResponseMiddleware(songRoutes),
    "/*": {
      OPTIONS: async (req) => {
        return addCorsHeaders(new Response(null, { status: 200 }));
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
        return new Response(await viteResponse.text(), {
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
      throw new Error();
    } catch (e) {
      console.log(e);
      return new Response(null, { status: 404 });
    }
  },
  port,
});

console.log("server.ts listening on port", port);

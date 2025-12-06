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
      OPTIONS: async (_req) => {
        return addCorsHeaders(new Response(null, { status: 200 }));
      },
    },
  },
  async fetch(req) {
    const url = new URL(req.url);
    try {
      if (config.environment == Environment.Production) {
        const filePath = url.pathname === "/" ? "/index.html" : url.pathname;
        const file = Bun.file(`./dist${filePath}`);
        if (await file.exists()) {
          return new Response(file);
        }
        return new Response(null, { status: 404 });
      }
    } catch {
      return new Response(null, { status: 404 });
    }
  },
  websocket: {
    message(_ws, _message) {},
  },
  port,
});

console.log("server.ts listening on port", port);

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
      return new Response(
        Bun.file(`./dist${url.pathname === "/" ? "/index.html" : url.pathname}`)
      );
    } catch (e) {
      // console.error(e);
      return new Response(null, { status: 404 });
    }
  },
  websocket: {
    message(ws, message) {
      if (config.environment == Environment.Local) {
        const destWs = new WebSocket("wss://localhost:5173");
        destWs.onopen = () => {
          destWs.send(message);
        };

        destWs.onmessage = (event) => {
          ws.send(event.data.toString());
        };
      }
    },
    open(ws) {
      console.log("Connection opened");
    },
    close(ws) {
      console.log("Connection closed");
    },
  },
  port,
});

console.log("server.ts listening on port", port);

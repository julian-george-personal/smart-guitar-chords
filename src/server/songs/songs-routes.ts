import { TRoutes } from "../types";
import { getSongs, SongsStatus } from "./songs-service";
import { verifyAuthorization } from "../clients/auth-client";

const songsRoutes: TRoutes = {
  "/api/songs/get": {
    GET: async (req) => {
      const authorizedUsername = verifyAuthorization(req);
      const [songs, status] = await getSongs(authorizedUsername);
      switch (status) {
        case SongsStatus.Success:
          return Response.json(songs, { status: 200 });
        default:
          return Response.json(null, { status: 500 });
      }
    },
  },
};

export default songsRoutes;

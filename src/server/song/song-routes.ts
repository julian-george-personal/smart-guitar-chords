import { TRoutes } from "../types";
import { createSong, getSongsByUser, SongStatus } from "./song-service";
import { verifyAuthorization } from "../clients/auth-client";
import { TCreateSongRequest } from "./song-requests";

const songRoutes: TRoutes = {
  "/api/song/getAll": {
    GET: async (req) => {
      const authorizedUsername = verifyAuthorization(req);
      if (!authorizedUsername) return Response.json(null, { status: 401 });
      const [songs, status] = await getSongsByUser(authorizedUsername);
      switch (status) {
        case SongStatus.Success:
          return Response.json(songs, { status: 200 });
        default:
          return Response.json(null, { status: 500 });
      }
    },
  },
  "/api/song/create": {
    POST: async (req) => {
      const authorizedUsername = verifyAuthorization(req);
      if (!authorizedUsername) return Response.json(null, { status: 401 });
      const request = (await req.json()) as TCreateSongRequest;
      const [status, error] = await createSong(request, authorizedUsername);
      switch (status) {
        case SongStatus.Success:
          return Response.json(null, { status: 200 });
        case SongStatus.InvalidRequest:
          return Response.json({ error }, { status: 400 });
        default:
          return Response.json(null, { status: 500 });
      }
    },
  },
};

export default songRoutes;

import { TRoutes } from "../types";
import {
  createSong,
  getSongsByUser,
  SongStatus,
  updateSong,
  deleteSong,
} from "./song-service";
import { verifyAuthorization } from "../clients/auth-client";
import {
  TCreateSongRequest,
  TDeleteSongRequest,
  TUpdateSongRequest,
} from "./song-requests";

const songRoutes: TRoutes = {
  "/api/song/user": {
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
  "/api/song/update": {
    POST: async (req) => {
      const authorizedUsername = verifyAuthorization(req);
      if (!authorizedUsername) return Response.json(null, { status: 401 });
      const request = (await req.json()) as TUpdateSongRequest;
      const [status, error] = await updateSong(request, authorizedUsername);
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
  "/api/song/delete": {
    DELETE: async (req) => {
      const authorizedUsername = verifyAuthorization(req);
      if (!authorizedUsername) return Response.json(null, { status: 401 });
      const request = (await req.json()) as TDeleteSongRequest;
      const [status, error] = await deleteSong(request, authorizedUsername);
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

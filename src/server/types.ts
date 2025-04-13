import { BunRequest } from "bun";

export type TRoutes = Record<
  string,
  Record<string, (req: BunRequest) => Promise<Response>>
>;

import jwt from "jsonwebtoken";
import config from "../config";

export async function hashPassword(password:string) {
  return (await Bun.password.hash(password)).toString();
}

export function generateToken(object: object) {
  return jwt.sign(object, config.jwtSecret, { expiresIn: "1h" });
}

export function verifyToken<T>(token: string): T | null {
  try {
    return jwt.verify(token, config.jwtSecret) as T;
  } catch (err) {
    return null;
  }
}

export function verifyAuthorization(req: Bun.BunRequest): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;
  try {
    return verifyToken<{ username: string }>(token)?.username ?? null;
  } catch (err) {
    return null;
  }
}

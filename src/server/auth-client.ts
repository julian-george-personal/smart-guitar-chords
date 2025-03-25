import jwt from "jsonwebtoken";
import config from "./config";

export function generateToken(username: string) {
  return jwt.sign({ username }, config.jwtSecret, { expiresIn: "1h" });
}

export function verifyToken<T>(token: string): T | null {
  try {
    return jwt.verify(token, config.jwtSecret) as T;
  } catch (err) {
    return null;
  }
}

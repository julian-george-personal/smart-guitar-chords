import jwt from "jsonwebtoken";
import config from "./config";

export function generateToken(username: string) {
  return jwt.sign({ username }, config.jwtSecret, { expiresIn: "1h" });
}

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, config.jwtSecret) as { username: string };
  } catch (err) {
    return null;
  }
};

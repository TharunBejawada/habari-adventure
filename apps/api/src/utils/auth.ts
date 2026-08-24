// apps/api/src/utils/auth.ts
// Uses bcryptjs (pure JavaScript, no native binary) instead of argon2 -
// argon2's compiled .node binary doesn't survive Amplify's esbuild Lambda
// bundling ("No native build was found for platform=..."), which crashes
// the function at cold start since auth.ts is imported eagerly by the auth
// routes. bcryptjs has no such binary to lose.
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const SALT_ROUNDS = 10;

// Hash a plain text password
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// Verify a plain text password against a bcrypt hash
export const verifyPassword = async (hash: string, plain: string): Promise<boolean> => {
  return await bcrypt.compare(plain, hash);
};

// Generate a JWT Token
export const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: "1d", // Token valid for 1 day
  });
};
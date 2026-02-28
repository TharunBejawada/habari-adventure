// apps/api/src/utils/auth.ts
import argon2 from "argon2";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Hash a plain text password
export const hashPassword = async (password: string): Promise<string> => {
  return await argon2.hash(password);
};

// Verify a plain text password against an Argon2 hash
export const verifyPassword = async (hash: string, plain: string): Promise<boolean> => {
  return await argon2.verify(hash, plain);
};

// Generate a JWT Token
export const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: "1d", // Token valid for 1 day
  });
};
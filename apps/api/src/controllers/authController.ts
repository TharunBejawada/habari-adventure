// apps/api/src/controllers/authController.ts
import { Request, Response } from "express";
import { verifyPassword, generateToken } from "../utils/auth";
// import { prisma } from "@repo/database";
import { prisma } from "../prisma";

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ status: "error", message: "Email and password are required" });
      return;
    }

    // 1. Find user in the real database
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ status: "error", message: "Invalid credentials" });
      return;
    }

    // 2. Verify the Argon2 password hash
    const isPasswordValid = await verifyPassword(user.password, password);
    if (!isPasswordValid) {
      res.status(401).json({ status: "error", message: "Invalid credentials" });
      return;
    }

    // 3. Ensure the user is actually an Admin
    if (user.role !== "ADMIN") {
      res.status(403).json({ status: "error", message: "Access denied. Admins only." });
      return;
    }

    // --- NEW: Update Login Stats ---
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: {
          increment: 1 // Automatically adds 1 to the current database value
        }
      }
    });
    // -------------------------------

    // 4. Generate Token
    const token = generateToken(user.id, user.role);

    res.status(200).json({
      status: "success",
      data: {
        token,
        user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ status: "error", message: "Internal server error during login" });
  }
};
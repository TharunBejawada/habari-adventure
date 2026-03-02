// apps/api/src/controllers/userController.ts
import { Request, Response } from "express";
import { prisma } from "@repo/database";
import { hashPassword } from "../utils/auth";

// @route   GET /api/v1/users
// @desc    Get all users (excluding passwords)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        loginCount: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    
    res.status(200).json({ status: "success", data: users });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch users" });
  }
};

// @route   POST /api/v1/users
// @desc    Create a new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ status: "error", message: "All fields are required" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ status: "error", message: "Email is already in use" });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role || "ADMIN",
      },
      select: { id: true, firstName: true, lastName: true, email: true, role: true } // Exclude password from response
    });

    res.status(201).json({ status: "success", data: newUser });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to create user" });
  }
};

// @route   PUT /api/v1/users/:id
// @desc    Update a user (including optional password change or soft delete)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // const { id } = req.params;
    const id = req.params.id as string;
    const { firstName, lastName, email, role, isActive, password } = req.body;

    // Build the update object dynamically
    const updateData: any = { firstName, lastName, email, role, isActive };

    // If a new password is provided, hash it before saving
    if (password) {
      updateData.password = await hashPassword(password);
    }

    // Remove undefined fields so Prisma doesn't overwrite with nulls
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true }
    });

    res.status(200).json({ status: "success", data: updatedUser });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to update user" });
  }
};

// @route   DELETE /api/v1/users/:id
// @desc    Hard delete a user (Use carefully, prefer soft delete via PUT)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // const { id } = req.params;
    const id = req.params.id as string;

    await prisma.user.delete({ where: { id } });

    res.status(200).json({ status: "success", message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to delete user" });
  }
};
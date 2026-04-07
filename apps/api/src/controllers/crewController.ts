// apps/api/src/controllers/crewController.ts
import { Request, Response } from "express";
import { prisma } from "../prisma";

// Get ALL Crew Data (Settings, Teams, and Members ordered by priority)
export const getCrewData = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.crewSettings.findUnique({ where: { id: "singleton" } });
    const teams = await prisma.crewTeam.findMany({
      orderBy: { priorityOrder: 'asc' },
      include: {
        members: { orderBy: { priorityOrder: 'asc' } }
      }
    });
    res.status(200).json({ status: "success", data: { settings, teams } });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update Page Settings (Hero & Porter)
export const updateCrewSettings = async (req: Request, res: Response) => {
  try {
    const adminUser = (req as any).user?.email || "Admin"; 
    
    // Extract only the fields that belong in settings
    const { heroBannerImage, porterBannerImage, porterDescription } = req.body;
    const data = { heroBannerImage, porterBannerImage, porterDescription, modifiedBy: adminUser };
    
    const settings = await prisma.crewSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data }
    });
    res.status(200).json({ status: "success", data: settings });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// Create / Update Team
export const saveTeam = async (req: Request, res: Response) => {
  try {
    const adminUser = (req as any).user?.email || "Admin";
    const { id, name, priorityOrder } = req.body;
    
    let team;
    if (id) {
      team = await prisma.crewTeam.update({
        where: { id },
        data: { name, priorityOrder: Number(priorityOrder), modifiedBy: adminUser }
      });
    } else {
      team = await prisma.crewTeam.create({
        data: { name, priorityOrder: Number(priorityOrder), modifiedBy: adminUser }
      });
    }
    res.status(200).json({ status: "success", data: team });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// Delete Team (Cascades and deletes members too based on Prisma schema)
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.crewTeam.delete({ where: { id } });
    res.status(200).json({ status: "success", message: "Team deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// Create / Update Member
export const saveMember = async (req: Request, res: Response) => {
  try {
    const adminUser = (req as any).user?.email || "Admin";
    const { id, teamId, name, designation, description, priorityOrder, image } = req.body;
    
    const data = {
      teamId, name, designation, description, image, 
      priorityOrder: Number(priorityOrder), modifiedBy: adminUser
    };

    let member;
    if (id) {
      member = await prisma.crewMember.update({ where: { id }, data });
    } else {
      member = await prisma.crewMember.create({ data });
    }
    res.status(200).json({ status: "success", data: member });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// Delete Member
export const deleteMember = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.crewMember.delete({ where: { id } });
    res.status(200).json({ status: "success", message: "Member deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
import type { Request, Response } from "express";
import { prisma } from "../db.js";

export async function getAllItems (req: Request, res: Response) {
    try {
        const data = await prisma.noteTable.findMany({
            orderBy: { timeStamp: "desc" }
        });
        res.status(200).json({
            data: data
        });
    } catch (e) {
        console.error({message: "getAllItems Failed", error: e})
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
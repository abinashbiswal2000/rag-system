import type { Request, Response } from "express";
import { prisma } from "../db.js";
import { queryZodSchema } from "../zodSchemas/queryZodSchema.js"; 
import { embedText, cosineSimilarity } from "../services/embeddings.js";
import { generateAnswer } from "../services/llm.js";
import { AppError } from "../errors.js";

const TOP_K = 5;

export async function query(req: Request, res: Response) {
    try {
        const parsed = queryZodSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid input",
                errors: parsed.error.issues,
            });
        }

        const { question } = parsed.data;

        const questionVector = await embedText(question);

        const rows = await prisma.vectorTable.findMany();
        if (rows.length === 0) {
            return res.status(200).json({ answer: "answer not found", citations: [] });
        }

        const topChunks = rows
            .map((row) => ({
                id: row.id,
                text: row.text,
                score: cosineSimilarity(questionVector, JSON.parse(row.vector) as number[]),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, TOP_K);

        const llmAnswer = await generateAnswer(
            question,
            topChunks.map(({ id, text }) => ({ id, text }))
        );

        const retrievedIds = new Set(topChunks.map((chunk) => chunk.id));
        const validIds = llmAnswer.vectorTableIds.filter((id) => retrievedIds.has(id));

        if (!llmAnswer.answerFound || validIds.length === 0) {
            return res.status(200).json({ answer: "answer not found", citations: [] });
        }

        const citations = await prisma.vectorTable.findMany({
            where: { id: { in: validIds } },
            select: { id: true, text: true, noteTableId: true },
        });

        return res.status(200).json({
            answer: llmAnswer.response,
            citations,
        });
    } catch (e) {
        if (e instanceof AppError) {
            return res.status(e.status).json({ message: e.message });
        }
        console.error({ message: "query Failed", error: e });
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
}
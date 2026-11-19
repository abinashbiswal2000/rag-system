import type { Request, Response } from "express";
import { ingestZodSchema } from "../zodSchemas/ingestZodSchema.js";
import { prisma } from "../db.js";
import { fetchPageText } from "../services/fetcher.js";
import { chunkText } from "../services/chunker.js";
import { embedChunks } from "../services/embeddings.js";
import { AppError } from "../errors.js";

export async function addNote(req: Request, res: Response) {
    try {
        const parsed = ingestZodSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Bad input format.",
                error: parsed.error.issues
            });
        }

        const input = parsed.data;

        // For URL notes, the heading is the URL and the content is the page's text.
        const content = input.sourceType === "URL" ? await fetchPageText(input.heading) : input.content;

        const chunks = chunkText(content);
        if (chunks.length === 0) {
            return res.status(422).json({ message: "No readable text found to save." });
        }

        const vectors = await embedChunks(chunks);

        await prisma.$transaction(async (tx) => {
            const note = await tx.noteTable.create({
                data: {
                    sourceType: input.sourceType,
                    heading: input.heading,
                    content,
                },
            });

            await tx.vectorTable.createMany({
                data: chunks.map((text, i) => ({
                    text,
                    vector: JSON.stringify(vectors[i]),
                    noteTableId: note.id,
                })),
            });
        });

        res.status(201).json({
            message: "Note Added Successfully"
        });
    } catch (e) {
        if (e instanceof AppError) {
            return res.status(e.status).json({ message: e.message });
        }
        console.error({ message: "Internal Server Error", error: e });
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

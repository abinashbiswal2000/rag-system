import { z } from "zod";

// TEXT: heading is a title, content is the note text.
const textIngestSchema = z.object({
    sourceType: z.literal("TEXT"),
    heading: z.string().trim().min(1),
    content: z.string().trim().min(1),
});

// URL: heading is the page URL; content is fetched from the page, so it is optional and ignored.
const urlIngestSchema = z.object({
    sourceType: z.literal("URL"),
    heading: z.url({ protocol: /^https?$/ }),
    content: z.string().optional(),
});

const ingestZodSchema = z.discriminatedUnion("sourceType", [textIngestSchema, urlIngestSchema]);

export { ingestZodSchema }

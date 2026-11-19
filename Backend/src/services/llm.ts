import { z } from "zod";
import { AppError } from "../errors.js";

const OLLAMA_URL = "http://localhost:11434/api/chat";
const OLLAMA_MODEL = "qwen3.5:9b";
const REQUEST_TIMEOUT_MS = 120000;

const answerJsonSchema = {
  type: "object",
  properties: {
    answerFound: { type: "boolean" },
    response: { type: "string" },
    vectorTableIds: { type: "array", items: { type: "integer" } },
  },
  required: ["answerFound", "response", "vectorTableIds"],
};

const llmAnswerZodSchema = z.object({
  answerFound: z.boolean(),
  response: z.string(),
  vectorTableIds: z.array(z.number().int()),
});

export type LlmAnswer = z.infer<typeof llmAnswerZodSchema>;

export async function generateAnswer(
  question: string,
  chunks: { id: number; text: string }[]
): Promise<LlmAnswer> {
  const context = chunks
    .map((chunk) => `[id: ${chunk.id}]\n${chunk.text}`)
    .join("\n\n");

  const prompt = `Answer the question using ONLY the context below.
If the context does not contain the answer, set answerFound to false.
In vectorTableIds, list the ids of the chunks you used.

Context:
${context}

Question: ${question}`;

  let response: Response;
  try {
    response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        think: false,
        format: answerJsonSchema,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("LLM call failed:", error);
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    throw new AppError(503, timedOut
      ? `The LLM did not answer within ${REQUEST_TIMEOUT_MS / 1000} seconds.`
      : `Cannot reach Ollama at ${OLLAMA_URL}. Is Ollama running?`);
  }

  if (response.status === 404) {
    throw new AppError(503, `Ollama model "${OLLAMA_MODEL}" is not installed. Run: ollama pull ${OLLAMA_MODEL}`);
  }
  if (!response.ok) {
    console.error("LLM call failed:", response.status, await response.text().catch(() => ""));
    throw new AppError(502, `Ollama returned status ${response.status}.`);
  }

  try {
    const data = (await response.json()) as { message?: { content?: string } };
    const content = data.message?.content;
    if (!content) {
      throw new Error("Empty response from LLM");
    }
    return llmAnswerZodSchema.parse(JSON.parse(content));
  } catch (error) {
    console.error("LLM returned an unusable answer:", error);
    throw new AppError(502, "The LLM returned an answer in an unexpected format.");
  }
}
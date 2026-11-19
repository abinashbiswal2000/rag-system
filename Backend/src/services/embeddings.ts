import { pipeline } from "@huggingface/transformers";

const extractorPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

export async function embedText(text: string): Promise<number[]> {
    try {
        const extractor = await extractorPromise;
        const output = await extractor(text, { pooling: "mean", normalize: true });
        return Array.from(output.data as Float32Array);
    } catch (e) {
        console.error({ message: "Embedding failed", error: e });
        throw new Error("Embedding failed");
    }
}

export async function embedChunks(chunks: string[]): Promise<number[][]> {
    const vectors: number[][] = [];
    for (const chunk of chunks) {
        vectors.push(await embedText(chunk));
    }
    return vectors;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
  }
  return dot;
}
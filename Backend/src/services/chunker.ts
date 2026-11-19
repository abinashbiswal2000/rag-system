const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

export function chunkText(text: string): string[] {
    
  const chunks: string[] = [];

  for (let start = 0; start < text.length; start += CHUNK_SIZE - CHUNK_OVERLAP) {
    chunks.push(text.slice(start, start + CHUNK_SIZE));
    if (start + CHUNK_SIZE >= text.length) break;
  }

  return chunks;

}
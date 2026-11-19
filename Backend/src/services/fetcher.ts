import * as cheerio from "cheerio";
import { AppError } from "../errors.js";

const FETCH_TIMEOUT_MS = 10000;

export async function fetchPageText(url: string): Promise<string> {
    let response: Response;
    try {
        response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    } catch (e) {
        const timedOut = e instanceof Error && e.name === "TimeoutError";
        throw new AppError(422, timedOut
            ? `The URL did not respond within ${FETCH_TIMEOUT_MS / 1000} seconds.`
            : "Could not reach the URL.");
    }

    if (!response.ok) {
        throw new AppError(422, `The URL returned status ${response.status}.`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
        throw new AppError(422, `The URL is not an HTML page (content-type: ${contentType || "unknown"}).`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    $("script, style, noscript, nav, footer, header, svg").remove();
    const text = $("body").text();
    return text.replace(/\s+/g, " ").trim();
}

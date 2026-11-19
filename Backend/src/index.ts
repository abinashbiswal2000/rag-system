import "dotenv/config"
import express from "express"
import cors from "cors"
import type { ErrorRequestHandler } from "express";
import { itemsRouter } from "./routes/items.routes.js";
import { ingestRouter } from "./routes/ingest.routes.js";
import { queryRouter } from "./routes/query.routes.js";

const PORT = process.env["PORT"] || 5000;

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(itemsRouter);
app.use(ingestRouter);
app.use(queryRouter);

// Unknown routes
app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

// Errors thrown before a controller runs (e.g. malformed JSON, body too large)
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    if (err?.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Malformed JSON body." });
    }
    const status = typeof err?.status === "number" ? err.status : 500;
    if (status >= 400 && status < 500) {
        return res.status(status).json({ message: err.message ?? "Bad request." });
    }
    console.error({ message: "Unhandled error", error: err });
    res.status(500).json({ message: "Internal Server Error" });
};
app.use(errorHandler);

app.listen(PORT, () => {console.log(`App listening at http://localhost:${PORT}`);});

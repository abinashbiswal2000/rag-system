import { Router } from "express";
import { addNote } from "../controllers/ingest.controller.js";

const ingestRouter = Router();

ingestRouter.post('/ingest', addNote);

export { ingestRouter }
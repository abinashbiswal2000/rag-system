import { query } from "../controllers/query.controller.js";
import { Router } from "express";

const queryRouter = Router();

queryRouter.post('/query', query);

export { queryRouter }
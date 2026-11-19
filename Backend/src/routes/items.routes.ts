import { Router } from "express";
import { getAllItems } from "../controllers/items.controller.js";

const itemsRouter = Router();

itemsRouter.get('/items', getAllItems);

export { itemsRouter }
import { Router } from "express";
import * as controller from "../controllers/players.js";

export const players = Router();

players.get("/players", controller.get);

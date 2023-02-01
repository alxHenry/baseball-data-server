import { Router } from "express";
import * as controller from "../controllers/projections.js";

export const projections = Router();

projections.get("/projections", controller.get);

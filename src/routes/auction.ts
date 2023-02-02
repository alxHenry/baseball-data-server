import { Router } from "express";
import * as controller from "../controllers/auction.js";

export const auction = Router();

auction.get("/auction", controller.get);

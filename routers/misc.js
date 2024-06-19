import express from "express";
import { mailFeedback, search } from "../controllers/misc";

const miscRouter = express.Router();

miscRouter.post("/feedback", mailFeedback).get("/search", search);

export default miscRouter;

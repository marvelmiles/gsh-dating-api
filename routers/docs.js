import express from "express";
import swaggerUi from "swagger-ui-express";
import { buildOpenApiDocument, swaggerUiOptions } from "../docs";

const docsRouter = express.Router();

const buildDocumentForRequest = (req) =>
  buildOpenApiDocument(`${req.protocol}://${req.get("host")}`);

docsRouter
  .get("/openapi.json", (req, res) =>
    res.json(buildDocumentForRequest(req))
  )
  .use("/", swaggerUi.serve, (req, res, next) =>
    swaggerUi.setup(buildDocumentForRequest(req), swaggerUiOptions)(
      req,
      res,
      next
    )
  );

export default docsRouter;

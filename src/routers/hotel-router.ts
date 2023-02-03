import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getEnrollmentByUser, postCreateOrUpdateEnrollment, getAddressFromCEP } from "@/controllers";
import { createEnrollmentSchema } from "@/schemas";

const hotelRouter = Router();

hotelRouter
  .all("/*", authenticateToken)
  .get("/", (req, res) => {
    return res.sendStatus(200);
  })
  .get("/:hotelId", (req, res) => {
    return res.sendStatus(200);
  });

export { hotelRouter };

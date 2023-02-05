import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getAllHotels, getOneHotel } from "@/controllers/hotel-controller";
import validateParams from "@/middlewares/params-middleware";
const hotelRouter = Router();

hotelRouter.get("/", authenticateToken, getAllHotels);
hotelRouter.get("/:hotelId", validateParams, authenticateToken, getOneHotel);

export default hotelRouter;

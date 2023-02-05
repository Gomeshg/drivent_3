import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getAllHotels, getOneHotel } from "@/controllers/hotel-controller";

const hotelRouter = Router();

hotelRouter.get("/", authenticateToken, getAllHotels);
hotelRouter.get("/:hotelId", authenticateToken, getOneHotel);

export default hotelRouter;

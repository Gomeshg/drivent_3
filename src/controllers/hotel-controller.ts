import { Request, Response } from "express";
import httpStatus from "http-status";
import hotelService from "@/services/hotel-service";

export async function getAllHotels(req: Request, res: Response) {
  const userId = res.locals.userId as number;

  try {
    const hotel = await hotelService.readAllHotels(userId);
    return res.status(httpStatus.OK).send(hotel);
  } catch (err) {
    if (err.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (err.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    if (err.name === "PaymentRequiredError") {
      return res.status(httpStatus.PAYMENT_REQUIRED).send(err.message);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function getOneHotel(req: Request, res: Response) {
  const userId = res.locals.userId as number;
  const hotelId = Number(req.params.hotelId);

  try {
    const hotel = await hotelService.readOneHotel(userId, hotelId);
    return res.status(httpStatus.OK).send(hotel);
  } catch (err) {
    if (err.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (err.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    if (err.name === "PaymentRequiredError") {
      return res.status(httpStatus.PAYMENT_REQUIRED).send(err.message);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

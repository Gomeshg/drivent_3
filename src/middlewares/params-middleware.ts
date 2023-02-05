import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";

export default async function validateParams(req: Request, res: Response, next: NextFunction) {
  const hotelId = Number(req.params.hotelId);
  if (!hotelId || hotelId === 0) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  next();
}

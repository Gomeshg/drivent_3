import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";

export async function validateParams(req: Request, res: Response, next: NextFunction) {
  const hotelId = Number(req.params.hotelId);
  if (!hotelId || hotelId === 0) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  next();
}

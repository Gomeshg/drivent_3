import { paymentRequiredError, notFoundError, unauthorizedError } from "@/errors";
import { Enrollment, Ticket, TicketType, Hotel, Payment } from "@prisma/client";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import hotelRepository from "@/repositories/hotel-repository";
import paymentRepository from "@/repositories/payment-repository";

async function readAllHotels(userId: number): Promise<Hotel[]> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) {
    throw notFoundError();
  }

  const payment = await paymentRepository.findPaymentByTicketId(ticket.id);
  if (!payment) {
    throw paymentRequiredError("ticket");
  }

  if (ticket.TicketType.isRemote) {
    throw paymentRequiredError("remote");
  }

  if (!ticket.TicketType.includesHotel) {
    throw paymentRequiredError("hotel");
  }

  const hotel = await hotelRepository.findMany();
  return hotel;
}

async function readOneHotel(userId: number, hotelId: number): Promise<Hotel> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) {
    throw notFoundError();
  }

  const payment = await paymentRepository.findPaymentByTicketId(ticket.id);
  if (!payment) {
    throw paymentRequiredError("ticket");
  }

  if (ticket.TicketType.isRemote) {
    throw paymentRequiredError("remote");
  }

  if (!ticket.TicketType.includesHotel) {
    throw paymentRequiredError("hotel");
  }

  const hotel = await hotelRepository.findUnique(hotelId);
  if (!hotel) {
    throw notFoundError();
  }
  return hotel;
}

const hotelService = {
  readAllHotels,
  readOneHotel,
};

export default hotelService;

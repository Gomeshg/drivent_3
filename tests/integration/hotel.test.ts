import app, { init } from "@/app";
import { TicketStatus } from "@prisma/client";
import { Hotel } from "@prisma/client";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createTicketTypeWithOutHotel,
  createTicket,
  createSession,
  createHotel,
  createRoom,
  createBooking,
  createPayment,
} from "../factories";
import { cleanDb, sleep } from "../helpers";
const fourHours = 14400;

beforeAll(async () => {
  await init();
  await cleanDb();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET, { expiresIn: fourHours });

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if the token given is expired", async () => {
    const oneSecond = 1;
    const user = await createUser();
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: oneSecond });
    await createSession(token, user.id);
    await sleep(1000);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("When token is valid", () => {
    it("should respond with status 404 when there are no enrollment", async () => {
      const user = await createUser();
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: fourHours });
      await createSession(token, user.id);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when there are no ticket", async () => {
      const user = await createUser();
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: fourHours });
      await createSession(token, user.id);
      await createEnrollmentWithAddress(user);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 402 when the ticket is not paid", async () => {
      const user = await createUser();
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: fourHours });
      await createSession(token, user.id);
      const ticketType = await createTicketTypeWithHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 402 when the ticket is remote", async () => {
      const user = await createUser();
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: fourHours });
      await createSession(token, user.id);
      const ticketType = await createTicketTypeRemote();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 402 when the ticket not include hotel", async () => {
      const user = await createUser();
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: fourHours });
      await createSession(token, user.id);
      const ticketType = await createTicketTypeWithOutHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 200 with all hotels ", async () => {
      const user = await createUser();
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: fourHours });
      await createSession(token, user.id);
      const ticketType = await createTicketTypeWithHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel("Capacabana Palace");
      const room = await createRoom(hotel.id);
      await createBooking(user.id, room.id);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: hotel.id,
            name: hotel.name,
            image: hotel.image,
            createdAt: hotel.createdAt.toISOString(),
            updatedAt: hotel.updatedAt.toISOString(),
          }),
        ]),
      );
    });
  });
});

// describe("GET /hotel/:hotelId", () => {
//   it("should respond with status 401 if no token is given", async () => {
//     const response = await server.get(`/hotel/${2}`);

//     expect(response.status).toBe(httpStatus.UNAUTHORIZED);
//   });

//   it("should respond with status 401 if given token is not valid", async () => {
//     const token = faker.lorem.word();

//     const response = await server.get(`/hotel/${2}`).set("Authorization", `Bearer ${token}`);

//     expect(response.status).toBe(httpStatus.UNAUTHORIZED);
//   });

//   it("should respond with status 401 if there is no session for given token", async () => {
//     const userWithoutSession = await createUser();
//     const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET, { expiresIn: fourHours });

//     const response = await server.get(`/hotel/${2}`).set("Authorization", `Bearer ${token}`);

//     expect(response.status).toBe(httpStatus.UNAUTHORIZED);
//   });

//   it("should respond with status 401 if the token given is expired", async () => {
//     const oneSecond = 1;
//     const user = await createUser();
//     const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: oneSecond });
//     await createSession(token, user.id);
//     await sleep(1000);

//     const response = await server.get(`/hotel/${2}`).set("Authorization", `Bearer ${token}`);

//     expect(response.status).toBe(httpStatus.UNAUTHORIZED);
//   });

//   describe("When token is valid", () => {
//     it("should respond with status 404 when there are no enrollment", async () => {
//       const user = await createUser();
//       const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: fourHours });
//       await createSession(token, user.id);

//       const response = await server.get(`/hotel/${2}`).set("Authorization", `Bearer ${token}`);
//       expect(response.status).toBe(httpStatus.NOT_FOUND);
//     });

//     it("should respond with status 404 when there are no ticket", async () => {
//       const user = await createUser();
//       const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: fourHours });
//       await createSession(token, user.id);
//       await createEnrollmentWithAddress(user);

//       const response = await server.get(`/hotel/${2}`).set("Authorization", `Bearer ${token}`);
//       expect(response.status).toBe(httpStatus.NOT_FOUND);
//     });

//     it("should respond with status 402 when the ticket is not paid", async () => {
//       const user = await createUser();
//       const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: fourHours });
//       await createSession(token, user.id);
//       const ticketType = await createTicketTypeWithHotel();
//       const enrollment = await createEnrollmentWithAddress(user);
//       await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

//       const response = await server.get(`/hotel/${2}`).set("Authorization", `Bearer ${token}`);
//       expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
//     });

//     it("should respond with status 402 when the ticket is remote", async () => {
//       const user = await createUser();
//       const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: fourHours });
//       await createSession(token, user.id);
//       const ticketType = await createTicketTypeRemote();
//       const enrollment = await createEnrollmentWithAddress(user);
//       const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
//       await createPayment(ticket.id, ticketType.price);

//       const response = await server.get(`/hotel/${2}`).set("Authorization", `Bearer ${token}`);
//       expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
//     });

//     it("should respond with status 402 when the ticket not include hotel", async () => {
//       const user = await createUser();
//       const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: fourHours });
//       await createSession(token, user.id);
//       const ticketType = await createTicketTypeWithOutHotel();
//       const enrollment = await createEnrollmentWithAddress(user);
//       const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
//       await createPayment(ticket.id, ticketType.price);

//       const response = await server.get(`/hotel/${2}`).set("Authorization", `Bearer ${token}`);
//       expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
//     });
//   });
// });

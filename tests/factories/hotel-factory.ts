import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.name.firstName(),
      image: faker.image.business(),
    },
  });
}

export async function createRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.firstName(),
      capacity: faker.datatype.number({ min: 1, max: 100 }),
      hotelId: hotelId,
    },
  });
}

export async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

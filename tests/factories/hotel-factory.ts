import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createHotel(name: string) {
  return prisma.hotel.create({
    data: {
      name: name,
      image: faker.image.business(),
    },
  });
}

export async function createRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.datatype.number({ min: 1, max: 500 }).toString(),
      capacity: faker.datatype.number({ min: 1, max: 4 }),
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

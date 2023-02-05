import { prisma } from "@/config";
import { Hotel } from "@prisma/client";

async function findMany(): Promise<Hotel[]> {
  return prisma.hotel.findMany({});
}

async function findUnique(id: number): Promise<Hotel> {
  return prisma.hotel.findUnique({
    where: {
      id,
    },
    include: {
      Rooms: true,
    },
  });
}

const hotelRepository = {
  findMany,
  findUnique,
};

export default hotelRepository;

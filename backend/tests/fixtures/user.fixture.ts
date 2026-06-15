import { User } from "@prisma/client";

export const mockUser: User = {
  id: 1,
  email: "yoga@studio.com",
  firstName: "Adriene",
  lastName: "Doe",
  password: "test!1234",
  admin: false,
  createdAt: new Date("2026-05-20T11:24:07.065Z"),
  updatedAt: new Date("2026-05-21T12:25:19.065Z"),
};

export const mockAdminUser: User = {
  ...mockUser,
  id: 3,
  admin: true,
};

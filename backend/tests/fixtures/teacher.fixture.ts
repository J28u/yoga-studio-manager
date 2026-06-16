import { Teacher } from "@prisma/client";

export const mockTeacher: Teacher = {
  id: 1,
  firstName: "Margot",
  lastName: "Delahaye",
  createdAt: new Date("2026-05-26T09:24:09.065Z"),
  updatedAt: new Date("2026-05-26T09:24:09.065Z"),
};

export const mockTeachers: Teacher[] = [
  {
    id: 1,
    firstName: "Margot",
    lastName: "Delahaye",
    createdAt: new Date("2026-05-26T09:24:09.065Z"),
    updatedAt: new Date("2026-05-26T09:24:09.065Z"),
  },
  {
    id: 2,
    firstName: "David",
    lastName: "Martin",
    createdAt: new Date("2026-05-30T08:12:10.065Z"),
    updatedAt: new Date("2026-05-30T09:12:10.065Z"),
  },
  {
    id: 3,
    firstName: "Helene",
    lastName: "Thiercelin",
    createdAt: new Date("2026-06-02T08:12:10.065Z"),
    updatedAt: new Date("2026-06-02T09:12:10.065Z"),
  },
];

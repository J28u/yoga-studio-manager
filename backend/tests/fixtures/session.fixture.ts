import { SessionWithParticipants } from "../../src/session/interfaces/session.interface";

export const mockSession = {
  id: 1,
  name: "Yoga Vinyasa",
  date: new Date("2026-06-06T09:24:09.065Z"),
  description:
    "Un cours dynamique qui synchronise le mouvement et la respiration. Idéal pour renforcer le corps et améliorer la flexibilité.",
  teacherId: 1,
  teacher: {
    id: 1,
    firstName: "Margot",
    lastName: "Delahaye",
    createdAt: new Date("2026-05-26T09:24:09.065Z"),
    updatedAt: new Date("2026-05-26T09:24:09.065Z"),
  },
  participants: [
    {
      sessionId: 1,
      userId: 1,
      user: {
        id: 1,
        email: "yoga@studio.com",
        firstName: "Adriene",
        lastName: "Doe",
        password: "test!1234",
        admin: false,
        createdAt: new Date("2026-05-20T11:24:07.065Z"),
        updatedAt: new Date("2026-05-21T12:25:19.065Z"),
      },
    },
    {
      sessionId: 1,
      userId: 3,
      user: {
        id: 3,
        email: "studio@yoga.com",
        firstName: "Benji",
        lastName: "Doe",
        password: "test!1234",
        admin: false,
        createdAt: new Date("2026-05-26T09:24:09.065Z"),
        updatedAt: new Date("2026-05-26T09:24:09.065Z"),
      },
    },
  ],
  createdAt: new Date("2026-05-26T09:24:09.065Z"),
  updatedAt: new Date("2026-05-26T09:24:09.065Z"),
};

export const mockSessions = [
  {
    id: 1,
    name: "Yoga Vinyasa",
    date: new Date("2026-06-06T09:24:09.065Z"),
    description:
      "Un cours dynamique qui synchronise le mouvement et la respiration. Idéal pour renforcer le corps et améliorer la flexibilité.",
    teacherId: 1,
    teacher: {
      id: 1,
      firstName: "Margot",
      lastName: "Delahaye",
      createdAt: new Date("2026-05-26T09:24:09.065Z"),
      updatedAt: new Date("2026-05-26T09:24:09.065Z"),
    },
    participants: [
      {
        sessionId: 1,
        userId: 1,
        user: {
          id: 1,
          email: "yoga@studio.com",
          firstName: "Adriene",
          lastName: "Doe",
          password: "test!1234",
          admin: false,
          createdAt: new Date("2026-05-20T11:24:07.065Z"),
          updatedAt: new Date("2026-05-21T12:25:19.065Z"),
        },
      },
      {
        sessionId: 1,
        userId: 3,
        user: {
          id: 3,
          email: "studio@yoga.com",
          firstName: "Benji",
          lastName: "Doe",
          password: "test!1234",
          admin: false,
          createdAt: new Date("2026-05-26T09:24:09.065Z"),
          updatedAt: new Date("2026-05-26T09:24:09.065Z"),
        },
      },
    ],
    createdAt: new Date("2026-05-26T09:24:09.065Z"),
    updatedAt: new Date("2026-05-26T09:24:09.065Z"),
  },
  {
    id: 2,
    name: "Yin Yoga",
    date: new Date("2026-06-07T09:24:09.205Z"),
    description:
      "Une pratique relaxante et méditative où les postures sont tenues longtemps pour étirer les tissus profonds.",
    teacherId: 2,
    teacher: {
      id: 2,
      firstName: "David",
      lastName: "Martin",
      createdAt: new Date("2026-05-26T09:24:09.065Z"),
      updatedAt: new Date("2026-05-26T09:24:09.065Z"),
    },
    participants: [
      {
        sessionId: 1,
        userId: 1,
        user: {
          id: 1,
          email: "yoga@studio.com",
          firstName: "Adriene",
          lastName: "Doe",
          password: "test!1234",
          admin: false,
          createdAt: new Date("2026-05-20T11:24:07.065Z"),
          updatedAt: new Date("2026-05-21T12:25:19.065Z"),
        },
      },
      {
        sessionId: 1,
        userId: 3,
        user: {
          id: 3,
          email: "studio@yoga.com",
          firstName: "Benji",
          lastName: "Doe",
          password: "test!1234",
          admin: false,
          createdAt: new Date("2026-05-26T09:24:09.065Z"),
          updatedAt: new Date("2026-05-26T09:24:09.065Z"),
        },
      },
    ],
    createdAt: new Date("2026-05-28T09:24:09.065Z"),
    updatedAt: new Date("2026-05-28T09:24:09.065Z"),
  },
];

import {
  AuthResponse,
  RegisterData,
  LoginCredentials,
  User,
  Session,
  Teacher,
} from "../../src/types";

export const MOCK_LOGIN_CREDENTIALS: LoginCredentials = {
  email: "yoga@studio.com",
  password: "test!1234",
};

export const MOCK_REGISTER_DATA: RegisterData = {
  email: "studio@yoga.com",
  password: "test!1234",
  firstName: "Benji",
  lastName: "Doe",
};

export const MOCK_AUTH_RESPONSE_ADMIN: AuthResponse = {
  id: 1,
  email: "yoga@studio.com",
  firstName: "Adriene",
  lastName: "Doe",
  admin: true,
  token: "fakeToken1234M",
};

export const MOCK_AUTH_RESPONSE_USER: AuthResponse = {
  id: 2,
  email: "studio@yoga.com",
  firstName: "Benji",
  lastName: "Doe",
  admin: false,
  token: "fakeToken1234M",
};

export const MOCK_USER_RESPONSE_ADMIN: User = {
  id: 1,
  email: "yoga@studio.com",
  firstName: "Adriene",
  lastName: "Doe",
  admin: true,
  createdAt: "2026-05-20T11:24:07.065Z",
  updatedAt: "2026-05-21T12:25:19.065Z",
};

export const MOCK_USER_RESPONSE_USER: User = {
  id: 2,
  email: "studio@yoga.com",
  firstName: "Benji",
  lastName: "Doe",
  admin: false,
  createdAt: "2026-05-26T09:24:09.065Z",
  updatedAt: "2026-05-26T09:24:09.065Z",
};

export const MOCK_SESSION_RESPONSE: Session = {
  id: 1,
  name: "Yoga Vinyasa",
  date: "2026-06-06T09:24:09.065Z",
  description:
    "Un cours dynamique qui synchronise le mouvement et la respiration. Idéal pour renforcer le corps et améliorer la flexibilité.",
  teacher: { id: 1, firstName: "Margot", lastName: "Delahaye" },
  users: [1, 3],
  createdAt: "2026-05-26T09:24:09.065Z",
  updatedAt: "2026-05-26T09:24:09.065Z",
};

export const MOCK_SESSION_RESPONSE_USER_JOINED: Session = {
  ...MOCK_SESSION_RESPONSE,
  users: [1, 2, 3],
};

export const MOCK_TEACHER_RESPONSE: Teacher[] = [
  {
    id: 1,
    firstName: "Margot",
    lastName: "Delahaye",
    createdAt: "2026-05-26T09:24:09.065Z",
    updatedAt: "2026-05-26T09:24:09.065Z",
  },
  {
    id: 2,
    firstName: "David",
    lastName: "Martin",
    createdAt: "2026-05-30T08:12:10.065Z",
    updatedAt: "2026-05-30T09:12:10.065Z",
  },
  {
    id: 3,
    firstName: "Helene",
    lastName: "Thiercelin",
    createdAt: "2026-06-02T08:12:10.065Z",
    updatedAt: "2026-06-02T09:12:10.065Z",
  },
];

export const MOCK_SESSIONS_RESPONSE: Session[] = [
  {
    id: 1,
    name: "Yoga Vinyasa",
    date: "2026-06-06T09:24:09.065Z",
    description:
      "Un cours dynamique qui synchronise le mouvement et la respiration. Idéal pour renforcer le corps et améliorer la flexibilité.",
    teacher: { id: 1, firstName: "Margot", lastName: "Delahaye" },
    users: [1, 3],
    createdAt: "2026-05-26T09:24:09.065Z",
    updatedAt: "2026-05-26T09:24:09.065Z",
  },
  {
    id: 2,
    name: "Yin Yoga",
    date: "2026-06-07T09:24:09.205Z",
    description:
      "Une pratique relaxante et méditative où les postures sont tenues longtemps pour étirer les tissus profonds.",
    teacher: { id: 2, firstName: "David", lastName: "Martin" },
    users: [],
    createdAt: "2026-05-28T09:24:09.065Z",
    updatedAt: "2026-05-28T09:24:09.065Z",
  },
];

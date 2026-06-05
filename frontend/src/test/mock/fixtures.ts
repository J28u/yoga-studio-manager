import {
  AuthResponse,
  RegisterData,
  LoginCredentials,
  User,
} from "../../types";

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

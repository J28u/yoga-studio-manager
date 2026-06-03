import { AuthResponse, RegisterData, LoginCredentials } from "../../types";

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

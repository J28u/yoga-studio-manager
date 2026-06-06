import { http, HttpResponse } from "msw";
import { AuthResponse } from "../../src/types";
import { MOCK_USER_RESPONSE_USER, MOCK_USER_RESPONSE_ADMIN } from "./fixtures";

export const handlers = [
  http.post<{}, { email: string; password: string }>(
    "/api/auth/login",
    async ({ request }) => {
      const body = await request.json();
      const response: AuthResponse = {
        id: 1,
        email: body.email,
        firstName: "Adriene",
        lastName: "Doe",
        admin: true,
        token: "fakeToken1234M",
      };
      return HttpResponse.json(response, { status: 200 });
    },
  ),

  http.post<
    {},
    { email: string; firstName: string; lastName: string; password: string }
  >("/api/auth/register", async ({ request }) => {
    const body = await request.json();
    const response: AuthResponse = {
      id: 2,
      email: body.email,
      firstName: "Benji",
      lastName: "Doe",
      admin: false,
      token: "fakeToken1234M",
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  http.get<{ id: string }>("/api/user/:id", async ({ params }) => {
    const { id } = params;
    if (Number(id) === 1)
      return HttpResponse.json(MOCK_USER_RESPONSE_ADMIN, { status: 200 });
    if (Number(id) === 2)
      return HttpResponse.json(MOCK_USER_RESPONSE_USER, { status: 200 });

    return HttpResponse.json({ message: "User not found" }, { status: 404 });
  }),

  http.post("api/user/promote-admin", () => {
    return HttpResponse.json(
      { ...MOCK_USER_RESPONSE_USER, admin: true },
      { status: 200 },
    );
  }),

  http.delete("api/user/:id", () => {
    return HttpResponse.json(
      { message: "User deleted successfully" },
      { status: 200 },
    );
  }),
];

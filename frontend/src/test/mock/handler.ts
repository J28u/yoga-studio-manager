import { http, HttpResponse } from "msw";
import { AuthResponse } from "../../types";

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
];

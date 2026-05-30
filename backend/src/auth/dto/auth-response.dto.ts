export interface AuthResponseDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  admin: boolean;
  token: string;
}

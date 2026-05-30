import { UserRepository } from "../user/user.repository";
import * as bcrypt from "bcrypt";
import { generateToken } from "../common/utils/jwt.util";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { UnauthorizedError, ConflictError } from "../middleware/errors";

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOneByEmail(email);
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedError("Invalid credentials");

    const token = generateToken(user.id);

    const response: AuthResponseDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: user.admin,
      token,
    };

    return response;
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findOneByEmail(email);
    if (existingUser) throw new ConflictError("Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      admin: false,
    });

    const token = generateToken(user.id);

    const response: AuthResponseDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: user.admin,
      token,
    };

    return response;
  }
}

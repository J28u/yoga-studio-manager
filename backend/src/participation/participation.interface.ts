import { SessionParticipation, User } from "@prisma/client";

export interface Participant extends SessionParticipation {
  user: User;
}

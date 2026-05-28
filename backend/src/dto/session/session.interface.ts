import { Session, Teacher, SessionParticipation, User } from "@prisma/client";
import { UpdateSessionDto } from "./session.dto";

export interface Participant extends SessionParticipation {
  user: User;
}

export interface SessionWithParticipants extends Omit<Session, "teacherId"> {
  teacher: Teacher;
  participants: Participant[];
}

export interface UpdateSession extends Omit<UpdateSessionDto, "date"> {
  date?: Date;
}

import { Session, Teacher } from "@prisma/client";
import { CreateSessionDto, UpdateSessionDto } from "../dto/session.dto";
import { Participant } from "../../participation/participation.interface";

export interface SessionWithParticipants extends Omit<Session, "teacherId"> {
  teacher: Teacher;
  participants: Participant[];
}

export interface CreateSession extends Omit<CreateSessionDto, "date"> {
  date: Date;
}
export interface UpdateSession extends Omit<UpdateSessionDto, "date"> {
  date?: Date;
}

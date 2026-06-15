import { describe, it, expect, beforeEach, vi } from "vitest";

import { TeacherService } from "../../../src/teacher/teacher.service";
import { TeacherRepository } from "../../../src/teacher/teacher.repository";
import { NotFoundError } from "../../../src/middleware/errors";
import { mockTeacher, mockTeachers } from "../../fixtures/teacher.fixture";

describe("TeacherService", () => {
  let teacherService: TeacherService;
  let teacherRepository: TeacherRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    teacherRepository = {
      findAll: vi.fn(),
      findOne: vi.fn(),
    } as unknown as TeacherRepository;

    teacherService = new TeacherService(teacherRepository);
  });

  describe("getAll", () => {
    it("should return all teachers", async () => {
      vi.mocked(teacherRepository.findAll).mockResolvedValue(mockTeachers);

      const result = await teacherService.getAll();

      expect(result).toEqual(mockTeachers);
      expect(teacherRepository.findAll).toHaveBeenCalledOnce();
    });

    it("should return an empty array when no teachers exist", async () => {
      vi.mocked(teacherRepository.findAll).mockResolvedValue([]);

      const result = await teacherService.getAll();

      expect(result).toEqual([]);
      expect(teacherRepository.findAll).toHaveBeenCalledOnce();
    });
  });

  describe("getById", () => {
    it("should return a teacher", async () => {
      vi.mocked(teacherRepository.findOne).mockResolvedValue(mockTeacher);

      const result = await teacherService.getById(1);

      expect(result).toEqual(mockTeacher);
      expect(teacherRepository.findOne).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundError when teacher does not exist", async () => {
      vi.mocked(teacherRepository.findOne).mockResolvedValue(null);

      await expect(teacherService.getById(999)).rejects.toThrow(NotFoundError);

      expect(teacherRepository.findOne).toHaveBeenCalledWith(999);
    });
  });
});

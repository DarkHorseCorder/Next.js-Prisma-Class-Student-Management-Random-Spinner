import { type Class, type Student } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  //   publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const studentRouter = createTRPCRouter({
  getAllByClass: protectedProcedure
    .input(z.object({ classId: z.string() }))
    .query(async ({ input, ctx }) => {
      const Class = await ctx.prisma.class.findUnique({
        where: {
          id: input.classId,
        },
        include: {
          students: true,
        },
      });

      if (Class?.teacherId !== ctx.session.user.id) {
        throw new Error("You are not the teacher of this class");
      }

      //   sort by rotation alphabetically
      return Class?.students.sort((a: Student, b: Student) =>
        a.name.charAt(0).localeCompare(b.name.charAt(0))
      );
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const student = (await ctx.prisma.student.findUnique({
        where: {
          id: input.id,
        },
        include: {
          class: true,
        },
      })) as Student & { class: Class };

      if (student.class.teacherId !== ctx.session.user.id) {
        throw new Error("You are not the teacher of this class");
      }

      return student;
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string(), classId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const Class = await ctx.prisma.class.findUnique({
        where: {
          id: input.classId,
        },
      });

      if (Class?.teacherId !== ctx.session.user.id) {
        throw new Error("You are not the teacher of this class");
      }

      return ctx.prisma.student.create({
        data: {
          name: input.name,
          classId: input.classId,
          exclude: false,
          rotation: Class.rotation,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        exclude: z.boolean().optional(),
        rotation: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const student = await ctx.prisma.student.findUnique({
        where: {
          id: input.id,
        },
        include: {
          class: true,
        },
      });

      if (student?.class.teacherId !== ctx.session.user.id) {
        throw new Error("You are not the teacher of this class");
      }

      return ctx.prisma.student.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name ?? student.name,
          exclude: input.exclude ?? student.exclude,
          rotation: input.rotation ?? student.rotation,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const student = await ctx.prisma.student.findUnique({
        where: {
          id: input.id,
        },
        include: {
          class: true,
        },
      });

      if (student?.class.teacherId !== ctx.session.user.id) {
        throw new Error("You are not the teacher of this class");
      }

      return ctx.prisma.student.delete({
        where: {
          id: input.id,
        },
      });
    }),

  pickRandom: protectedProcedure
    .input(z.object({ classId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      let Class = (await ctx.prisma.class.findUnique({
        where: {
          id: input.classId,
        },
        include: {
          students: true,
        },
      })) as Class & { students: Student[] };

      if (Class?.teacherId !== ctx.session.user.id) {
        throw new Error("You are not the teacher of this class");
      }

      let availableStudents = Class?.students.filter(
        (student) => !student.exclude && student.rotation === Class.rotation
      );

      if (!availableStudents || availableStudents.length === 0) {
        // If no students are available, switch the rotation and try again
        Class = (await ctx.prisma.class.update({
          where: {
            id: input.classId,
          },
          data: {
            rotation: Class.rotation === "A" ? "B" : "A",
          },
          include: {
            students: true,
          },
        })) as Class & { students: Student[] };

        availableStudents = Class.students.filter(
          (student) => !student.exclude && student.rotation === Class.rotation
        );
      }

      const randomIndex = Math.floor(Math.random() * availableStudents.length);
      const randomStudent = availableStudents[randomIndex];

      await ctx.prisma.student.update({
        where: {
          id: randomStudent?.id as string,
        },
        data: {
          rotation: Class.rotation === "A" ? "B" : "A",
        },
      });

      return randomStudent;
    }),

  getAvailableStudents: protectedProcedure
    .input(z.object({ classId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const Class = await ctx.prisma.class.findUnique({
        where: {
          id: input.classId,
        },
        include: {
          students: true,
        },
      });

      if (Class?.teacherId !== ctx.session.user.id) {
        throw new Error("You are not the teacher of this class");
      }

      // Filter students who are not excluded and are in rotation
      const availableStudents = Class?.students.filter(
        (student) => !student.exclude && student.rotation === Class.rotation
      );

      return availableStudents;
    }),
});

import { z } from "zod";

import {
  createTRPCRouter,
  //   publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const classRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.class.findMany({
      where: {
        teacherId: ctx.session.user.id,
      },
    });
  }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const Class = await ctx.prisma.class.findUnique({
        where: {
          id: input.id,
        },
        include: {
          students: true,
        },
      });

      if (Class?.teacherId !== ctx.session.user.id) {
        throw new Error("You are not the teacher of this class");
      }
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const Class = await ctx.prisma.class.create({
        data: {
          name: input.name,
          teacherId: ctx.session.user.id,
          rotation: "A",
        },
      });

      return Class;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const Class = await ctx.prisma.class.findUnique({
        where: {
          id: input.id,
        },
      });

      if (Class?.teacherId !== ctx.session.user.id) {
        throw new Error("You are not the teacher of this class");
      }

      await ctx.prisma.class.delete({
        where: {
          id: input.id,
        },
      });

      return true;
    }),
});

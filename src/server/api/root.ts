import { createTRPCRouter } from "~/server/api/trpc";
import { exampleRouter } from "~/server/api/routers/example";
import { classRouter } from "./routers/class";
import { studentRouter } from "./routers/students";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  class: classRouter,
  student: studentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

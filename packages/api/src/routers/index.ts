import { protectedProcedure, publicProcedure, router } from "../index";
import { entityRouter } from "./entity";
import { recordRouter } from "./record";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => "OK"),
  privateData: protectedProcedure.query(({ ctx }) => ({
    message: "This is private",
    user: ctx.session.user,
  })),
  entity: entityRouter,
  record: recordRouter,
});
export type AppRouter = typeof appRouter;

import { protectedProcedure, publicProcedure, router } from "../index";
import { dealRouter } from "./deal";
import { entityRouter } from "./entity";
import { recordRouter } from "./record";
import { workflowRouter } from "./workflow";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => "OK"),
  privateData: protectedProcedure.query(({ ctx }) => ({
    message: "This is private",
    user: ctx.session.user,
  })),
  entity: entityRouter,
  record: recordRouter,
  workflow: workflowRouter,
  deal: dealRouter,
});
export type AppRouter = typeof appRouter;

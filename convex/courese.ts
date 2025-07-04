import { v } from "convex/values";
import { query } from "./_generated/server";

export const getCourses = query({
  args: {},
  handler: async (ctx) => {
    const courese = await ctx.db.query("courese").collect();
    return courese;
  },
});

export const getCouresById = query({
  args: { id: v.id("courese") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

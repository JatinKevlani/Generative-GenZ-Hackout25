import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      ...args,
      totalCredits: 0,
      totalUploads: 0,
      monthlyUploads: 0,
      accuracyRate: 100,
      communityRank: 0,
      achievements: [],
      createdAt: Date.now(),
    });
    return userId;
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

      let avatar: string | null = null;
      if (user?.avatar) {
        avatar = await ctx.storage.getUrl(user.avatar);
      }
    return { ...user, avatar };
  },
});

export const updateCredits = mutation({
  args: {
    userId: v.id("users"),
    credits: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      totalCredits: user.totalCredits + args.credits,
    });
  },
});
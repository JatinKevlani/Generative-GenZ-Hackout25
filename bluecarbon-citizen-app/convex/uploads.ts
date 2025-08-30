import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    locationName: v.string(),
    description: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    imageStorageId: v.id("_storage"), // required if uploading
  },
  handler: async (ctx, args) => {
    const uploadId = await ctx.db.insert("uploads", {
      userId: args.userId,
      locationName: args.locationName,
      description: args.description,
      latitude: args.latitude,
      longitude: args.longitude,
      imageStorageId: args.imageStorageId,
      status: "pending",
      creditsEarned: 50, // Default credits
      createdAt: Date.now(),
    });

    // Update user's upload count safely
    const user = await ctx.db.get(args.userId);
    if (user) {
      await ctx.db.patch(args.userId, {
        totalUploads: (user.totalUploads ?? 0) + 1,
        monthlyUploads: (user.monthlyUploads ?? 0) + 1,
      });
    }

    return uploadId;
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const uploads = await ctx.db
      .query("uploads")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return Promise.all(
      uploads.map(async (upload) => {
        let imageUrl: string | null = null;
        if (upload.imageStorageId) {
          imageUrl = await ctx.storage.getUrl(upload.imageStorageId);
        }
        return { ...upload, imageUrl };
      })
    );
  },
});

export const getRecent = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const uploads = await ctx.db
      .query("uploads")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 5);

    return Promise.all(
      uploads.map(async (upload) => {
        let imageUrl: string | null = null;
        if (upload.imageStorageId) {
          imageUrl = await ctx.storage.getUrl(upload.imageStorageId);
        }
        return { ...upload, imageUrl };
      })
    );
  },
});

export const verify = mutation({
  args: {
    uploadId: v.id("uploads"),
    approved: v.boolean(),
  },
  handler: async (ctx, args) => {
    const upload = await ctx.db.get(args.uploadId);
    if (!upload) throw new Error("Upload not found");

    const newStatus = args.approved ? "verified" : "rejected";

    await ctx.db.patch(args.uploadId, {
      status: newStatus,
      verifiedAt: Date.now(),
    });

    // Award credits if approved
    if (args.approved) {
      const user = await ctx.db.get(upload.userId);
      if (user) {
        await ctx.db.patch(upload.userId, {
          totalCredits: (user.totalCredits ?? 0) + (upload.creditsEarned ?? 0),
        });
      }
    }

    // Return updated upload
    return { ...upload, status: newStatus };
  },
});

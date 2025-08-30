import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.id("_storage")),
    totalCredits: v.number(),
    totalUploads: v.number(),
    monthlyUploads: v.number(),
    accuracyRate: v.number(),
    communityRank: v.number(),
    achievements: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  uploads: defineTable({
    userId: v.id("users"),
    locationName: v.string(),
    description: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    // imageUrl: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    status: v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected")),
    creditsEarned: v.number(),
    verifiedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  achievements: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    condition: v.string(), // e.g., "first_upload", "10_uploads", etc.
    creditsReward: v.number(),
  }),
});
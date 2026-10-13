import { z } from "zod";
import { BlogPostStatus } from "../../db/enums";

/** Lowercase words joined by single hyphens: what a post's address may be. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugSchema = z.string().trim().min(1).max(160).regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens, like my-first-post");

export const createBlogPostSchema = z.object({
  title: z.string().trim().min(1).max(200),
  // Left out, it is made from the title.
  slug: slugSchema.optional(),
  excerpt: z.string().trim().max(400).nullable().optional(),
  content: z.string().max(200_000).optional(),
  coverImageUrl: z.string().trim().url().max(1000).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
  status: z.enum([BlogPostStatus.DRAFT, BlogPostStatus.PUBLISHED]).optional(),
  authorName: z.string().trim().max(120).nullable().optional(),
  // To backdate, or to correct the date shown on a post.
  publishedAt: z.string().datetime({ offset: true }).nullable().optional(),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export const listBlogPostsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12),
  offset: z.coerce.number().int().min(0).default(0),
  tag: z.string().trim().max(40).optional(),
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
export type ListBlogPostsInput = z.infer<typeof listBlogPostsSchema>;

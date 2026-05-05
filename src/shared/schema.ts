import { z } from 'zod';

export const DraftMetaSchema = z.object({
  title_candidates: z.array(z.string()).min(1).max(10),
  hashtags: z.array(z.string()),
  category: z.string(),
  length: z.enum(['short','normal','long']).optional(),
  images: z.object({ source_folder: z.string().optional() }).optional(),
});
export type DraftMeta = z.infer<typeof DraftMetaSchema>;

export const ScriptFrontmatterSchema = z.object({
  title: z.string(),
  category: z.string(),
  date: z.string(),
});
export type ScriptFrontmatter = z.infer<typeof ScriptFrontmatterSchema>;

import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
    loader: glob({ pattern: "**/*.(md|mdx)", base: "./content/blog" }),
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.date(),
        draft: z.boolean().default(true),
        image: z.string().optional()
    })
})

export const collections = { blog }
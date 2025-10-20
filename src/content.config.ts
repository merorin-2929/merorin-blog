import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
    loader: glob({ pattern: "**/*.(md|mdx)", base: "./content/blog" }),
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.date(),
        draft: z.boolean().default(false),
        image: z.string().optional(),
        tags: z.array(z.string()).default([])
    })
})

const page = defineCollection({
    loader: glob({ pattern: "**/*.(md|mdx)", base: "./content/page" }),
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.date(),
        draft: z.boolean().default(false),
    })
})

export const collections = { blog, page }
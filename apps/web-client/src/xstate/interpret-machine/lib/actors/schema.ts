import { z as zod } from 'zod';

const languageData = zod.object({
    words: zod.array(zod.tuple([zod.string(), zod.string(), zod.string()])),
    meaning: zod.string(),
    dialogue: zod.array(zod.tuple([zod.string(), zod.string(), zod.string()])),
})

export const queriesResponse = zod.record(zod.string(), languageData)

export type queriesResponseType = zod.infer<typeof queriesResponse>
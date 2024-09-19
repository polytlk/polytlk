import { z } from 'zod';

export const envSchema = z.discriminatedUnion("TARGET_ENV", [
    z.object({ TARGET_ENV: z.literal("msw"), BASE_URL:  z.literal("http://localhost:4200"), CLIENT_ID_WEB: z.literal("540933041586-61juofou98dd54ktk134ktfec2c84gd3.apps.googleusercontent.com")}),
    z.object({ TARGET_ENV: z.literal("local"), BASE_URL:  z.literal("http://localhost:8080"), CLIENT_ID_WEB: z.literal("540933041586-61juofou98dd54ktk134ktfec2c84gd3.apps.googleusercontent.com")}),
    z.object({ TARGET_ENV: z.literal("development"), BASE_URL: z.literal("https://dev.api.polytlk.io"), CLIENT_ID_WEB: z.literal("1048294563394-dk9or7n1rbindlioiq9esda80erktjkh.apps.googleusercontent.com")}),
]);

export type EnvType = z.infer<typeof envSchema>;
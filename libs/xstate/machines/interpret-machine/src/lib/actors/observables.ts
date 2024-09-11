import { EventObject, fromCallback } from 'xstate';
import { z } from 'zod';

const ariDataSchema = z.object({
  words: z.array(z.tuple([z.string(), z.string(), z.string()])),
  meaning: z.string(),
  dialogue: z.array(z.tuple([z.string(), z.string(), z.string()])),
});

export type ariData = z.infer<typeof ariDataSchema>;

const schema = z.object({
  ari_data: z.string(),
});

export const interpretation$ = fromCallback<
  EventObject,
  { baseUrl: string; taskId: string; token: string }
>(({ sendBack, input }) => {
  const eventSource = new EventSource(
    `${input.baseUrl}/api/chinese/task/${input.taskId}/stream?key=${input.token}`
  );

  // Handle incoming messages
  eventSource.onmessage = (event) => {
    try {
      const { ari_data } = schema.parse(JSON.parse(event.data));
      const d = JSON.parse(ari_data);
      const data = ariDataSchema.parse(d);
      sendBack({ type: 'TASK_COMPLETE', data: data });
    } catch (e) {
      console.log('z validation error', e);
      sendBack({ type: 'TASK_ERROR' });
    }
  };

  // Handle errors
  eventSource.onerror = (error) => {
    console.log('event source on error', error);
    sendBack({ type: 'TASK_ERROR' });
  };

  // Cleanup when unsubscribed
  return () => {
    eventSource.close();
  };
});

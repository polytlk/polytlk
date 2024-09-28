import { EventObject, fromCallback } from 'xstate';
import { z } from 'zod';

import { taskStreamTaskTaskIdStreamGetResponse } from '../gen/zod';

export type ariData = z.infer<
  typeof taskStreamTaskTaskIdStreamGetResponse.shape.ari_data
>;

export const interpretation$ = fromCallback<
  EventObject,
  { baseUrl: string; taskId: string; token: string }
>(({ sendBack, input }) => {
  const eventSource = new EventSource(
    `${input.baseUrl}/api/chinese/task/${input.taskId}/stream?key=${input.token}`
  );

  // Handle incoming messages
  eventSource.onmessage = ({ data }) => {
    try {
      const { ari_data } = taskStreamTaskTaskIdStreamGetResponse.parse(
        JSON.parse(data)
      );
      sendBack({ type: 'TASK_COMPLETE', data: ari_data });
    } catch (e) {
      console.log('eventSource.onmessage -> catch -> e', e);
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

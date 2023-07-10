import { rest } from 'msw';

const baseUrl = 'api/chinese';

const s = {
  response:
    'Words used in the text:\n- \u4f60 (n\u01d0) - you\n- \u60f3 (xi\u01ceng) - want\n- \u627e (zh\u01ceo) - to find\n- \u6211 (w\u01d2) - me\n- \u804a\u5929 (li\u00e1oti\u0101n) - chat\n- \u968f\u65f6 (su\u00edsh\u00ed) - anytime\n- \u90fd\u53ef\u4ee5 (d\u014du k\u011by\u01d0) - can\n\nOverall meaning of the text:\n"You can find me to chat anytime you want."\n\nExample dialogue:\nPerson A: \u4f60\u60f3\u627e\u6211\u804a\u5929\u968f\u65f6\u90fd\u53ef\u4ee5\u5417\uff1f(N\u01d0 xi\u01ceng zh\u01ceo w\u01d2 li\u00e1oti\u0101n su\u00edsh\u00ed d\u014du k\u011by\u01d0 ma?) | "Can you find me to chat anytime you want?"\nPerson B: \u662f\u7684\uff0c\u6211\u6709\u4e9b\u4e8b\u60c5\u60f3\u548c\u4f60\u804a\u4e00\u4e0b\u3002(Sh\u00ec de, w\u01d2 y\u01d2u xi\u0113 sh\u00ecq\u00edng xi\u01ceng h\u00e9 n\u01d0 li\u00e1o y\u012bxi\u00e0.) | "Yes, I have some things I want to talk to you about."',
  ari_data:
    '{\n  "words": [\n    ["\u4f60", "n\u01d0", "you"],\n    ["\u60f3", "xi\u01ceng", "want"],\n    ["\u627e", "zh\u01ceo", "to find"],\n    ["\u6211", "w\u01d2", "me"],\n    ["\u804a\u5929", "li\u00e1oti\u0101n", "chat"],\n    ["\u968f\u65f6", "su\u00edsh\u00ed", "anytime"],\n    ["\u90fd\u53ef\u4ee5", "d\u014du k\u011by\u01d0", "can"]\n  ],\n  "meaning": "You can find me to chat anytime you want.",\n  "dialogue": [\n    ["\u4f60\u60f3\u627e\u6211\u804a\u5929\u968f\u65f6\u90fd\u53ef\u4ee5\u5417\uff1f", "N\u01d0 xi\u01ceng zh\u01ceo w\u01d2 li\u00e1oti\u0101n su\u00edsh\u00ed d\u014du k\u011by\u01d0 ma?", "Can you find me to chat anytime you want?"],\n    ["\u662f\u7684\uff0c\u6211\u6709\u4e9b\u4e8b\u60c5\u60f3\u548c\u4f60\u804a\u4e00\u4e0b\u3002", "Sh\u00ec de, w\u01d2 y\u01d2u xi\u0113 sh\u00ecq\u00edng xi\u01ceng h\u00e9 n\u01d0 li\u00e1o y\u012bxi\u00e0.", "Yes, I have some things I want to talk to you about."]\n  ]\n}',
};

export const chineseHandlers = [
  rest.post(`${baseUrl}/interpretation`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ task_id: 'af39f6f9-fa0c-4b9d-86c3-4804b2a3ffb0' })
    );
  }),

  rest.get(
    `${baseUrl}/task/af39f6f9-fa0c-4b9d-86c3-4804b2a3ffb0/stream`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.set('Connection', 'keep-alive'),
        ctx.set('Content-Type', 'text/event-stream'),
        ctx.body(`data: ${JSON.stringify(s)}\n\n`)
      );
    }
  ),
];

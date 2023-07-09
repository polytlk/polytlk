import { rest } from 'msw'

const baseUrl = 'api/auth';

export const authHandlers = [
    rest.post(`${baseUrl}/exchange`, (_, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({ "token": "eyJvcmciOiI1ZTlkOTU0NGExZGNkNjAwMDFkMGVkMjAiLCJpZCI6Ik5XMV8tYzhfOWNyZEd4UjdGaE41NTQtbFlSSG1nekM0anF6OUhqVGdYeEUiLCJoIjoibXVybXVyMTI4In0=" }),
        )
    }),
]
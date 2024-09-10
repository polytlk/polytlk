import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { fromPromise } from 'xstate';
import { CapacitorHttp } from '@capacitor/core';


export const KEY = 'authToken';


export const getTokenData = (token: string) => {
    return JSON.parse(atob(token));
};


export const fetchCookie = fromPromise(async () => {
    const {value} = await SecureStoragePlugin.get({ key: KEY })
    return value
}
)

export const setCookie = fromPromise(async ({ input }: { input: { token: string } }) => {
    await SecureStoragePlugin.set({ key: KEY, value: input.token })
    const { id }  = getTokenData(input.token);
    return id
}
)

export const validateCookie = fromPromise(async ({ input }: { input: { baseUrl: string, token: string } }) => {
    const response = await CapacitorHttp.post({
        url: `${input.baseUrl}/api/auth/check/`,
        headers: {
            'Content-Type': 'application/json',
        },
        data: { key: input.token },
    })

    if (response.status === 200) {
        return getTokenData(input.token).id;
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    }

    throw Error('invalid cookie')
});
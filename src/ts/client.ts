import type {Config} from '@/config.ts'

export interface ConfigResult {
    errors: Error[]
    data: null | Config
}

export interface Client {
    getConfig(): Promise<ConfigResult>
}

export function newClient(endpoint: URL) {
    return new BasicClient(endpoint)
}

class BasicClient implements Client {
    private readonly endpoint: URL

    constructor(endpoint: URL) {
        this.endpoint = endpoint
    }

    async getConfig(): Promise<ConfigResult> {
        const res = await fetch(this.endpoint + '/config')
        const rv = {
            data: null,
            errors: []
        } as ConfigResult
        if (res.status === 200) {
            const data = await res.json()
            rv.data = data.config
            rv.errors = rv.errors.concat(data.errors)
        } else {
            rv.errors.push(new Error(res.statusText))
        }
        return rv
    }
}

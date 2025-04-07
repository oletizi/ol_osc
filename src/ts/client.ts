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
        return get(new URL(this.endpoint + '/config'))
    }
}

async function get(endpoint: URL) : Promise<{data: any, errors: Error[]}> {
    const res = await fetch(endpoint, {})
    const rv = {
        data: null,
        errors: [] as Error[]
    }
    if (res.status === 200) {
        const data = await res.json()
        rv.data = data.data
        rv.errors = rv.errors.concat(data.errors)
    } else {
        rv.errors.push(new Error(res.status + ': ' + res.statusText))
    }
    return rv
}

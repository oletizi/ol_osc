import type {Config} from '@/config.ts'

export interface ConfigResult {
    errors: Error[]
    data: null | Config
}

export interface PlughostClient {
    getConfig(): Promise<ConfigResult>
}

export async function newClient(endpoint: URL) : Promise<PlughostClient> {
    return new BasicClient(endpoint)
}

class BasicClient implements PlughostClient {
    private readonly endpoint: URL

    constructor(endpoint: URL) {
        this.endpoint = endpoint
    }

    async getConfig(): Promise<ConfigResult> {
        return get(new URL(this.endpoint + '/config'))
    }
}

async function get(endpoint: URL) : Promise<{data: any, errors: Error[]}> {
    const res = await fetch(endpoint, {mode: 'cors'})
    const rv = {
        data: null,
        errors: [] as Error[]
    }
    if (res.status === 200) {
        const data = await res.json()
        rv.data = data.data
        rv.errors = rv.errors.concat(data.errors)
    } else {
        console.error(`Error fetching ${endpoint}: ${res.status}: ${res.statusText}`)
        rv.errors.push(new Error(res.status + ': ' + res.statusText))
    }
    return rv
}

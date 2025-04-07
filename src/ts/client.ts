import type {Config} from '@/config.ts'

export interface ConfigResult {
    errors: Error[]
    data: null | Config
}

export interface Client {
    getConfig(): Promise<ConfigResult>
}

export function newClient(endpoint: URL) {
    console.log(`newClient: endpoint: ${endpoint}`)
    return new BasicClient(endpoint)
}

class BasicClient implements Client {
    private readonly endpoint: URL

    constructor(endpoint: URL) {
        this.endpoint = endpoint
    }

    async getConfig(): Promise<ConfigResult> {
        let url = new URL(this.endpoint + '/config')
        console.log(`getConfig: endpoint: ${this.endpoint}`)
        console.log(`getConfig: url: ${url}`)
        const result = get(url)
        console.log(`getConfig: result: ${JSON.stringify(result)}`)
        return result
    }
}

async function get(endpoint: URL) : Promise<{data: any, errors: Error[]}> {
    console.log(`get: endpoint ${endpoint}`)
    const res = await fetch(endpoint, {})
    const rv = {
        data: null,
        errors: [] as Error[]
    }
    if (res.status === 200) {
        const data = await res.json()
        console.log(`get: endpoint ${endpoint}; data: ${JSON.stringify(data)}a`)
        rv.data = data.data
        rv.errors = rv.errors.concat(data.errors)
        console.log(`rv: ${JSON.stringify(rv)}`)
    } else {
        console.log(`Error: ${res.status}`)
        rv.errors.push(new Error(res.status + ': ' + res.statusText))
    }
    return rv
}

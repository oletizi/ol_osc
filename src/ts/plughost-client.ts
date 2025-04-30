import type {Config} from '@/config.ts'

export interface Result {
    errors: Error[]
    data: null | string | Config
}


export interface PlughostClient {
    getConfig(): Promise<Result>

    saveConfig(config: Config | null | undefined): Promise<Result>
}

export async function newClient(endpoint: URL): Promise<PlughostClient> {
    return new BasicClient(endpoint)
}

class BasicClient implements PlughostClient {
    private readonly endpoint: URL

    constructor(endpoint: URL) {
        this.endpoint = endpoint
    }

    saveConfig(config: Config): Promise<Result> {
        return post(new URL(this.endpoint + '/config'), config)
    }

    async getConfig(): Promise<Result> {
        return get(new URL(this.endpoint + '/config'))
    }
}

async function get(endpoint: URL): Promise<Result> {
    return doIt(endpoint, 'GET')
}

async function post(endpoint: URL, body: Object): Promise<Result> {
    return doIt(endpoint, 'POST', body)
}

async function doIt(endpoint: URL, method: string, body?: Object): Promise<Result> {
    const init: RequestInit = {mode: 'cors', method: method}
    if (method === 'POST' && body) {
        init.body = JSON.stringify(body)
        init.headers = {'Content-Type': 'application/json'}
    }
    const res = await fetch(endpoint, init)
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

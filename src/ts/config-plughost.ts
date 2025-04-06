export interface HostConfig {
    getExecutablePath(): string
}

export async function newHostConfig() {
    return {
        getExecutablePath(): string {
            return '/usr/local/bin/plughost'
        }
    } as HostConfig
}
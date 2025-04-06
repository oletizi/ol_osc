import type {Device} from '@/model.ts'

export interface HostConfig {
    getExecutablePath(): string
    getAudioInputDevice(): Device
    getAudioOutputDevice(): Device
    getMidiInputDevice(): Device
    getAvailablePlugins(): Device[]
    getActivePluginChain(): Device[]
}

export async function newHostConfig(): Promise<HostConfig> {
    return {
        getActivePluginChain(): Device[] {
            return []
        },
        getAvailablePlugins(): Device[] {
            return []
        },
        getAudioInputDevice(): Device {
            return {type: 'UNKOWN', id: 'UNKOWN', name: 'UNKNOWN', parameters: []}
        }, getAudioOutputDevice(): Device {
            return {type: 'UNKNOWN', id: 'UNKNOWN', name: 'UNKNOWN', parameters: []}
        }, getMidiInputDevice(): Device {
            return {type: 'UNKOWN', id: 'UNKNOWN', name: 'UNKNOWN', parameters: []}
        },
        getExecutablePath(): string {
            return '/usr/local/bin/plughost'
        }
    }
}
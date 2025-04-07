import type {AvailableResources, Device} from '@/model.ts'
import * as os from 'node:os'
import path from 'path'
import * as fs from 'fs/promises'

export interface HostConfig {
    getDataPath(): string

    getExecutablePath(): string

    getAvailableResourcesConfigPath(): string

    getAudioInputDevice(): Device

    getAudioOutputDevice(): Device

    getMidiInputDevice(): Device

    getAvailableResources(): AvailableResources

    getActivePluginChain(): Device[]
}

export async function newHostConfig(dataPath: string = path.join(os.homedir(), '.config', 'plughost')): Promise<HostConfig> {
    const availableResourcesConfigPath = path.join(dataPath, 'available.json')
    try {
        await fs.stat(dataPath)
    } catch (e) {
        await fs.mkdir(dataPath, {recursive: true})
    }
    let availableResources: AvailableResources
    try {
        availableResources = JSON.parse((await fs.readFile(availableResourcesConfigPath)).toString())
    } catch (e) {
        // @ts-ignore
        console.error(`Error loading available resources: ${e.message}`)
        availableResources = {
            audioInputDevices: [],
            audioOutputDevices: [],
            midiInputDevices: [],
            plugins: []
        }
    }

    return {
        getAvailableResourcesConfigPath(): string {
            return availableResourcesConfigPath
        },
        getDataPath(): string {
            return dataPath
        },
        getActivePluginChain(): Device[] {
            return []
        },
        getAvailableResources(): AvailableResources {
            return availableResources
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
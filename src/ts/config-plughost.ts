import type {AvailableResources, Device} from '@/model.ts'
import * as os from 'node:os'
import path from 'path'
import * as fs from 'fs/promises'

export interface HostConfig {
    dataPath: string

    executablePath: string

    availableResourcesConfigPath: string

    audioInputDevice: Device

    audioOutputDevice: Device

    midiInputDevice: Device

    availableResources: AvailableResources

    activePluginChain: Device[]
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
        availableResourcesConfigPath: availableResourcesConfigPath,
        dataPath: dataPath,
        activePluginChain: [],
        availableResources: availableResources,
        audioInputDevice: {type: 'UNKOWN', id: 'UNKOWN', name: 'UNKNOWN', parameters: []},
        audioOutputDevice: {type: 'UNKNOWN', id: 'UNKNOWN', name: 'UNKNOWN', parameters: []},
        midiInputDevice: {type: 'UNKOWN', id: 'UNKNOWN', name: 'UNKNOWN', parameters: []},
        executablePath: '/usr/local/bin/plughost'
    }
}
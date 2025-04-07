import type {AvailableResources, Device} from '@/model.ts'
import * as os from 'node:os'
import path from 'path'
import * as fs from 'fs/promises'
import {deepCopy} from '@/lib.ts'

export interface HostConfig {
    dataPath: string

    executablePath: string

    audioInputDevice: Device

    audioOutputDevice: Device

    midiInputDevice: Device

    availableResources: AvailableResources

    activePluginChain: Device[]
}

function getHostConfigPath(dataPath: string): string {
    return path.join(dataPath, 'host.json')
}

function getAvailableResourcesConfigPath(dataPath: string) {
    return path.join(dataPath, 'available.json')
}

export async function newHostConfig(dataPath: string = path.join(os.homedir(), '.config', 'plughost')): Promise<HostConfig> {
    try {
        await fs.stat(dataPath)
    } catch (e) {
        await fs.mkdir(dataPath, {recursive: true})
    }

    // Attempt to load cached available resources

    let availableResources: AvailableResources
    try {
        availableResources = JSON.parse((await fs.readFile(getAvailableResourcesConfigPath(dataPath))).toString())
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

    // Attempt to load stored host config
    let hostConfig
    try {
        hostConfig = JSON.parse((await fs.readFile(getHostConfigPath(dataPath))).toString())
        hostConfig.availableResources = availableResources
    } catch (e) {
        hostConfig = {
            dataPath: null,
            availableResources: null,
            activePluginChain: [],
            audioInputDevice: {type: 'UNKOWN', id: 'UNKOWN', name: 'UNKNOWN', parameters: []},
            audioOutputDevice: {type: 'UNKNOWN', id: 'UNKNOWN', name: 'UNKNOWN', parameters: []},
            midiInputDevice: {type: 'UNKOWN', id: 'UNKNOWN', name: 'UNKNOWN', parameters: []},
            executablePath: '/usr/local/bin/plughost'
        }
    }
    hostConfig.dataPath =  dataPath
    hostConfig.availableResources = availableResources
    return hostConfig
}

export async function saveHostConfig(h: HostConfig) {
    const toSave = deepCopy(h)
    await fs.writeFile(getAvailableResourcesConfigPath(h.dataPath), JSON.stringify(toSave.availableResources), 'utf8')
    toSave.availableResources = {}
    await fs.writeFile(getHostConfigPath(h.dataPath), JSON.stringify(toSave), 'utf8')
}
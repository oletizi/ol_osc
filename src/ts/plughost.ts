import {type Config, saveConfig} from '@/config.ts'
import {execute} from '@oletizi/lib-runtime'
import type {Device} from '@/model.ts'
import path from 'path'
import * as fs from 'fs/promises'
import {genWidgetsFromSpec} from '@/gen'

export async function bakePlughostConfig(config: Config) {


    let outfile = path.join(config.dataDir, 'config')
    const hostConfig = config.hostConfig
    await fs.writeFile(outfile, '')
    await fs.appendFile(outfile, `Audio Input Device: <Type: ${hostConfig.audioInputDevice.type}>, <Name: ${config.hostConfig.audioInputDevice.name}>\n`)
    await fs.appendFile(outfile, `Audio Output Device: <Type: ${hostConfig.audioOutputDevice.type}>, <Name: ${hostConfig.audioOutputDevice.name}>\n`)
    await fs.appendFile(outfile, `Midi Input Device: <Name: ${hostConfig.midiInputDevice.name}>\n`)
    let cc = 80

    for (const device of config.hostConfig.activePluginChain) {
        await fs.appendFile(outfile, `Plugin: <Format: ${device.type}>, <Name: ${device.name}>\n`)
        for (const param of device.parameters) {
            if (param.name) {
                await fs.appendFile(outfile, `Plugin Parameter: <Format: ${device.type}>, <Plugin Name: ${device.name}>, <Parameter Name: ${param.name}>, <CC: ${cc++}>, <OSC: ${param.osc ? param.osc : oscPath(device.name, param.name)}>\n`)
            }
        }
    }

    // Write open-stage-control config
    outfile = path.join(config.dataDir, 'spec.json')
    await fs.writeFile(outfile, JSON.stringify({
        devices: config.hostConfig.activePluginChain.map(d => {
            for (const p of d.parameters) {
                if (!p.label || p.label === 'UNKNOWN') {
                    p.label = p.name
                }
                // open stage control doesn't like the leading slash—it adds its own, for some reason.
                p.osc = p.osc.replace('/', '')
            }
            return d
        })
    }, null, 2))
    await genWidgetsFromSpec(outfile, config.dataDir)
}

export async function updateAvailableResources(config: Config): Promise<Config> {
    const hostConfig = config.hostConfig
    const availablePlugins: Device[] = []
    const availableAudioInputDevices: Device[] = []
    const availableAudioOutputDevices: Device[] = []
    const availableMidiInputDevices: Device[] = []
    let currentPlugin: Device | null = null
    await execute(hostConfig.executablePath, ['--list'], {
        onData(buf: Buffer): void {
            const lines = buf.toString().split('\n')
            for (const line of lines) {
                if (line.startsWith('Plugin:')) {
                    console.log(`PLUGIN: ${line}`)
                    const name = parseArg(line, 'Name')
                    currentPlugin = {id: normalize(name), name: name, parameters: [], type: parseArg(line, 'Format')}
                    availablePlugins.push(currentPlugin)
                } else if (line.startsWith('Plugin Parameter:')) {
                    const name = parseArg(line, 'Name')
                    const paramName = parseArg(line, 'Parameter Name')
                    currentPlugin?.parameters.push({
                        description: 'UNKNOWN',
                        label: 'UNKNOWN',
                        name: paramName,
                        osc: oscPath(name, paramName),
                        type: ''
                    })
                } else if (line.startsWith('Audio Input Device')) {
                    console.log(`Audio input: ${line}`)
                    const name = parseArg(line, 'Name')
                    const type = parseArg(line, 'Type')
                    availableAudioInputDevices.push({id: type + name, name: name, parameters: [], type: type})
                } else if (line.startsWith('Audio Output Device')) {
                    console.log(`Audio Output Device: ${line}`)
                    const name = parseArg(line, 'Name')
                    const type = parseArg(line, 'Type')
                    availableAudioOutputDevices.push({id: type + name, name: name, parameters: [], type: type})
                } else if (line.startsWith('Midi Input Device')) {
                    console.log(`MIDI input device: ${line}`)
                    const name = parseArg(line, 'Name')
                    const type = parseArg(line, 'Type')
                    availableMidiInputDevices.push({id: type + name, name: name, parameters: [], type: type})
                }
            }
        },
        onStart(): void {
        }
    })
    const available = hostConfig.availableResources
    available.audioInputDevices = availableAudioInputDevices
    available.audioOutputDevices = availableAudioOutputDevices
    available.midiInputDevices = availableMidiInputDevices
    available.plugins = availablePlugins
    return saveConfig(config)
}

function normalize(name: string) {
    return name.toLowerCase().replaceAll(' ', '-')
}

function parseArg(line: string, arg: string): string {
    let rv = ''
    // XXX: I'm sure there's a better way to do this...
    if (line.indexOf(arg + ': ') >= 0) {
        const start = line.indexOf(arg) + arg.length + 2
        const end = line.substring(start).indexOf('>') + start
        rv = line.substring(start, end)
    }
    return rv
}

function oscPath(deviceName: string, paramName: string): string {
    return `/${normalize(deviceName)}/${normalize(paramName)}`
}
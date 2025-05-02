import {type Config, saveConfig} from '@/config.ts'
import {execute} from '@oletizi/lib-runtime'
import type {Device} from '@/model.ts'
import path from 'path'
import * as fs from 'fs/promises'

export async function bakePlughostConfig(config: Config) {
    const outfile = path.join(config.dataDir, 'config')
    const hostConfig = config.hostConfig
    await fs.writeFile(outfile, '')
    await fs.appendFile(outfile, `Audio Input Device: <Type: ${hostConfig.audioInputDevice.type}>, <Name: ${config.hostConfig.audioInputDevice.name}>\n`)
    await fs.appendFile(outfile, `Audio Output Device: <Type: ${hostConfig.audioOutputDevice.type}>, <Name: ${hostConfig.audioOutputDevice.name}>\n`)
    await fs.appendFile(outfile, `Midi Input Device: <Name: ${hostConfig.midiInputDevice.name}>\n`)
    for (const device of config.hostConfig.activePluginChain) {
        // Plugin: <Format: AudioUnit>, <Name: HRTFPanner>
        // Plugin Parameter: <Format: AudioUnit>, <Plugin Name: HRTFPanner>, <Parameter Name: gain>
        // Plugin Parameter: <Format: AudioUnit>, <Plugin Name: HRTFPanner>, <Parameter Name: azimuth>
        // Plugin Parameter: <Format: AudioUnit>, <Plugin Name: HRTFPanner>, <Parameter Name: elevation>
        // Plugin Parameter: <Format: AudioUnit>, <Plugin Name: HRTFPanner>, <Parameter Name: distance>
        // Plugin Parameter: <Format: AudioUnit>, <Plugin Name: HRTFPanner>, <Parameter Name: coordinate scale>
        // Plugin Parameter: <Format: AudioUnit>, <Plugin Name: HRTFPanner>, <Parameter Name: reference distance>
        await fs.appendFile(outfile, `Plugin: <Format: ${device.type}>, <Name: ${device.name}>\n`)
        for (const param of device.parameters) {
            await fs.appendFile(outfile, `Plugin Parameter: <Format: ${device.type}>, <Plugin Name: ${device.name}>, <Parameter Name: ${param.name}>\n`)
        }
    }
}

// Audio Input Device: <Type: CoreAudio>, <Name: BlackHole 64ch>
// Audio Input Device: <Type: CoreAudio>, <Name: MacBook Pro Microphone>
// Audio Input Device: <Type: CoreAudio>, <Name: Orion’s iPhone 15 Microphone>
// Audio Input Device: <Type: CoreAudio>, <Name: NoMachine Audio Adapter>
// Audio Input Device: <Type: CoreAudio>, <Name: NoMachine Microphone Adapter>
// Audio Input Device: <Type: CoreAudio>, <Name: Aggregate Device>
// Audio Output Device: <Type: CoreAudio>, <Name: BlackHole 64ch>
// Audio Output Device: <Type: CoreAudio>, <Name: External Headphones>
// Audio Output Device: <Type: CoreAudio>, <Name: MacBook Pro Speakers>
// Audio Output Device: <Type: CoreAudio>, <Name: NoMachine Audio Adapter>
// Audio Output Device: <Type: CoreAudio>, <Name: NoMachine Microphone Adapter>
// Audio Output Device: <Type: CoreAudio>, <Name: Aggregate Device>
// Midi Input Device: <Name: Network m4-mini>
// Midi Input Device: <Name: virtual1>
// Midi Input Device: <Name: virtual2>
// Midi Input Device: <Name: from Max 1>
// Midi Input Device: <Name: from Max 2>
// Midi Input Device: <Name: Logic Pro Virtual Out>
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
                    currentPlugin?.parameters.push({
                        description: 'UNKNOWN',
                        label: 'UNKNOWN',
                        name: parseArg(line, 'Parameter Name'),
                        osc: normalize(name),
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
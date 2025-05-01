import {type Config, saveConfig} from '@/config.ts'
import {execute} from '@oletizi/lib-runtime'
import type {Device} from '@/model.ts'
import path from 'path'
import * as fs from 'fs/promises'

export async function bakePlughostConfig(config: Config) {
    const outfile = path.join(config.dataDir, 'config')
    await fs.writeFile(outfile, '')
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
            await fs.appendFile(outfile, `Plugin Parameter: <Format: ${device.type}>, <Plugin Name: ${param.name}>\n`)
        }
    }
}

export async function updateAvailableResources(config: Config): Promise<Config> {
    const hostConfig = config.hostConfig
    const availablePlugins: Device[] = []
    let currentPlugin: Device | null = null
    await execute(hostConfig.executablePath, ['--list'], {
        onData(buf: Buffer): void {
            const line = buf.toString()
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
            }
        },
        onStart(): void {
        }
    })
    const available = hostConfig.availableResources
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
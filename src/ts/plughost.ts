import {type Config, saveConfig} from '@/config.ts'
import {execute} from '@oletizi/lib-runtime'
import type {Device} from '@/model.ts'

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
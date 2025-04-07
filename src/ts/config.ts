import path from 'path'
import * as fs from 'fs/promises'
import * as os from 'node:os'
import {type HostConfig, newHostConfig, saveHostConfig} from '@/config-plughost.ts'
import type {OscDocument, Widget} from '@/model.ts'
import {deepCopy} from '@/lib.ts'

export interface ServerConfig {
}


export interface WidgetConfig {
    controlTop: number
    controlLeft: number
    controlWidth: number
    faderHeight: number

    newWidgetTitleTemplate(): Widget

    newWidgetFaderTemplate(): Widget

    newWidgetLabelTemplate(): Widget

    newOscDocumentTemplate(): OscDocument
}

export interface Config {
    dataDir: string

    serverConfig: ServerConfig

    widgetConfig: WidgetConfig

    hostConfig: HostConfig
}

export async function newServerConfig() {
    return {} as ServerConfig
}

export async function saveServerConfig(s: ServerConfig) {}

export async function newWidgetConfig() {
    const oscTemplate = JSON.parse((await fs.readFile(path.join('src', 'open-stage-control', 'template.json'))).toString())
    const [faderWidget, labelWidget, titleWidget] = oscTemplate['content']['widgets']
    return {
        controlTop: 100,
        controlLeft: 0,
        controlWidth: 50,
        faderHeight: 210,

        newWidgetTitleTemplate() {
            return deepCopy(titleWidget)
        },
        newWidgetFaderTemplate() {
            return deepCopy(faderWidget)
        },
        newWidgetLabelTemplate() {
            return deepCopy(labelWidget)
        },
        newOscDocumentTemplate() {
            const rv = deepCopy(oscTemplate)
            rv.content.widgets.length = 0
            return rv
        }
    } as WidgetConfig
}

export async function saveWidgetConfig(w: WidgetConfig) {
}

export async function newConfig(dataDir: string = path.join(os.homedir(), '.config', 'plughost')) {
    const stats = await fs.stat(dataDir)
    if (!stats.isDirectory()) {
        throw new Error(`${dataDir} is not a directory.`)
    }
    const widgetConfig = await newWidgetConfig()
    const serverConfig = await newServerConfig()
    const hostConfig = await newHostConfig(dataDir)
    return {
        dataDir: dataDir,
        widgetConfig: widgetConfig,
        serverConfig: serverConfig,
        hostConfig: hostConfig
    } as Config
}

export async function saveConfig(config: Config): Promise<Config> {
    await saveHostConfig(config.hostConfig)
    await saveWidgetConfig(config.widgetConfig)
    await saveServerConfig(config.serverConfig)
    return newConfig(config.dataDir)
}


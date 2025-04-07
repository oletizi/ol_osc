
import path from 'path'
import * as fs from 'fs/promises'
import * as os from 'node:os'
import {type HostConfig, newHostConfig} from '@/config-plughost.ts'
import type {OscDocument, Widget} from '@/model.ts'

export interface ServerConfig {
}

export async function newServerConfig() {
    return {} as ServerConfig
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
    getDataDir(): string

    getServerConfig(): ServerConfig

    getWidgetConfig(): WidgetConfig

    getHostConfig(): HostConfig
}


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



export async function newConfig(dataDir: string = path.join(os.homedir(), '.config', 'plughost')) {
    const stats = await fs.stat(dataDir)
    if (!stats.isDirectory()) {
        throw new Error(`${dataDir} is not a directory.`)
    }
    const widgetConfig = await newWidgetConfig()
    const serverConfig = await newServerConfig()
    const hostConfig = await newHostConfig(dataDir)
    return {
        getDataDir: () => {
            return dataDir
        },
        getWidgetConfig: () => {
            return widgetConfig
        },
        getServerConfig: () => {
            return serverConfig
        },
        getHostConfig: () => {
            return hostConfig
        }
    } as Config
}


function deepCopy(obj: any) {
    return JSON.parse(JSON.stringify(obj))
}
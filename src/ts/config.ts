import {type OscDocument, type Widget} from '@/gen.js'
import path from 'path'
import * as fs from 'fs/promises'
import * as os from 'node:os'

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

export async function newConfig(dataDir: string = path.join(os.homedir(), '.ol_juce_host')) {
    const stats = await fs.stat(dataDir)
    if (! stats.isDirectory()) {
        throw new Error(`${dataDir} is not a directory.`)
    }
    const widgetConfig = await newWidgetConfig()
    const serverConfig = await newServerConfig()
    return {
        getDataDir: () => {return dataDir},
        getWidgetConfig: () => {return widgetConfig},
        getServerConfig: () => {return serverConfig},
    } as Config
}


function deepCopy(obj: any) {
    return JSON.parse(JSON.stringify(obj))
}
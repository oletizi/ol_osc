import {type OscDocument, type Widget} from '@/gen.js'
import path from 'path'
import * as fs from 'fs/promises'
import * as os from 'node:os'

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
    serverConfig: ServerConfig
    widgetConfig: WidgetConfig
}

export async function newServerConfig(dataDir: string = path.join(os.homedir(), '.ol_juce_host')) {
    const stats = await fs.stat(dataDir)
    if (! stats.isDirectory()) {
        throw new Error(`${dataDir} is not a directory.`)
    }
    return {} as ServerConfig
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

export async function newConfig(dataDir?: string) {
    return {
        serverConfig: await newServerConfig(dataDir),
        widgetConfig: await newWidgetConfig()
    } as Config
}

function deepCopy(obj: any) {
    return JSON.parse(JSON.stringify(obj))
}
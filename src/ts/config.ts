import {type OscDocument, type Widget} from '@/gen.js'
import path from 'path'
import * as fs from 'fs/promises'

export interface Config {
    controlTop: number
    controlLeft: number
    controlWidth: number
    faderHeight: number
    newWidgetFaderTemplate(): Widget
    newWidgetLabelTemplate(): Widget
    newOscDocumentTemplate(): OscDocument
}

export async function newConfig() {
    const oscTemplate = JSON.parse((await fs.readFile(path.join('src', 'open-stage-control', 'template.json'))).toString())
    const [faderWidget, labelWidget] = oscTemplate['content']['widgets']
    return {
        controlTop: 100,
        controlLeft: 0,
        controlWidth: 50,
        faderHeight: 210,
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
    } as Config
}

function deepCopy(obj: any) {
    return JSON.parse(JSON.stringify(obj))
}
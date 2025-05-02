import {newWidgetConfig, type WidgetConfig} from '@/config.js'
import type {Device, Spec, Widget} from '@/model.ts'
import fs from 'fs/promises'
import path from 'path'


export function hydrateWidgets(json: string) {
    return JSON.parse(json) as Widget[]
}


export function hydrateSpec(json: string): Spec {
    return JSON.parse(json) as Spec
}

export function genWidgets(config: WidgetConfig, device: Device) {
    const rv: Widget[] = []
    let top = config.controlTop, left = config.controlLeft
    for (const p of device.parameters) {
        const fader = config.newWidgetFaderTemplate()
        fader.id = p.osc
        fader.left = left
        fader.top = top
        rv.push(fader)

        const label = config.newWidgetLabelTemplate()
        label.id = `l_${p.osc}`
        label.value = p.label
        label.top = top + config.faderHeight
        label.left = left
        rv.push(label)

        left += config.controlWidth
    }
    const title = config.newWidgetTitleTemplate()
    title.value= device.name
    rv.push(title)
    return rv
}

export async function genWidgetsFromSpec(specFilePath: string, root: string = 'build') {
    const config = await newWidgetConfig()
    const spec = hydrateSpec((await fs.readFile(specFilePath)).toString())
    try {
        await fs.stat(root)
    } catch (e) {
        await fs.mkdir(root)
    }
    for (const device of spec.devices) {
        const doc = config.newOscDocumentTemplate()
        doc.content.widgets = genWidgets(config, device)
        await fs.writeFile(path.join(root, device.id + '.json'), JSON.stringify(doc, null, 2), 'utf8')
    }
}
import type {WidgetConfig} from '@/config.js'
import type {Device, Spec, Widget} from '@/model.ts'


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
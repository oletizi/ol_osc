import type {Config} from '@/config.js'

export interface Widget {
    type: string
    id: string
    value: string
    top: number
    left: number
}

export interface OscDocument {
    content: {
        widgets: Widget[]
    }
}

export function hydrateWidgets(json: string) {
    return JSON.parse(json) as Widget[]
}

export interface Parameter {
    name: string
    description?: string
    osc: string
    label: string
    type: string
}

export interface Device {
    name: string
    id: string
    parameters: Parameter[]
}

export interface Spec {
    devices: Device[]
}

export function hydrateSpec(json: string): Spec {
    return JSON.parse(json) as Spec
}

export function genWidgets(config: Config, device: Device) {
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
    return rv
}
export interface Widget {
    type: string
    id: string
    value: string
    top: number
    left: number
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
    parameters: Parameter[]
}

export interface Spec {
    devices: Device[]
}

export function hydrateSpec(json: string): Spec {
    return JSON.parse(json) as Spec
}

export function genWidgets(device: Device) {
    const rv: Widget[] = []
    let top = 0, left = 0
    for (const p of device.parameters) {
        const fader: Widget = {
            id: p.name, left: left, top: top, type: 'fader', value: '0'
        }
        rv.push(fader)
        const label: Widget = {
            id: `l_${p.name}`, left: left, top: 150, type: 'text', value: p.label
        }
        rv.push(label)

        left += 50
    }
    return rv
}
export interface Widget {
    type: string
    id: string
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
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
    type: string
    parameters: Parameter[]
}

export interface Spec {
    devices: Device[]
}
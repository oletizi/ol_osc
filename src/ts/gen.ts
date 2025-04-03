import {newServerOutput} from "@oletizi/sampler-lib";

const out = newServerOutput(true, 'gen');
out.log('Hello, world!\n')

export function hydrateWidgets(json: string) {
    return JSON.parse(json) as Widget[]
}

export interface Widget {
    type: string
    id: string
    top: number
    left: number
}
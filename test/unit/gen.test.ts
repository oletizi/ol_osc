import * as fs from 'fs/promises'
import path from 'node:path'
import {hydrateSpec, hydrateWidgets} from '@/gen.js'
import {expect} from 'chai'

describe('gen basics', async () => {
    it('parses widgets', async () => {
        const widgets = hydrateWidgets((await fs.readFile(path.join('test', 'data', 'osc.json'))).toString())
        expect(widgets).to.exist
        expect(widgets.length).gte(2)
        const [w1, w2] = widgets
        expect(w1).to.exist
        if (w1) {
            expect(w1.type).eq('fader')
        }
        expect(w2).to.exist
        if (w2) {
            expect(w2.type).eq('text')
        }
    })
    it('parses specs', async () => {
        const spec = hydrateSpec((await fs.readFile(path.join('test', 'data', 'spec.json'))).toString())
        expect(spec).to.exist
        expect(spec.devices).to.exist
        expect(spec.devices.length).gte(1)
        const [device] = spec.devices
        expect(device).to.exist
        if (device) {
            expect(device.name).to.equal('Test Device')
            expect(device.parameters).to.exist
            expect(device.parameters.length).gte(1)
            const [parameter] = device.parameters
            expect(parameter).to.exist
            if (parameter) {
                expect(parameter.name).to.equal('Basic Parameter')
                expect(parameter.type).to.equal('fader')
                expect(parameter.osc).to.equal('/basic')
                expect(parameter.label).to.equal('basic')
            }
        }
    })
})
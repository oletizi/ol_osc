import * as fs from 'fs/promises'
import path from 'node:path'
import {genWidgets, hydrateSpec, hydrateWidgets} from '@/gen.js'
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
            expect(device.parameters.length).gte(2)
            const [p1] = device.parameters
            expect(p1).to.exist
            if (p1) {
                expect(p1.name).to.equal('Param 1')
                expect(p1.type).to.equal('fader')
                expect(p1.osc).to.equal('/param1')
                expect(p1.label).to.equal('param 1')
            }
        }
    })
    it('generates widgets', async () => {
        const widgetWidth = 50
        const faderHeight = 150
        const spec = hydrateSpec((await fs.readFile(path.join('test', 'data', 'spec.json'))).toString())
        expect(spec.devices.length).gte(1)
        if (spec.devices[0]) {
            const widgets = genWidgets(spec.devices[0])
            expect(widgets).to.exist
            expect(widgets.length).gte(4)
            const [f1, l1, f2, l2] = widgets

            expect(f1).to.exist
            expect(f1?.type).eq('fader')
            expect(f1?.top).eq(0)
            expect(f1?.left).eq(0)

            expect(l1).to.exist
            expect(l1?.type).eq('text')
            expect(l1?.value).eq('param 1')
            expect(l1?.top).eq(faderHeight)
            expect(l1?.left).eq(0)

            expect(f2).to.exist
            expect(f2?.top).eq(0)
            expect(f2?.left).eq(widgetWidth)

            expect(l2).to.exist
            expect(l2?.left).eq(widgetWidth)
            expect(l2?.top).eq(faderHeight)
        }
    })
})
import * as fs from 'fs/promises'
import path from 'node:path'
import {hydrateWidgets} from '@/gen.js'
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
})
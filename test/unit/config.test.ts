import {newServerConfig, newWidgetConfig} from '@/config.js'
import {expect} from 'chai'
import * as tmp from 'tmp'
import * as fs from 'fs/promises'

describe('WidgetConfig', async () => {
        it('has sensible defaults', async () => {
            const config = await newWidgetConfig()
            expect(config).to.exist
            expect(config.faderHeight)
            expect(config.controlWidth)

            const faderTemplate = config.newWidgetFaderTemplate()
            expect(faderTemplate).to.exist
            expect(faderTemplate.id).eq('UNKNOWN_FADER_ID')

            const labelTemplate = config.newWidgetLabelTemplate()
            expect(labelTemplate).to.exist
            expect(labelTemplate.id).eq('UNKNOWN_LABEL_ID')

            const oscDocumentTemplate = config.newOscDocumentTemplate()
            expect(oscDocumentTemplate).to.exist
            expect(oscDocumentTemplate.content.widgets.length).to.equal(0)
        })
    }
)

describe('ServerConfig', function () {
    this.beforeAll(async () => {
        tmp.setGracefulCleanup()
    })
    it('Barfs if dataDir does not exist', async () => {
        await newServerConfig('a directory that does not exist')
            .then(() => {
                throw new Error('Unexpected.')
            })
            .catch((e) => {
                expect(e.message).not.eq('Unexpected.')
            })
    })
    it(`Barfs if dataDir is not a directory.`, async () => {
        const bogus = tmp.fileSync()
        const stat = await fs.stat(bogus.name)
        expect(stat.isDirectory()).to.be.false
        try {
            await newServerConfig(bogus.name)
            // noinspection ExceptionCaughtLocallyJS
            throw new Error('Unexpected.')
        } catch (e) {
            // @ts-ignore
            expect(e.message).not.eq('Unexpected.')
        }
    })
    it('has sensible defaults', async () => {

    })
})
import {newConfig, newHostConfig, newWidgetConfig} from '@/config.js'
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

describe('HostConfig', async () => {
    it('exists', async () => {
        const config = await newHostConfig()
        expect(config).to.exist
        expect(config.getExecutablePath()).to.exist
        expect(config.getExecutablePath()).eq('/usr/local/bin/plughost')
    })
})

describe('Config', function () {
    let tmpdir = tmp.dirSync()
    this.beforeAll(async () => {
        tmp.setGracefulCleanup()
    })
    it('Barfs if dataDir does not exist', async () => {
        await newConfig('a directory that does not exist')
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
            await newConfig(bogus.name)
            // noinspection ExceptionCaughtLocallyJS
            throw new Error('Unexpected.')
        } catch (e) {
            // @ts-ignore
            expect(e.message).not.eq('Unexpected.')
        }
    })
    it('Has constituent configs', async () => {
        const config = await newConfig(tmpdir.name)
        expect(config).to.exist
        expect(config.getWidgetConfig()).to.exist
        expect(config.getServerConfig()).to.exist
        expect(config.getHostConfig()).to.exist
    })
    it('Does the right thing.', async () => {
        const dataDir = tmp.dirSync()
        const stat = await fs.stat(dataDir.name)
        expect(stat.isDirectory()).to.be.true
        const config = await newConfig(dataDir.name)
        expect(config.getDataDir()).to.equal(dataDir.name)
    })

})
import {newConfig, newWidgetConfig, saveConfig} from '@/config.js'
import {expect} from 'chai'
import * as tmp from 'tmp'
import * as fs from 'fs/promises'
import {newHostConfig} from '@/config-plughost.ts'
import type {DirResult} from 'tmp'


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
    })
})

describe('Config', function () {
    let tmpdir: DirResult

    this.beforeAll(async () => {
        tmp.setGracefulCleanup()
    })

    this.beforeEach(async () => {
        tmpdir = tmp.dirSync()
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
        expect(config.widgetConfig).to.exist
        expect(config.serverConfig).to.exist
        expect(config.hostConfig).to.exist
    })

    it('Does the right thing.', async () => {
        const dataDir = tmp.dirSync()
        const stat = await fs.stat(dataDir.name)
        expect(stat.isDirectory()).to.be.true
        const config = await newConfig(dataDir.name)
        expect(config.dataDir).to.equal(dataDir.name)
    })

    it('Saves and loads state', async () => {
        const c = await newConfig(tmpdir.name)
        c.hostConfig.audioInputDevice = {id: 'test-host-config', name: '', parameters: [], type: ''}
        const c2 = await saveConfig(c)
        expect(c2).to.exist
        expect(c2.hostConfig.audioInputDevice.id).to.equal(c.hostConfig.audioInputDevice.id)
    })

})
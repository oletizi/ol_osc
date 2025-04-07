import {newHostConfig} from '@/config-plughost.ts'
import {expect} from 'chai'
import tmp, {type DirResult} from 'tmp'
import path from 'path'
import * as fs from 'fs/promises'

describe('config-plughost', async () => {
    let tmpDir: DirResult
    before(async () => {
        tmp.setGracefulCleanup()
    })
    beforeEach(() => {
        tmpDir = tmp.dirSync()
    })

    it('creates config directory if it does not exist', async () => {
        const cfg = await newHostConfig(path.join(tmpDir.name, 'make-me'))
        expect(cfg).to.exist
        expect(cfg.dataPath).to.exist
        expect((await fs.stat(cfg.dataPath)).isDirectory())
    })

    it('has sensible defaults', async () => {
        let config = await newHostConfig(tmpDir.name)
        console.log(`available path: ${config.availableResourcesConfigPath}`)
        expect(config).to.exist
        expect(config.executablePath).to.exist
        expect(config.availableResourcesConfigPath).to.exist
        expect(config.availableResourcesConfigPath.startsWith(tmpDir.name))
        expect(config.availableResources).to.exist
        expect(config.activePluginChain).to.exist
        expect(config.audioInputDevice).to.exist
        expect(config.audioOutputDevice).to.exist
        expect(config.midiInputDevice).to.exist

        let available = config.availableResources
        expect(available.audioInputDevices).to.exist
        expect(available.audioOutputDevices).to.exist
        expect(available.midiInputDevices).to.exist
        expect(available.plugins).to.exist

        const device = {id: 'mock-device', name: 'Mock Device', parameters: [], type: 'Mock Plugin'}
        available.plugins.push(device)
        await fs.writeFile(config.availableResourcesConfigPath, JSON.stringify(available, null, 2))
        config = await newHostConfig(tmpDir.name)
        expect(config).to.exist
        expect(config.availableResources).to.exist
        available = config.availableResources
        expect(available.plugins).to.exist
        expect(available.plugins.length).eq(1)
        // @ts-ignore
        expect(available.plugins[0].name).to.equal(device.name)

    })
})
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
        expect(cfg.getDataPath()).to.exist
        expect((await fs.stat(cfg.getDataPath())).isDirectory())
    })

    it('has sensible defaults', async () => {
        let config = await newHostConfig(tmpDir.name)
        console.log(`available path: ${config.getAvailableResourcesConfigPath()}`)
        expect(config).to.exist
        expect(config.getExecutablePath()).to.exist
        expect(config.getAvailableResourcesConfigPath()).to.exist
        expect(config.getAvailableResourcesConfigPath().startsWith(tmpDir.name))
        expect(config.getAvailableResources()).to.exist
        expect(config.getActivePluginChain()).to.exist
        expect(config.getAudioInputDevice()).to.exist
        expect(config.getAudioOutputDevice()).to.exist
        expect(config.getMidiInputDevice()).to.exist

        let available = config.getAvailableResources()
        expect(available.audioInputDevices).to.exist
        expect(available.audioOutputDevices).to.exist
        expect(available.midiInputDevices).to.exist
        expect(available.plugins).to.exist

        const device = {id: 'mock-device', name: 'Mock Device', parameters: [], type: 'Mock Plugin'}
        available.plugins.push(device)
        await fs.writeFile(config.getAvailableResourcesConfigPath(), JSON.stringify(available, null, 2))
        config = await newHostConfig(tmpDir.name)
        expect(config).to.exist
        expect(config.getActivePluginChain()).to.exist
        available = config.getAvailableResources()
        expect(available.plugins).to.exist
        expect(available.plugins.length).eq(1)
        // @ts-ignore
        expect(available.plugins[0].name).to.equal(device.name)

    })
})
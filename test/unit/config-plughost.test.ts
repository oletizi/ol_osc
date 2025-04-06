import {newHostConfig} from '@/config-plughost.ts'
import {expect} from 'chai'

describe('config-plughost', async () => {
    it('exists', async () => {
        const config = await newHostConfig()
        expect(config).to.exist
        expect(config.getExecutablePath()).to.exist
        expect(config.getAvailablePlugins()).to.exist
        expect(config.getActivePluginChain()).to.exist
        expect(config.getAudioInputDevice()).to.exist
        expect(config.getAudioOutputDevice()).to.exist
        expect(config.getMidiInputDevice()).to.exist
    })
})
import {update} from '@/plughost.ts'
import {expect} from 'chai'
import {newConfig} from '@/config.ts'

describe('plughost', async () => {
    it('updates available resources in the local environment', async function () {
        this.timeout(30 * 1000)
        const config = (await update(await newConfig())).hostConfig
        expect(config).to.exist
        expect(config.getAvailableResources()).to.exist
        expect(config.getAvailableResources().plugins).to.exist
        expect(config.getAvailableResources().plugins.length).gte(1)
    })
})
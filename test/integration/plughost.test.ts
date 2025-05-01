import {updateAvailableResources} from '@/plughost.ts'
import {expect} from 'chai'
import {newConfig} from '@/config.ts'

describe('plughost', async () => {
    it('updates available resources in the local environment', async function () {
        this.timeout(30 * 1000)
        const config = (await updateAvailableResources(await newConfig())).hostConfig
        expect(config).to.exist
        expect(config.availableResources).to.exist
        expect(config.availableResources.plugins).to.exist
        expect(config.availableResources.plugins.length).gte(1)
    })

    it('bakes out plughost config based on web app config', async function () {
        this.timeout(30 * 1000)
        const config = await newConfig()
        console.log(`config`, config)
    })
})
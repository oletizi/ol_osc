import {update} from '@/plughost.ts'
import {expect} from 'chai'
import {newConfig} from '@/config.ts'

describe('plughost', async () => {
    it('updates available resources in the local environment', async function () {
        this.timeout(30 * 1000)
        const config = (await update(await newConfig())).getHostConfig()
        expect(config).to.exist
        expect(config.getAvailablePlugins().length).gte(1)
    })
})
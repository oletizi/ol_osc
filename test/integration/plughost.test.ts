import {bakePlughostConfig, updateAvailableResources} from '@/plughost.ts'
import tmp from 'tmp'
import {expect} from 'chai'
import {newConfig} from '@/config.ts'
import path from 'path'
import * as fs from 'node:fs'

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
        const dataDir = tmp.dirSync().name
        expect(fs.existsSync(dataDir))
        for (const name of ['available.json', 'host.json']) {
            const testData = path.join('test', 'data', 'config', name)
            fs.cpSync(testData, path.join(dataDir, name))
        }
        console.log('dataDir', dataDir)
        const config = await newConfig(dataDir)
        await bakePlughostConfig(config)
        const configFile = path.join(dataDir, 'config')
        expect(fs.existsSync(configFile)).to.be.true

        console.log(String(fs.readFileSync(configFile)))
    })
})
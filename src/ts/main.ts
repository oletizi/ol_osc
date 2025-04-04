import {Command} from 'commander'
import {genWidgets, hydrateSpec} from '@/gen.js'
import * as fs from 'fs/promises'
import {newConfig} from '@/config.js'

const program = new Command()
program
    .description('Config generator for ol_juce_host.')
    .version('0.0.1')
    .argument('<spec>')
    .action(doSpec)
program.parse(process.argv)

async function doSpec(filePath: string) {
    const config = await newConfig()
    const spec = hydrateSpec((await fs.readFile(filePath)).toString())
    for (const device of spec.devices) {
        const doc = config.newOscDocumentTemplate()
        doc.content.widgets = genWidgets(config, device)
        console.log(JSON.stringify(doc, null, 2))
    }
}
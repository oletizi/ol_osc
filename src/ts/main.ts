import {Command} from 'commander'
import {genWidgets, hydrateSpec} from '@/gen.js'
import * as fs from 'fs/promises'

const program = new Command()
program
    .description('Config generator for ol_juce_host.')
    .version('0.0.1')
    .argument('<spec>')
    .action(doSpec)
program.parse(process.argv)

async function doSpec(filePath: string) {
    const spec = hydrateSpec((await fs.readFile(filePath)).toString())
    for (const device of spec.devices) {
        console.log(device.name)
        console.log(genWidgets(device))
    }
}
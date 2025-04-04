import {Command} from 'commander'

const program = new Command()
program
    .description('Config generator for ol_juce_host.')
    .version('0.0.1')
    .argument('<spec>')
    .action(doSpec)
program.parse(process.argv)

async function doSpec(filePath: string) {
    console.log(`Spec path: ${filePath}`)
}
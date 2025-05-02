import {Command} from 'commander'
import {genWidgetsFromSpec} from '@/gen.js'

const program = new Command()
program
    .description('Config generator for ol_juce_host.')
    .version('0.0.1')
    .command('gen')
    .argument('<spec>')
    .action(genWidgetsFromSpec)
program.parse(process.argv)


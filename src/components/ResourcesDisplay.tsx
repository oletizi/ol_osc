import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import CloseIcon from '@mui/icons-material/Close'

import {useEffect, useState} from 'react'
import type {Config} from '@/config.ts'
import {newClient} from '@/plughost-client.ts'
import {Button} from '@/components/ui/button.tsx'
import type {Device} from '@/model.ts'

const picklistClasses: string = 'radius pt-1 border-1 border-secondary shadow-inner max-h-50 overflow-auto min-w-50'
const picklistItemClasses: string = 'text-sm pl-2 pr-4 py-1 hover:bg-secondary cursor-default flex justify-between items-center gap-2'

export function ResourcesDisplay({endpoint}: { endpoint: URL }) {
    const [config, setConfig] = useState<Config | null>()
    const [chosenPlugins, setChosenPlugins] = useState<Device[]>([])
    useEffect(() => {
        if (!config) {
            newClient(endpoint).then(client => client.getConfig().then(c => {
                setConfig(c.data as Config)
                if (c.data) {
                    setChosenPlugins((c.data as Config).hostConfig?.activePluginChain)
                }
            }))
        }
    })
    const availablePlugins: Device[] = config ? config.hostConfig.availableResources.plugins : []
    const onChosen = (device: Device) => {
        setChosenPlugins(chosenPlugins.concat([device]))
    }

    const onCommit = (devices: Device[]) => {
        if (config) {
            config.hostConfig.activePluginChain = devices
            newClient(endpoint).then(client => client.saveConfig(config).then(console.log))
        } else {
            console.error(new Error('Attempt to save null config'))
        }
    }

    return (<div className="flex gap-4">
        <AvailablePluginsDisplay available={availablePlugins} onChosen={onChosen}/>
        <ChosenPluginsDisplay currentActive={chosenPlugins} onCommit={onCommit}/>
    </div>)
}

function AvailablePluginsDisplay({available, onChosen}: { available: Device[], onChosen: (d: Device) => void }) {
    let counter = 0
    return (<Card>
            <CardHeader>
                <CardTitle>Available Plugins</CardTitle>
                <CardDescription>Plugins you can add.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className={picklistClasses}>
                    {available.map(p => (
                        <li className="text-sm pl-2 pr-4 py-1 hover:bg-secondary cursor-default flex gap-2"
                            key={counter++}
                            onClick={() => onChosen(p)}>
                            {p.name}</li>))}</ul>
            </CardContent>
        </Card>
    )
}

function ChosenPluginsDisplay({currentActive, onCommit}: { currentActive: Device[], onCommit: (d: Device[]) => void }) {
    const [chosenPlugins, setChosenPlugins] = useState<Device[]>(currentActive)
    useEffect(() => setChosenPlugins(currentActive), [currentActive])
    let counter = 0
    return (<Card>
            <CardHeader>
                <CardTitle>Active Plugin Chain</CardTitle>
                <CardDescription>Plugins you've added.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className={picklistClasses}>
                    {chosenPlugins.map((p, index) => (
                        <li className={picklistItemClasses} key={counter++}>
                            {p.name}
                            <CloseIcon className="max-w-4" onClick={() => {
                                console.log(`Removing plugin at`, index)
                                currentActive.splice(index, 1)
                                console.log(`Remaining plugins:`, currentActive)
                                setChosenPlugins(currentActive)
                            }}/></li>))}
                </ul>
            </CardContent>
            <CardFooter><Button onClick={() => onCommit(chosenPlugins)}>Apply</Button></CardFooter>
        </Card>
    )
}

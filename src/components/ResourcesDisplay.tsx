import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import {useEffect, useState} from 'react'
import type {Config} from '@/config.ts'
import {newClient} from '@/plughost-client.ts'
import {Button} from '@/components/ui/button.tsx'
import type {Device} from '@/model.ts'

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
        <ChosenPluginsDisplay chosen={chosenPlugins} onCommit={onCommit}/>
    </div>)
}

function AvailablePluginsDisplay({available, onChosen}: { available: Device[], onChosen: (d: Device) => void }) {
    let counter = 0
    return (<Card>
            <CardHeader>
                <CardTitle>Available Plugins</CardTitle>
                <CardDescription>Plugins you can add to the active plugin chain.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="radius pt-1 border-1 border-secondary shadow-inner max-h-50 overflow-auto">
                    {available.map(p => (
                        <li className="text-sm pl-2 pr-4 py-1 hover:bg-secondary cursor-default flex gap-2"
                            key={counter++}
                            onClick={() => onChosen(p)}>
                            {p.name}</li>))}</ul>
            </CardContent>
        </Card>
    )
}

function ChosenPluginsDisplay({chosen, onCommit}: { chosen: Device[], onCommit: (d: Device[]) => void }) {
    let counter = 0
    return (<Card>
            <CardHeader>
                <CardTitle>Active Plugin Chain</CardTitle>
                <CardDescription>The plugins you want to run.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="min-w-50">
                    {chosen.map(p => (<li className="text-sm" key={counter++}>{p.name}</li>))}
                </ul>
            </CardContent>
            <CardFooter><Button onClick={() => onCommit(chosen)}>Apply</Button></CardFooter>
        </Card>
    )
}

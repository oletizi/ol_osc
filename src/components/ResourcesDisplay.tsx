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
import {Checkbox} from '@/components/ui/checkbox'
import type {Device} from '@/model.ts'


export function ResourcesDisplay({endpoint}: { endpoint: URL }) {
    const [config, setConfig] = useState<Config | null>()
    useEffect(() => {
        if (!config) {
            newClient(endpoint).then(client => client.getConfig().then(c => setConfig(c.data)))//fetchConfig(endpoint, setConfig)
        }
    })
    return (<div className="flex gap-4">
        <AvailablePluginsDisplay endpoint={endpoint}/>
        <ChosenPluginsDisplay endpoint={endpoint}/>
    </div>)
}

function AvailablePluginsDisplay({endpoint}: { endpoint: URL }) {
    const [config, setConfig] = useState<Config | null>()
    useEffect(() => {
        if (!config) {
            newClient(endpoint).then(client => client.getConfig().then(c => setConfig(c.data)))//fetchConfig(endpoint, setConfig)
        }
    })
    return (<Card>
            <CardHeader>
                <CardTitle>Available Plugins</CardTitle>
                <CardDescription>Plugins you can add to the active plugin chain.</CardDescription>
            </CardHeader>
            <CardContent>
                {config ?
                    <ul className="radius pt-1 border-1 border-secondary shadow-inner max-h-50 overflow-auto">{config.hostConfig.availableResources.plugins.map(p => (
                        <li className="text-sm pl-2 pr-4 py-1 hover:bg-secondary cursor-default flex gap-2">
                            <Checkbox/> {p.name}</li>))}</ul> : ''}
            </CardContent>
        </Card>
    )
}

function ChosenPluginsDisplay({endpoint}: { endpoint: URL }) {
    const [config, setConfig] = useState<Config | null>()
    const [chosenPlugins, setChosenPlugins] = useState<Device[]>([])
    useEffect(() => {
        if (!config) {
            newClient(endpoint).then(client => client.getConfig().then(result => {
                const config = result.data
                if (config) {
                    setConfig(config)
                    setChosenPlugins(config.hostConfig.activePluginChain)
                }
            }))

        }
    })
    return (<Card>
        <CardHeader>
            <CardTitle>Active Plugin Chain</CardTitle>
            <CardDescription>The plugins you want to run.</CardDescription>
        </CardHeader>
        <CardContent>
            {chosenPlugins ? (
                <ul className="min-w-50">{chosenPlugins.length ? chosenPlugins.map(p => (<li>{p.name}</li>)) : (
                    <li>None yet.</li>)}</ul>) : 'Yikes.'}
        </CardContent>
        <CardFooter><Button>Apply</Button></CardFooter>
    </Card>)
}

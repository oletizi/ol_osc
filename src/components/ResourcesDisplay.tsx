import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from '@/components/ui/card'

import CloseIcon from '@mui/icons-material/Close'

import {useEffect, useState} from 'react'
import type {Config} from '@/config.ts'
import {newClient} from '@/plughost-client.ts'
import {Button} from '@/components/ui/button.tsx'
import type {Device} from '@/model.ts'
import {Skeleton} from '@/components/ui/skeleton.tsx'

const picklistClasses: string = 'radius pt-1 border-1 border-secondary shadow-inner max-h-50 overflow-auto min-w-50'
const picklistItemClasses: string = 'text-sm pl-2 pr-4 py-1 hover:bg-secondary cursor-default flex justify-between items-center gap-2'

export function ResourcesDisplay({endpoint}: { endpoint: URL }) {
    const [config, setConfig] = useState<Config | null>()
    const [availableAudioInputDevices, setAvailableAudioInputDevices] = useState<Device[]>([])
    const [chosenAudioInputDevice, setChosenAudioInputDevice] = useState<Device | null>(null)

    const [availableAudioOutputDevices, setAvailableAudioOutputDevices] = useState<Device[]>([])
    const [chosenAudioOutputDevice, setChosenAudioOutputDevice] = useState<Device | null>(null)

    const [availableMidiInputDevices, setAvailableMidiInputDevices] = useState<Device[]>([])
    const [chosenMidiInputDevice, setChosenMidiInputDevice] = useState<Device | null>(null)

    const [availableMidiOutputDevices, setAvailableMidiOutputDevices] = useState<Device[]>([])
    const [chosenMidiOutputDevice, setChosenMidiOutputDevice] = useState<Device | null>(null)

    const [availablePlugins, setAvailablePlugins] = useState<Device[]>([])
    const [chosenPlugins, setChosenPlugins] = useState<Device[]>([])

    const [ready, setReady] = useState<boolean>(false)
    useEffect(() => {
        if (!config) {
            newClient(endpoint).then(client => client.getConfig().then(r => {
                if (r.data) {
                    const c = (r.data as Config)
                    const hostConfig = c.hostConfig
                    const available = hostConfig.availableResources
                    console.log(`Available resources:`, available)
                    setConfig(c)
                    setAvailableAudioInputDevices(available.audioInputDevices)
                    setAvailableAudioOutputDevices(available.audioOutputDevices)
                    setAvailableMidiInputDevices(available.midiInputDevices)
                    setAvailableMidiOutputDevices(available.audioOutputDevices)
                    setAvailablePlugins(available.plugins)
                    setChosenPlugins(hostConfig.activePluginChain)
                    setReady(true)
                }
            }))
        }
    }, [config])
    const onChosenPlugin = (device: Device) => {
        setChosenPlugins(chosenPlugins.concat([device]))
    }

    const onCommit = (devices: Device[]) => {
        if (config) {
            config.hostConfig.activePluginChain = devices
            newClient(endpoint).then(client => client.saveConfig(config).then(() => client.bakeConfig(config).then(console.log)))
        } else {
            console.error(new Error('Attempt to save null config'))
        }
    }

    return ready ? (<div className="flex gap-4">
        <AvailableDevicesDisplay title="Available Plugins" description="Plugins you can use."
                                 available={availablePlugins} onChosen={onChosenPlugin}/>
        <ChosenPluginsDisplay currentActive={chosenPlugins} onCommit={onCommit}/>
        <div className="flex flex-col gap-4 justify-between">
            <AvailableDevicesDisplay title="Available Audio Input Devices" description="Audio inputs you can use"
                                     available={availableAudioInputDevices}
                                     onChosen={(d: Device) => setChosenAudioInputDevice(d)}/>
            <AvailableDevicesDisplay title="Available Audio Output Devices" description="Audio outputs you can use"
                                     available={availableAudioOutputDevices}
                                     onChosen={(d) => setChosenAudioOutputDevice(d)}/>
        </div>
        <Button
            onClick={() => newClient(endpoint).then(c => c.sync().then(r => setConfig(r.data as Config)))}>Sync</Button>
    </div>) : (<Card><Skeleton/></Card>)
}

function AvailableDevicesDisplay({title, description, available, onChosen}: {
    title: string,
    description: string,
    available: Device[],
    onChosen: (d: Device) => void
}) {
    let counter = 0
    return (<Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className={picklistClasses}>
                    {available.map(d => (
                        <li className="text-sm pl-2 pr-4 py-1 hover:bg-secondary cursor-default flex gap-2"
                            key={counter++}
                            onClick={() => onChosen(d)}>
                            {d.name}</li>))}</ul>
            </CardContent>
        </Card>
    )
}

function ChosenPluginsDisplay({currentActive, onCommit}: { currentActive: Device[], onCommit: (d: Device[]) => void }) {
    const [chosenPlugins, setChosenPlugins] = useState<Device[]>(currentActive)
    useEffect(() => {
        setChosenPlugins(currentActive)
    }, [currentActive]) // oof. Need useEffect to update chosenPlugins when currentActive changes.
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
                                chosenPlugins.splice(index, 1)
                                setChosenPlugins(chosenPlugins.concat([])) // oof. Concat to defeat optimization to not render same object
                            }}/></li>))}
                </ul>
            </CardContent>
            <CardFooter><Button onClick={() => onCommit(chosenPlugins)}>Apply</Button></CardFooter>
        </Card>
    )
}

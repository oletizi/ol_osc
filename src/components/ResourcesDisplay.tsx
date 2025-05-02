import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from '@/components/ui/card'

import CloseIcon from '@mui/icons-material/Close'

import {useEffect, useState} from 'react'
import type {Config} from '@/config.ts'
import {newClient} from '@/plughost-client.ts'
import {Button} from '@/components/ui/button.tsx'
import type {Device} from '@/model.ts'
import {Skeleton} from '@/components/ui/skeleton.tsx'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select.tsx'

const minWidth: string = 'min-w-50'
const picklistClasses: string = `radius pt-1 border-1 border-secondary shadow-inner max-h-50 overflow-auto ${minWidth}`
const picklistItemClasses: string = 'text-sm pl-2 pr-4 py-1 hover:bg-secondary cursor-default flex justify-between items-center gap-2'

export function ResourcesDisplay({endpoint}: { endpoint: URL }) {
    const [config, setConfig] = useState<Config | null>()
    const [availableAudioInputDevices, setAvailableAudioInputDevices] = useState<Device[]>([])
    const [chosenAudioInputDevice, setChosenAudioInputDevice] = useState<Device | undefined>(undefined)

    const [availableAudioOutputDevices, setAvailableAudioOutputDevices] = useState<Device[]>([])
    const [chosenAudioOutputDevice, setChosenAudioOutputDevice] = useState<Device | undefined>(undefined)

    const [availableMidiInputDevices, setAvailableMidiInputDevices] = useState<Device[]>([])
    const [chosenMidiInputDevice, setChosenMidiInputDevice] = useState<Device | undefined>(undefined)

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
                    console.log(`Setting chosing audio input devices:`, hostConfig.audioInputDevice)
                    setChosenAudioInputDevice(hostConfig.audioInputDevice)

                    setAvailableAudioOutputDevices(available.audioOutputDevices)
                    setChosenAudioOutputDevice(hostConfig.audioOutputDevice)

                    setAvailableMidiInputDevices(available.midiInputDevices)
                    setChosenMidiInputDevice(hostConfig.midiInputDevice)

                    setAvailablePlugins(available.plugins)
                    setChosenPlugins(hostConfig.activePluginChain)
                    setReady(true)
                }
            }))
        }
    }, [config])
    const onChosenPlugin = (device: Device) => {
        const updated = chosenPlugins.concat([device])
        if (config) {
            config.hostConfig.activePluginChain = updated
        }
        setChosenPlugins(updated)
    }

    const onUpdateActivePlugins = (devices: Device[]) => {
        if (config) {
            config.hostConfig.activePluginChain = devices
        } else {
            console.error(new Error('Attempt to save null config'))
        }
    }

    return ready ? (<div className="flex gap-4">
            <AvailableDevicesDisplay title="Available Plugins" description="Plugins you can use."
                                     available={availablePlugins} onChosen={onChosenPlugin}/>
            <ChosenPluginsDisplay currentActive={chosenPlugins} onUpdate={onUpdateActivePlugins}/>
            <div className="flex flex-col gap-4 justify-between">
                <AvailableDevicesPicker title="Audio Input Device" description="Audio inputs you can use."
                                        available={availableAudioInputDevices}
                                        initialChosen={chosenAudioInputDevice}
                                        onChosen={(d) => {
                                            if (d && config) {
                                                config.hostConfig.audioInputDevice = d
                                            }
                                            setChosenAudioInputDevice(d)
                                        }}/>
                <AvailableDevicesPicker title="Audio Output Device" description="Audio outputs you can use."
                                        available={availableAudioOutputDevices}
                                        initialChosen={chosenAudioOutputDevice}
                                        onChosen={(d) => {
                                            if (d && config) {
                                                config.hostConfig.audioOutputDevice = d
                                            }
                                            setChosenAudioOutputDevice(d)
                                        }}/>
            </div>
            <div className="flex flex-col gap-4 justify-between">
                <AvailableDevicesPicker title="MIDI Device" description="MIDI devices you can use"
                                        available={availableMidiInputDevices}
                                        initialChosen={chosenMidiInputDevice}
                                        onChosen={(d) => {
                                            if (d && config) {
                                                config.hostConfig.midiInputDevice = d
                                            }
                                            setChosenMidiInputDevice(d)
                                        }}
                />
            </div>
            <Button
                onClick={() => newClient(endpoint).then(async c => {
                    await c.saveConfig(config)
                    await c.bakeConfig(config)
                })}>Apply</Button>
            <Button
                onClick={() => newClient(endpoint).then(c => c.sync().then(r => setConfig(r.data as Config)))}>Sync</Button>
        </div>
    ) : (<Card><Skeleton/></Card>)
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

function AvailableDevicesPicker({title, description, available, initialChosen, onChosen}: {
    title: string,
    description: string,
    available: Device[],
    initialChosen: Device | undefined
    onChosen: (d: Device | undefined) => void
}) {
    console.log(`Initial chosen:`, initialChosen)
    return (<Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className={minWidth}>
            <Select value={initialChosen?.id} onValueChange={(v) => onChosen(available.find((d) => d.id === v))}>
                <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                <SelectContent>
                    {available.map(d => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                </SelectContent>
            </Select>
        </CardContent>
    </Card>)
}

function ChosenPluginsDisplay({currentActive, onUpdate}: { currentActive: Device[], onUpdate: (d: Device[]) => void }) {
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
                                const updated = chosenPlugins.concat([])
                                onUpdate(updated)
                                setChosenPlugins(updated) // oof. Concat to defeat optimization to not render same object
                            }}/></li>))}
                </ul>
            </CardContent>
        </Card>
    )
}

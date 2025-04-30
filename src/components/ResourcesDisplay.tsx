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

export function ResourcesDisplay({endpoint}: { endpoint: URL }) {
    const [config, setConfig] = useState<Config | null>()
    useEffect(() => {
        if (!config) {
            newClient(endpoint).then(async client => {
                const result = await client.getConfig()
                if (result.data) {
                    setConfig(result.data)
                }
                for (const e of result.errors) {
                    console.error(e)
                }
            })
        }
    })
    return (<Card>
            <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
                {config ?
                    <ul className="max-h-50 overflow-auto">{config.hostConfig.availableResources.plugins.map(p => (
                        <li>{p.name}</li>))}</ul> : ''}
            </CardContent>
            <CardFooter><Button>Apply</Button></CardFooter>
        </Card>
    )
}


import React, {useEffect, useState} from 'react'
import {newClient} from '@/plughost-client.ts'
import type {Config} from '@/config.ts'
import {Card} from './Card.tsx'

export function ConfigDisplay({endpoint}: { endpoint: URL }) {
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

    return (
        <Card title="Configuration">
            <pre className="p-4 max-h-50 overflow-auto border-1 border-gray-200 shadow-inner">{JSON.stringify(config, null, 2)}</pre>
    </Card>)
}
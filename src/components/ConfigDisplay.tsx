import React, {useEffect, useState} from 'react'
import {newClient} from '@/plughost-client.ts'
import type {Config} from '@/config.ts'

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

    return (<pre>{JSON.stringify(config, null, 2)}</pre>)
}
import express, {type Request, type Response} from 'express'
import {newConfig} from '@/config.ts'
import {updateAvailableResources} from '@/plughost.ts'

const port = 3000
const app = express()
app.use(express.json())


app.get('/api/hello', (_req: Request, res: Response) => {
    res.send({msg: 'Hello World!'})
})

app.get('/api/config', async (_req: Request, res: Response) => {
    console.log(`/api/config`)
    const config = await newConfig()
    console.log(`Config: ${JSON.stringify(config)}`)
    res.send({
            timestamp: Date.now(),
            errors: [],
            data: config
        }
    )
})

app.post('/api/config/update', async (_req: Request, res: Response) => {
    res.send({
        config: await updateAvailableResources(await newConfig()),
        timestamp: Date.now(),
    })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
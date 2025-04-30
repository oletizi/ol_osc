import express, {type Request, type Response} from 'express'
import {newConfig} from '@/config.ts'
import {updateAvailableResources} from '@/plughost.ts'

const port = 3000
const app = express()
app.use(express.json())
app.use((_req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
})


app.get('/api/hello', (_req: Request, res: Response) => {
    res.send({msg: 'Hello World!'})
})

app.get('/api/config', async (_req: Request, res: Response) => {
    let data = {}, errors = []
    try { data = await newConfig() } catch (e) { errors.push(e) }
    res.send({
            timestamp: Date.now(),
            errors: errors,
            data: data
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
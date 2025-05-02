import express, {type Request, type Response} from 'express'
import {type Config, newConfig, saveConfig} from '@/config.ts'
import {bakePlughostConfig, updateAvailableResources} from '@/plughost.ts'

const port = 3000
const app = express()
app.use(express.json({ limit: '2000kb' }))
app.use((_req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
})


app.get('/api/hello', (_req: Request, res: Response) => {
    res.send({msg: 'Hello World!'})
})

/**
 * Fetches the current web app json config from disk
 */
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

/**
 * Updates the web app json config based on the body of the request
 */
app.post('/api/config', async(req, res) => {
    const config = req.body as Config
    await saveConfig(config)
    res.send({timestamp: Date.now(), errors: [], data: 'ok'})
})

/**
 * Updates the web app json config based on the output of plughost
 */
app.post('/api/config/update', async (_req: Request, res: Response) => {
    res.send({
        config: await updateAvailableResources(await newConfig()),
    })
})

/**
 * Bakes out the plughost config based on the current web app config
 */
app.post("/api/config/bake", async (req: Request, res: Response) => {
    console.log(`Baking config...`)
    const config = req.body as Config
    await bakePlughostConfig(config)
    console.log(`Done baking config.`)
    res.send({timestamp: Date.now(), errors: [], data: 'ok'})
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
import express, {type Request, type Response} from 'express'
import {newConfig} from '@/config.ts'

const port = 3000
const app = express()
const config = await newConfig()
app.use(express.json())


app.get('/api/hello', (req: Request, res: Response) => {
    res.send({msg: 'Hello World!'})
})

app.get('/api/config', (req: Request, res: Response) => {
    res.send({config: config})
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
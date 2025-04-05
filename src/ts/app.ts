import express, {type Request, type Response} from 'express'

const port = 3000
const app = express()
app.use(express.json())
app.get('/api/hello', (req: Request, res: Response) => {
    res.send({msg: 'Hello World!'})
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
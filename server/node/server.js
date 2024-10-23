import express from 'express'
import cors from 'cors'
import * as fs from "node:fs";

const app = express()
const port = 3333

app.use(cors())

app.use('/data', express.static('../data'));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/articles', async (req, res) => {

    const articles = []
    const articlesNames = fs.readdirSync('../data/articles/')

    for (const article of articlesNames) {
        console.log(article)
        const object = {}
        const content = fs.readFileSync('../data/articles/' + article, 'utf8')
        object.title = (article.replaceAll('.md', ''))
        object.content = content
        articles.push(object)
    }

    console.log(articles)
    res.json(articles)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
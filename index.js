const connectToMongo = require('./db')
const cors = require('cors');

connectToMongo();

const express = require('express')
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || '8000'


// global middlewares
app.use(bodyParser.json())

// define routes
app.get('*', (req, res) => {
  res.send({ drosse: 8000 });
})

// start server
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
})

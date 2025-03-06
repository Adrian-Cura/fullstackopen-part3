const express = require('express')
const cors = require('cors')
const app = express()
const Contact = require('./models/phonebook')
app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

const morgan = require('morgan')

morgan.token('body', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})

app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      tokens.body(req, res),
    ].join(' ')
  })
)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

app.get('/api/persons', (request, response) => {
  Contact.find({}).then((contacts) => {
    response.json(contacts)
  })
})

app.get('/api/info', (request, response, next) => {
  const currentTime = new Date().toString()
  Contact.countDocuments({}).then((contacts) => {
    response
      .send(
        `
      <p>Phonebook has info for ${contacts} people</p>
      <p>${currentTime}</p>
    `
      )
      .catch((error) => next(error))
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Contact.findById(id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => {
      next(error)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Contact.findByIdAndDelete(id)
    .then((result) => {
      console.log(result)
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {

  const body = request.body
  const name = body.name
  const number = body.number

  if (!body.name && !body.number) {
    return response.status(400).json({
      error: 'Name and number are missing',
    })
  } else if (!body.name) {
    return response.status(400).json({
      error: 'The name is missing',
    })
  } else if (!body.number) {
    return response.status(400).json({
      error: 'The number is missing',
    })
  }

  Contact.findOne({ name: name })
    .then((existingContact) => {
      if (existingContact) {

        return response.status(400).json({
          error: 'Name must be unique',
        })
      } else {

        const contact = new Contact({
          name: name,
          number: number,
        })
        return contact.save().then((savedContact) => {
          response.json(savedContact)
        })
      }
    })
    .catch((error) => {
      next(error)
    })
})


app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body

  const contact = {
    name: body.name,
    number: body.number,
  }

  Contact.findByIdAndUpdate(id, contact, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((updatedContact) => {
      if (updatedContact) {
        response.json(updatedContact)
      } else {
        response.status(404).json({ error: 'Contact not found' })
      }
    })
    .catch((error) => {
      next(error)
    })
})


app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

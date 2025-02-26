const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

const morgan = require("morgan");

morgan.token("body", (req) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
});

app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.body(req, res),
    ].join(" ");
  })
);

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generateId = () => {
  const newId = Math.floor(Math.random() * (200 - 1 + 1)) + 1;
  return String(newId);
};

app.get("/", (request, response) => {
  response.send("<h1>Hello Worlds</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/info", (request, response) => {
  const currentTime = new Date().toString();
  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${currentTime}</p>
  `);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id != id);

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name && !body.number) {
    return response.status(400).json({
      error: "Name and number are missing",
    });
  } else if (!body.name) {
    return response.status(400).json({
      error: "The name is missing",
    });
  } else if (!body.number) {
    return response.status(400).json({
      error: "The number is missing",
    });
  }

  const duplicatedName = persons.find((person) => person.name === body.name);
  if (duplicatedName) {
    return response.status(400).json({
      error: "Name must be unique",
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

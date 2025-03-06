const mongoose = require('mongoose')


if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]


const url = `mongodb+srv://fullstack:${password}@phonebookdb.7oubi.mongodb.net/phonebook?retryWrites=true&w=majority&appName=PhonebookDB`

mongoose.set('strictQuery', false)
mongoose.connect(url)


const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
})


const Contact = mongoose.model('Contact', contactSchema)


if (process.argv.length === 3) {
  console.log('phonebook:')
  Contact.find({}).then((result) => {
    result.forEach((contact) => {
      console.log(contact.name, contact.number)
    })
    mongoose.connection.close()
  })
}

else if (process.argv.length === 5) {
  const contact = new Contact({
    name: name,
    number: number,
  })

  contact.save().then((result) => {
    console.log(result)
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}

else {
  console.log('Invalid arguments. Usage:')
  console.log('To list all contacts: node mongo.js <password>')
  console.log('To add a new contact: node mongo.js <password> <name> <number>')
  mongoose.connection.close()
}

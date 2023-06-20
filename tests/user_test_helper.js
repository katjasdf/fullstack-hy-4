const User = require('../models/user')

const newUser = {
    username: 'kaijakoo',
    name: 'Kaija Koo',
    password: 'secret'
}

const sameUsernameUser = {
    username: 'root',
    name: 'Root user',
    password: 'verysecret'
}

const noUsernameUser = {
    name: 'This is name',
    password: 'thisispassword'
}

const noPasswordUser = {
    username: 'thisisusername',
    name: 'This is name'
}

const tooShortUsernameUser = {
    username: 'na',
    name: 'Too short username',
    password: 'alsoverysecret'
}

const tooShortPasswordUser = {
    username: 'tooshortpassword',
    name: 'Too short password',
    password: 'pa'
}

const usersInDB = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())

}

module.exports = {

    newUser,
    sameUsernameUser,
    noUsernameUser,
    noPasswordUser,
    tooShortUsernameUser,
    tooShortPasswordUser,
    usersInDB
}
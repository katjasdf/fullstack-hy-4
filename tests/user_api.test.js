const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')

const app = require('../app')
const helper = require('./user_test_helper')
const api = supertest(app)
const User = require('../models/user')

describe('when there is initially one user at the db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('secret', 10)
        const user = new User({ username: 'root', name: 'Root User', passwordHash })

        await user.save()
    })

    describe('adding data to db', () => {
        test('user is added to db', async () => {
            const usersAtTheStart = await helper.usersInDB()

            await api
                .post('/api/users')
                .send(helper.newUser)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const usersAtTheEnd = await helper.usersInDB()
            expect(usersAtTheEnd).toHaveLength(usersAtTheStart.length + 1)

            const usernames = usersAtTheEnd.map(user => user.username)
            expect(usernames).toContain(helper.newUser.username)
        })

    })

    describe('handling data errors', () => {
        test('if username is already taken, creation fails with statuscode 400', async () => {
            const usersAtTheStart = await helper.usersInDB()

            const result = await api
                .post('/api/users')
                .send(helper.sameUsernameUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            expect(result.body.error).toContain('expected `username` to be unique')

            const usersAtTheEnd = await helper.usersInDB()
            expect(usersAtTheEnd).toHaveLength(usersAtTheStart.length)
        })

        test('when username is not set, return status code 400', async () => {
            const usersAtTheStart = await helper.usersInDB()

            await api.post('/api/users').send(helper.noUsernameUser).expect(400)

            const usersAtTheEnd = await helper.usersInDB()
            expect(usersAtTheEnd).toHaveLength(usersAtTheStart.length)
        })

        test('when password is not set, return status code 400', async () => {
            const usersAtTheStart = await helper.usersInDB()

            const result = await api
                .post('/api/users')
                .send(helper.noPasswordUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            expect(result.body.error).toContain('Password is required')

            const usersAtTheEnd = await helper.usersInDB()
            expect(usersAtTheEnd).toHaveLength(usersAtTheStart.length)
        })

        test('when username is too short, return status code 400', async () => {
            const usersAtTheStart = await helper.usersInDB()

            await api.post('/api/users').send(helper.tooShortUsernameUser).expect(400)

            const usersAtTheEnd = await helper.usersInDB()
            expect(usersAtTheEnd).toHaveLength(usersAtTheStart.length)
        })

        test('when password is too short, return status code 400', async () => {
            const usersAtTheStart = await helper.usersInDB()

            const result = await api
                .post('/api/users')
                .send(helper.tooShortPasswordUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            expect(result.body.error).toContain('Your password needs to be atleat 3 characters long')

            const usersAtTheEnd = await helper.usersInDB()
            expect(usersAtTheEnd).toHaveLength(usersAtTheStart.length)
        })
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})
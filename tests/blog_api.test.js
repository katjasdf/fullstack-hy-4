const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')

const app = require('../app')
const helper = require('./blog_test_helper')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

describe('when there is initially some blogs', () => {
    let token = null

    beforeAll(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('secret', 10)
        const user = new User({ username: 'root', name: 'Root User', passwordHash })

        await user.save()

        const loginResponse = await api.post('/api/login').send(helper.user)
        token = loginResponse.body.token

        await Blog.deleteMany({})
        for (const blog of helper.initialBlogs) {
            await api
                .post('/api/blogs')
                .set('Authorization', `bearer ${token}` )
                .send(blog)
        }
    })

    test('data is returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('blogs identifier name is id', async () => {
        const response = await api.get('/api/blogs')
        response.body.forEach((blog) => {
            expect(blog).toHaveProperty('id')
        })
    })

    describe('adding data to db', () => {
        test('blogs are added to db', async () => {
            await api
                .post('/api/blogs')
                .send(helper.newBlog)
                .set('Authorization', `bearer ${token}` )
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const blogsAtTheEnd = await helper.blogsInDB()
            expect(blogsAtTheEnd).toHaveLength(helper.initialBlogs.length + 1)
            expect(blogsAtTheEnd).toContainEqual(expect.objectContaining(helper.newBlog))
        })

        test('when likes-value is not set, default value is 0', async () => {
            await api
                .post('/api/blogs')
                .set('Authorization', `bearer ${token}` )
                .send(helper.noLikesBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const blogsAtTheEnd = await helper.blogsInDB()
            blogsAtTheEnd.forEach((blog) => {
                expect(blog).toHaveProperty('likes')
                expect(blog.likes).toBeGreaterThanOrEqual(0)
            })
        })

        test('updating blog data is possible', async () => {
            const blogsAtTheStart = await helper.blogsInDB()
            const blogToBeEdited = blogsAtTheStart[0]

            await api
                .put(`/api/blogs/${blogToBeEdited.id}`)
                .send(helper.updatedBlog)
                .expect(200)
                .set('Authorization', `bearer ${token}` )
                .expect('Content-Type', /application\/json/)

            const blogsAtTheEnd = await helper.blogsInDB()
            expect(blogsAtTheEnd).toContainEqual(expect.objectContaining(helper.updatedBlog))
        })
    })

    describe('handling missing data', () => {
        test('when title is not set, return status code 400', async () => {
            const blogsAtTheStart = await helper.blogsInDB()

            await api
                .post('/api/blogs')
                .send(helper.noTitleBlog)
                .set('Authorization', `bearer ${token}` )
                .expect(400)

            const blogsAtTheEnd = await helper.blogsInDB()
            expect(blogsAtTheEnd).toHaveLength(blogsAtTheStart.length)
        })

        test('when url is not set, return status code 400', async () => {
            const blogsAtTheStart = await helper.blogsInDB()

            await api
                .post('/api/blogs')
                .send(helper.noUrlBlog)
                .set('Authorization', `bearer ${token}` )
                .expect(400)

            const blogsAtTheEnd = await helper.blogsInDB()
            expect(blogsAtTheEnd).toHaveLength(blogsAtTheStart.length)
        })

        test('when token is not set, return status code 401', async () => {
            const blogsAtTheStart = await helper.blogsInDB()

            await api
                .post('/api/blogs')
                .send(helper.newBlog)
                .expect(401)
                .expect('Content-Type', /application\/json/)


            const blogsAtTheEnd = await helper.blogsInDB()
            expect(blogsAtTheEnd).toHaveLength(blogsAtTheStart.length)
        })
    })

    describe('removing blog', () => {
        test('succesfully remove blog and return status code 204', async () => {

            const blogsAtTheStart = await helper.blogsInDB()
            const blogToBeDeleted = blogsAtTheStart[0]
            console.log(blogsAtTheStart)

            await api
                .delete(`/api/blogs/${blogToBeDeleted.id}`)
                .set('Authorization', `bearer ${token}` )
                .expect(204)

            const blogsAtTheEnd = await helper.blogsInDB()
            expect(blogsAtTheEnd).toHaveLength(blogsAtTheStart.length - 1)
        })
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})
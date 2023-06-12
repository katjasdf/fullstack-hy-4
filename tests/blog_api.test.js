const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const api = supertest(app)

describe('when there is initially some blogs', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.initialBlogs)
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
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const blogsAtTheEnd = await helper.blogsInDB()
            expect(blogsAtTheEnd).toHaveLength(helper.initialBlogs.length + 1)
            expect(blogsAtTheEnd).toContainEqual(expect.objectContaining(helper.newBlog))
        })

        test('when likes-value is not set, default value is 0', async () => {
            await api
                .post('/api/blogs')
                .send(helper.newBlog)

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
                .expect('Content-Type', /application\/json/)

            const blogsAtTheEnd = await helper.blogsInDB()
            expect(blogsAtTheEnd).toContainEqual(expect.objectContaining(helper.updatedBlog))
        })
    })

    describe('handling missing data', () => {
        test('when title is not set, return status code 400', async () => {
            await api.post('/api/blogs').send(helper.noTitleBlog).expect(400)

            const blogsAtTheEnd = await helper.blogsInDB()
            expect(blogsAtTheEnd).toHaveLength(helper.initialBlogs.length)
        })

        test('when url is not set, return status code 400', async () => {
            await api.post('/api/blogs').send(helper.noUrlBlog).expect(400)

            const blogsAtTheEnd = await helper.blogsInDB()
            expect(blogsAtTheEnd).toHaveLength(helper.initialBlogs.length)
        })
    })

    describe('removing blog', () => {
        test('succesfully remove blog and return status code 204', async () => {
            const blogsAtTheStart = await helper.blogsInDB()
            const blogToBeDeleted = blogsAtTheStart[0]

            await api.delete(`/api/blogs/${blogToBeDeleted.id}`).expect(204)

            const blogsAtTheEnd = await helper.blogsInDB()
            expect(blogsAtTheEnd).toHaveLength(blogsAtTheStart.length - 1)
        })
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})
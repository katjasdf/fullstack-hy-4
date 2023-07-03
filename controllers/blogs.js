const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (_, response) => {
    const blogs = await Blog
        .find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
    const body = request.body
    const user = request.user

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: user._id
    })

    await blog.populate('user', { username: 1, name: 1 })
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog)
    await user.save()

    response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
    const { title, author, url, likes, user } = request.body

    const updatedBlog = await Blog.findByIdAndUpdate(
        request.params.id,
        { title, author, url, likes, user },
        { new: true, runValidators: true, context: 'query' }
    )

    await updatedBlog.populate('user', { username: 1, name: 1 })
    response.json(updatedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    const user = request.user

    if (!blog) {
        return response.status(400).json({ error: 'Malformatted blog id or blog already deleted' })
    } else if (!blog.user) {
        return response.status(400).json({ error: 'Blog creator missing' })
    } else if (blog.user.toString() !== user._id.toString()) {
        return response.status(401).json({ error: 'Unauthorized to delete' })
    }

    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()

})

module.exports = blogsRouter
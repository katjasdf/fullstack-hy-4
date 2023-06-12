const Blog = require('../models/blog')

const initialBlogs = [
    {
        title: 'This is test data',
        author: 'Kaija Koo',
        url: 'www.test.test',
        likes: 0
    },
    {
        title: 'This is second test item',
        author: 'Kaija Koo',
        url: 'www.test.test',
        likes: 5
    }
]

const newBlog = {
    title: 'This is new blog',
    author: 'Kari Grandi',
    url: 'www.new.test'
}

const updatedBlog = {
    title: 'This is test data',
    author: 'Kaija Koo',
    url: 'www.test.test',
    likes: 1
}

const noTitleBlog = {
    author: 'Karim',
    url: 'www.bad.test'
}

const noUrlBlog = {
    title: 'This is blog title',
    author: 'Ville Valo'
}

const blogsInDB = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

module.exports = { initialBlogs, newBlog, updatedBlog, noTitleBlog, noUrlBlog, blogsInDB }
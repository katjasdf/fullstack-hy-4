const _ = require('lodash')

const dummy = (blogs) => {
    return (blogs.length !== 1) ? 1 : blogs.length
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.reduce((prev, current) => prev.likes > current.likes ? prev : current)
}

const mostBlogs = (blogs) => {
    const blogsSum = _(blogs)
        .groupBy('author')
        .map((value, key) => ({
            author: key,
            blogs: value.length }))
        .value()

    return blogsSum.reduce((prev, current) => prev.blogs > current.blogs ? prev : current)
}

const mostLikes = (blogs) => {
    const likesSum = _(blogs)
        .groupBy('author')
        .map((value, key) => ({
            author: key,
            likes: _.sumBy(value, 'likes') }))
        .value()

    return likesSum.reduce((prev, current) => prev.likes > current.likes ? prev : current)
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}
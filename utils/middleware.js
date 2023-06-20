const jwt = require('jsonwebtoken')
const logger = require('./logger')
const User = require('../models/user')

const errorHandler = (error, _, response, next) => {
    logger.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.message === 'invalid token') {
        return response.status(400).json({ error: 'invalid token' })
    } else if (error.message === 'jwt must be provided') {
        return response.status(401).json({ error: 'token missing' })
    }
    next(error)
}

const tokenExtractor = (request, _, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('bearer ')) {
        request.token = authorization.replace('bearer ', '')
    }
    next()
}

const userExtractor = async (request, _, next) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const user = await User.findById(decodedToken.id)
    if (user) {
        request.user = user
    }
    next()
}

module.exports = { errorHandler, tokenExtractor, userExtractor }
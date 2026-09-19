var _ = require('lodash')

const errorHandler = func => (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch((err) => {
console.log("The error ______ ",err);   
 next(err)
    })
}

module.exports = {
    errorHandler: errorHandler
}

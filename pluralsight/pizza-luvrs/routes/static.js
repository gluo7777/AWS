module.exports = handlers => ({
  method: 'GET',
  path: '//unique-pizza-bucket.s3.us-east-2.amazonaws.com/{param*}',
  handler: {
    directory: {
      path: 'assets'
    }
  },
  options: {
    auth: false
  }
})

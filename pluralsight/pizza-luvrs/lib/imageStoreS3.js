const AWS = require('aws-sdk')
const s3 = AWS.S3()

module.exports.save = (name, data) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: 'unique-pizza-bucket'
            , Key: `pizzas/${name}.png`
            , Body: Buffer.from(data, 'base64')
            , ContentEncoding: 'base64'
            , ContentType: 'image/png'
        }

        s3.putObject(params, (error,data) => {
            if(error){
                reject(error)
            }else{
                // TODO: replace with actual S3 location
                resolve(`assets/${params.Key}`)
            }
        })
    })
}
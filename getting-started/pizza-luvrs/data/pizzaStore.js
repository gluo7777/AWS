const Sequelize = require('sequelize')

const pgClient = new Sequelize(
    process.env.DATABASE
    ,process.env.USERNAME
    ,process.env.PASSWORD
    ,{
        host: process.env.HOST
        ,dialect: 'postgres'
    }
)

const Pizza = pgClient.define(
    'pizza'
    , {
        id: {
            type: Sequelize.STRING
            ,primaryKey: true
        }
        , name: { type: Sequelize.STRING }
        , toppings: { type: Sequelize.STRING }
        , img: { type: Sequelize.STRING }
        , username: { type: Sequelize.STRING }
        , created: { type: Sequelize.BIGINT }
    }
)

Pizza.sync().then( () => {
    console.log(`Succesfully connected to ${process.env.DATABASE} at ${process.env.HOST} as ${process.env.USERNAME}.`)
})

module.exports = Pizza
const chai = require('chai')
const server = require('../app')
const chaiHttp = require('chai-http')

chai.should()
chai.use(chaiHttp)

it('return all the active companies', (done) => {
    chai.request(server)
        .get('/api/v1/companies')
        .set({ "Authorization": `${process.env.token}` })
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            done()
        })
})

it('return particular company based on the id', (done) => {
    chai.request(server)
        .get('/api/v1/companies/1')
        .set({"Authorization": `${process.env.token}`})
        .end((err, res) => {
            res.should.have.status(200);
            res.should.be.a('object')
            done()
        })
})

it('delete a company based on company id', (done) => {
    chai.request(server)
        .delete('/api/v1/companies/9')
        .set({"Authorization": `${process.env.token}`})
        .end((err, res) => {
            res.body.should.have.property('message').eql('Deleted successfully')
            done()
        })
})

it('create new company', (done) => {
    chai.request(server)
        .post('/api/v1/companies')
        .set({"Authorization": `${process.env.token}`})
        .send({name: 'unit test5'})
        .end((err, res) => {
            res.body.should.be.status(200)
            done()
        })
})

it('create a company with existing company name should throw company exist error', (done) => {
    chai.request(server)
        .post('/api/v1/companies')
        .set({"Authorization": `${process.env.token}`})
        .send({name: 'unit test2'})
        .end((err, res) => {
            res.body.should.be.status(500)
            res.body.should.have.property('message').eql('The name has already been taken')
            done()
        })
})
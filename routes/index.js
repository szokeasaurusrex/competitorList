var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient
const mongoUrl = "mongodb://localhost:27017/cubing"

/* GET home page. */
router.get('/', (req, res) => {
  MongoClient.connect(mongoUrl, {useNewUrlParser: true}).then(db => {
    let dbo = db.db('cubing')
    return dbo.collection('registrations').find({}).sort({name: 1}).toArray()
    .then(result => {
      let unapproved = []
      let approved = []
      let totals = {
        fullRegistration: 0,
        freeRegistration: 0,
        normalLunch: 0,
        largeLunch: 0,
        tshirtS: 0,
        tshirtM: 0,
        tshirtL: 0,
        tshirtXL: 0,
        revenue: 0
      }
      for (const registration of result) {
        // count up totals
        if (registration.approved == true) {
          approved.push(registration)
        } else {
          unapproved.push(registration)
        }
        if (registration.isShakerStudent == true) {
          totals.freeRegistration++
        } else {
          totals.fullRegistration++
        }
        totals.normalLunch += registration.normalLunch
        totals.largeLunch += registration.largeLunch
        switch (registration.tshirt) {
          case "S":
            totals.tshirtS++
            break
          case "M":
            totals.tshirtM++
            break
          case "L":
            totals.tshirtL++
            break
          case "XL":
            totals.tshirtXL++
            break
        }
        totals.revenue += registration.totalPrice
      }
      res.render('index', {
        approved: approved,
        unapproved: unapproved,
        totals: totals
      })
      db.close()
  }).catch(err => {
    res.render('error', {
      message: 'Error',
      error: err
    })
  })
})})

router.post('/approve', (req, res) => {
  MongoClient.connect(mongoUrl, {useNewUrlParser: true}).then(db => {
    let dbo = db.db('cubing')
    let query = { email: req.body.email }
    let newValues = { $set: {approved: true} }
    return dbo.collection('registrations').updateOne(query, newValues)
  }).then(result => {
    res.send("OK")
    db.close()
  }).catch(err => {
    console.log(err.message)
    res.send("Failed to update in database")
  })
})

router.post('/remove', (req, res) => {
  let dbo, query
  MongoClient.connect(mongoUrl, {useNewUrlParser: true}).then(db => {
    dbo = db.db('cubing')
    query = { email: req.body.email }
    return dbo.collection('registrations').findOne(query)
  }).then(result => {
    return dbo.collection('deletedRegistrations').insertOne(result)
  }).then(result => {
    return dbo.collection('registrations').deleteOne(query)
  }).then(result => {
    res.send("OK")
    db.close()
  }).catch(err => {
    console.log(err.message)
    res.send("Failed to update in database")
  })
})

module.exports = router;

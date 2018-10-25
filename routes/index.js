'use strict';

var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient
const mongoUrl = "mongodb://localhost:27017/cubing"

/* GET home page. */
router.get('/', async (req, res) => {
  let db
  try {
    db = await MongoClient.connect(mongoUrl, {useNewUrlParser: true})
    let collection = db.db('cubing').collection('registrations')
    let registrations = await collection.find({})
    let totals = {
      fullRegistration: 0,
      freeRegistration: 0,
      largeLunch: 0,
      smallLunch: 0,
      tshirtS: 0,
      tshirtM: 0,
      tshirtL: 0,
      tshirtXL: 0,
      revenue: 0
    }
    let approved = []
    let unapproved = []
    for (let i = 0; i < registrations.length; i++) {
      // Generate date string
      registrations[i].dateString = registrations[i].date.toLocaleString({
        timeZone: 'America/New_York',
        hour12: false,
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short"
      })
      // count up totals
      if (registrations[i].isShakerStudent == true) {
        totals.freeRegistration++
      } else {
        totals.fullRegistration++
      }
      totals.largeLunch += registrations[i].largeLunch
      totals.smallLunch += registrations[i].smallLunch
      switch (registrations[i].tshirt) {
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
      totals.revenue += registrations[i].totalPrice
      // sort to approved or unapproved
      if (registrations[i].approved) {
        approved.append(registrations[i])
      } else {
        unapproved.append(registrations[i])
      }
    }
    approved.sort( (a, b) => {
      if (a.name < b.name) {
        return -1
      } else if (b.name > a.name) {
        return 1
      } else {
        return 0
      }
    })
    unapproved.sort( (a, b) => {
      if (a.date < b.date) {
        return -1
      } else if (a.date > b.date) {
        return 1
      } else {
        return 0
      }
    })
    res.render('index', {
      approved: approved,
      unapproved: unapproved[0],
      totals: totals
    })
    db.close()
  } catch (err) {
    db.close()
    res.render('error', {
      message: 'Error',
      error: err
    })
  }
})

router.post('/approve', async (req, res) => {
  let db
  try {
    db = await MongoClient.connect(mongoUrl, {useNewUrlParser: true})
    let collection = db.db('cubing').collection('registrations')
    let query = { email: req.body.email }
    let newValues = { $set: {approved: true} }
    await collection.updateOne(query, newValues)
    res.send('OK')
    db.close()
  } catch(err) {
    res.send(err.message)
  }
})

router.post('/remove', async (req, res) => {
  let db
  try {
    db = await MongoClient.connect(mongoUrl, {useNewUrlParser: true})
    let dbo = db.db('cubing')
    let collection = dbo.collection('registrations')
    let query = { email: req.body.email }
    let registration = await collection.findOne(query)
    await dbo.collection('deletedRegistrations').insertOne(registration)
    await dbo.collection('registrations').deleteOne(query)
    res.send("OK")
    db.close()
  } catch(err) {
    res.send(err.message)
  }
})

module.exports = router;

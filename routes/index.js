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
    let queryApproved = { approved: true }
    let queryUnapproved = { approved: false }
    let approvedPromise =
        collection.find(queryUnapproved).sort({name: 1}).toArray()
    let unapprovedPromise =
        collection.find(queryApproved).sort({date: 1}).toArray()
    let approvedUnapproved =
        await Promise.all([approvedPromise, unapprovedPromise])
    let allRegistrations = approved.concat(unapproved)
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
    for (const registration of allRegistrations) {
      // count up totals
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
      approved: approvedUnapproved[0],
      unapproved: approvedUnapproved[1],
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

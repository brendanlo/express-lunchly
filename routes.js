"use strict";

/** Routes for Lunchly */

const express = require("express");

const Customer = require("./models/customer");
const { fullTextNoteSearch } = require("./models/reservation");
const Reservation = require("./models/reservation");

const router = new express.Router();


// #############################################################################
// Customer Routes

/** Homepage: show list of customers. */

router.get("/", async function (req, res, next) {
  const customers = await Customer.all();
  return res.render("customer_list.html", { customers });
});

/** Accepts query parameter via search form, and displays all customer matches */

router.get("/search", async function (req, res, next) {

  let searchName = req.query.search;

  searchName = searchName.split(" ");
  searchName = searchName.map(name => name.toLowerCase());

  const allCustomers = await Customer.all();
  let foundCustomers = allCustomers.filter((customer) => {
    return (searchName.includes(customer.firstName.toLowerCase())
      || searchName.includes(customer.lastName.toLowerCase()));
  });

  // keeps any customer with both the first and last name in the query
  foundCustomers = foundCustomers.filter(customer => {
    return (searchName.includes(customer.firstName.toLowerCase())
      && searchName.includes(customer.lastName.toLowerCase()));
  }
  )

  return res.render("customer_list.html", { customers: foundCustomers });
});


/** Display top 10 customers with the most reservations */

router.get("/top-ten", async function(req, res){

  const top10Customers = await Customer.bestCustomers();

  return res.render("customer_list.html", { customers: top10Customers });

});


/** Form to add a new customer. */

router.get("/add/", async function (req, res, next) {
  return res.render("customer_new_form.html");
});

/** Handle adding a new customer. */

router.post("/add/", async function (req, res, next) {
  const { firstName, lastName, phone, notes } = req.body;
  const customer = new Customer({ firstName, lastName, phone, notes });
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Show a customer, given their ID. */

router.get("/:id/", async function (req, res, next) {
  //CR: make if to handle favoicon.ico
  const customer = await Customer.get(req.params.id);

  const reservations = await customer.getReservations();

  return res.render("customer_detail.html", { customer, reservations });
});

/** Show form to edit a customer. */

router.get("/:id/edit/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);

  res.render("customer_edit_form.html", { customer });
});

/** Handle editing a customer. */

router.post("/:id/edit/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);
  customer.firstName = req.body.firstName;
  customer.lastName = req.body.lastName;
  customer.phone = req.body.phone;
  customer.notes = req.body.notes;
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});


// #############################################################################
// Reservation Routes

/** Search notes using FTS (full text search) PSQL functionality
 * Displays TODO: ?????
 */

router.get("/note-search", async function (req, res, next){
  let searchPhrase = req.query.noteSearch;

  fullTextNoteSearch(searchPhrase);


});

/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function (req, res, next) {
  const customerId = req.params.id;
  const startAt = new Date(req.body.startAt);
  const numGuests = req.body.numGuests;
  const notes = req.body.notes;

  const reservation = new Reservation({
    customerId,
    startAt,
    numGuests,
    notes,
  });
  await reservation.save();

  return res.redirect(`/${customerId}/`);
});

module.exports = router;

"use strict";

/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");

/** A reservation for a party */

class Reservation {
  constructor({ id, customerId, numGuests, startAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  get notes() {
    return this._notes;
  }

  set notes(val) {
    if (val) {
      this._notes = val;
    }
    else {
      this._notes = "";
    }
  }

  get numGuests(){
    return this._numGuests;
  }

  set numGuests(val){
    if(val<1){
      throw new Error("A reservation for 0 is sad. Not allowed.");
    }
    this._numGuests = val;
  }

  get startAt(){
    return this._startAt;
  }

  set startAt(val){
    if(!isNaN(val)){
      this._startAt = val;
    }
    else{
      throw new Error("Invalid date. Please use yyyy-mm-dd hh:mm am/pm");
    }
  }




  /** formatter for startAt */

  getFormattedStartAt() {
    return moment(this.startAt).format("MMMM Do YYYY, h:mm a");
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id,
                  customer_id AS "customerId",
                  num_guests AS "numGuests",
                  start_at AS "startAt",
                  notes AS "notes"
           FROM reservations
           WHERE customer_id = $1`,
      [customerId],
    );

    return results.rows.map(row => new Reservation(row));
  }

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, num_guests, start_at, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [this.customerId, this.numGuests, this.startAt, this.notes]
      );
      this.id = result.rows[0].id;
    }
    else {
      await db.query(
        `UPDATE reservations
        SET num_guests = $2, start_at = $3, notes = $4
        WHERE id = $1`,
        [this.id, this.numGuests, this.startAt, this.notes]
      );
    }
  }
}


module.exports = Reservation;

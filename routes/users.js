const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  pic: String,
  details: String
});

module.exports = mongoose.model('user', userSchema);

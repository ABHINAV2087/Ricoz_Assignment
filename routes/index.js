const express = require('express');
const router = express.Router();
const usermodel = require('./users'); 
const Book = require('./books');
const bcrypt = require('bcrypt'); 
const session = require('express-session');

router.use(session({
  secret: 'abhinav',
  resave: false,
  saveUninitialized: true,
}));

router.get('/', function (req, res, next) {
    res.render('register');
});

router.get('/register', function (req, res, next) {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { username, name, email, password, pic } = req.body;
  const existingUser = await usermodel.findOne({ email });
  
  if (existingUser) {
      return res.status(400).send('User already exists. Please sign in.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new usermodel({ username, name, email, password: hashedPassword, pic });

  try {
      await user.save();
      res.redirect(`/userdetails/${user._id}`);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error registering user');
  }
});

router.get('/signin', function (req, res, next) {
  res.render('signin');
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  const user = await usermodel.findOne({ email });

  if (!user) {
      return res.status(400).render('signin', { error: 'User not found. Please register.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
      return res.status(400).render('signin', { error: 'Invalid credentials.' });
  }

  req.session.userId = user._id;
  res.redirect(`/userdetails/${user._id}`);
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          console.error(err);
          return res.status(500).send('Error logging out.');
      }
      res.redirect('/');
  });
});

router.get('/userdetails/:id', async (req, res) => {
  try {
      const user = await usermodel.findById(req.params.id);
      if (!user) {
          return res.status(404).send('User not found');
      }
      res.render('userdetails', { user });
  } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching user details');
  }
});

router.get('/edit/:id', async (req, res) => {
  try {
      const user = await usermodel.findById(req.params.id);
      res.render('updateDetails', { user });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

router.post('/update/:id', async (req, res) => {
  try {
      const { username, name, email, details, pic } = req.body;
      await usermodel.findByIdAndUpdate(req.params.id, { username, name, email, details, pic });
      res.redirect(`/userdetails/${req.params.id}`);
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

router.post('/delete/:id', async (req, res) => {
  try {
      await usermodel.findByIdAndDelete(req.params.id);
      res.redirect('/');
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

router.get('/home', async (req, res) => {
  try {
    const books = await Book.find();
    res.render('home', { books });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching books');
  }
});

router.get('/newbooks', (req, res) => {
  res.render('newbooks');
});

router.post('/newbooks', async (req, res) => {
  const { title, author, genre, copies } = req.body;
  const book = new Book({ title, author, genre, copies });

  try {
      await book.save();
      res.redirect('/home');
  } catch (err) {
      console.error(err);
      res.status(500).send('Error saving the book');
  }
});

router.get('/books/:id/edit', async (req, res) => {
  try {
      const book = await Book.findById(req.params.id);
      if (!book) {
          return res.status(404).send('Book not found');
      }
      res.render('editbooks', { book });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});

router.put('/books/:id', async (req, res) => {
  const { title, author, genre, copies } = req.body;

  try {
      const updatedBook = await Book.findByIdAndUpdate(req.params.id, {
          title,
          author,
          genre,
          copies
      }, { new: true });

      if (!updatedBook) {
          return res.status(404).send('Book not found');
      }

      res.json(updatedBook);
  } catch (err) {
      console.error(err);
      res.status(500).send('Error updating the book');
  }
});

module.exports = router;

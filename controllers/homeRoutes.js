const router = require('express').Router();
const { Post, User, Comment } = require('../models');
const withAuth = require('../utils/auth');

// get all posts
router.get('/', async (req, res) => {
  try {
    // Get all posts and JOIN with user data
    const postData = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['name'],
        },
        { 
          model: Comment,
          attributes: ['id', 'comment_text', 'date_created', 'user_id', 'post_id'],
          include: 
            {
              model: User,
              attributes: ['name'],
            } 
        },
      ],
    });

    // Serialize data so the template can read it
    const posts = postData.map((post) => post.get({ plain: true }));

    // Pass serialized data and session flag into template
    res.render('homepage', { 
      posts, 
      logged_in: req.session.logged_in 
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// get single post
router.get('/post/:id', async (req, res) => {
  try {
    const postData = await Post.findOne({
      where: {
          id: req.params.id
      },
      include: [
        {
          model: User,
          attributes: ['name'],
        },
        { 
          model: Comment,
          attributes: ['id', 'comment_text', 'date_created', 'user_id', 'post_id'],
          include: 
            {
              model: User,
              attributes: ['name'],
            } 
        },
      ],
    });

    const post = postData.get({ plain: true });
    console.log(post);

    res.render('post', {
      ...post,
      logged_in: req.session.logged_in
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// get single post to edit
router.get('/dashboard/edit/:id', async (req, res) => {
  try {
    const postData = await Post.findOne({
      where: {
          id: req.params.id
      },
      include: [
        {
          model: User,
          attributes: ['name'],
        },
        { 
          model: Comment,
          attributes: ['id', 'comment_text', 'date_created', 'user_id', 'post_id'],
          include: 
            {
              model: User,
              attributes: ['name'],
            } 
        },
      ],
    });

    const post = postData.get({ plain: true });
    console.log(post);

    res.render('dashboard-edit', {
      ...post,
      logged_in: req.session.logged_in
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Use withAuth middleware to prevent access to route
router.get('/dashboard', withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Post }],
    });

    const user = userData.get({ plain: true });

    res.render('dashboard', {
      ...user,
      logged_in: true
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/login', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/dashboard');
    return;
  }

  res.render('login');
});

router.get('/friends', withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
    });

    const user = userData.get({ plain: true });

    res.render('friends', {
      ...user,
      logged_in: true
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

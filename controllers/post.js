const { Post, Tag } = require('../models')

async function create(req, res, next) {
  const {title, body, tags} = req.body
  // if there is no title or body, return a 400 status
  if (!title || !body){
      return res.status(400).send('Not found')
  }

  const result = Post.create({
    title:title,
    body: body,
    tags:tags
  })

  res.status(200).json(result)
  // omitting tags is OK
  // create a new post using title, body, and tags
  // return the new post as json and a 200 status
}

// should render HTML
async function get(req, res) {
  try {
    const slug = req.params.slug
    // TODO: Find a single post
    // find a single post by slug and populate 'tags'
    // you will need to use .lean() or .toObject()
    let post = await Post.findOne({slug:slug}).populate("tags").lean()

    post.createdAt = new Date(post.createdAt).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
    post.comments.map(comment => {
      comment.createdAt = new Date(comment.createdAt).toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
      return comment
    })
    res.render('view-post', {post, isLoggedIn: req.session.isLoggedIn})
  } catch(err) {
    res.status(500).send(err.message)
  }
}

// should render HTML
async function getAll(req, res) {
  try {
    // get by single tag id if included
    const mongoQuery = {}
    if (req.query.tag) {
      const tagDoc =  await Tag.findOne({name: req.query.tag}).lean()
      if (tagDoc)
        mongoQuery.tags = {_id: tagDoc._id }
    }
    const postDocs = await Post
      .find(mongoQuery)
      .populate({
        path: 'tags'
      })
      .sort({createdAt: 'DESC'})
    const posts = postDocs.map(post => {
      post = post.toObject()
      post.createdAt = new Date(post.createdAt).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      return post
    })
    res.render('index', {
      posts,
      isLoggedIn: req.session.isLoggedIn,
      tag: req.query.tag
    })
  } catch(err) {
    res.status(500).send(err.message)
  }
}

async function update(req,res) {
    const {title, body, tags} = req.body
    const postId = req.params.id

    if (!title || !body){
      return res.status(400).send('Not found')
    }

    Post.findByIdAndUpdate(postId, {title:title, body:body, tags:tags}, (err,docs)=>{
      res.json(docs)
    })
}

async function remove(req, res, next) {
  const postId = req.params.id
  // TODO: Delete a post
  const post = await Post.findByIdAndDelete(postId, (err,docs)=>{
    res.status(200).send("Deleted post!")
  })
  // delete post by id, return a 200 status
}

module.exports = {
  get,
  getAll,
  create,
  update,
  remove
}
const express = require("express");
const db = require("../data/database");

const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("/posts");
});

router.get("/posts", async (req, res) => {
  const query = `
    SELECT posts.*, authors.Name AS author_name FROM posts
    INNER JOIN authors ON posts.author_id = authors.id
  `;
  const [posts] = await db.query(query);
  res.render("posts-list", { posts: posts });
});

router.get("/new-post", async (req, res) => {
  const [authors] = await db.query("SELECT * FROM authors");
  res.render("create-post", { authors: authors });
});

router.post("/posts", async (req, res) => {
  const data = [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.body.author,
  ];
  await db.query(
    "INSERT INTO posts (title, summary, body, author_id) VALUES (?)",
    [data]
  );
  res.redirect("/posts");
});

router.get("/posts/:id", async (req, res) => {
  const query = `
    SELECT posts.*, authors.Name AS author_name, authors.Email AS author_email FROM posts
    INNER JOIN authors ON posts.author_id = authors.id
    WHERE posts.id = ?
  `;

  const [posts] = await db.query(query, [req.params.id]);

  if (!posts || posts.length === 0) {
    res.statusCode(404).render("404");
    return;
  }

  res.render("post-detail", { post: posts[0] });
});

router.get("/posts/:id/edit", async (req, res) => {
  const query = `
    SELECT * FROM posts WHERE id = ?
  `;
  const [posts] = await db.query(query, [req.params.id]);

  if (!posts || posts.length === 0) {
    res.statusCode(404).render("404");
    return;
  }

  res.render("update-post", { post: posts[0] });
});

router.post("/posts/:id/edit", async (req, res) => {
  const query = `
    UPDATE posts SET title = ?, summary = ?, body = ?
    WHERE id = ?
  `;
  await db.query(query, [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.params.id,
  ]);
  res.redirect("/posts");
});

router.post("/posts/:id/delete", async (req, res) => {
  await db.query("DELETE FROM posts WHERE id = ?", [req.params.id]);
  res.redirect("/posts");
});

module.exports = router;

const pieceup = require('../pieceup.js')
const path = require('path')
const fs = require('fs-extra')
const fm = require('front-matter')
const ejs = require('ejs')
const markdown = require('markdown').markdown

/**
 * Constants
 */
const excerptLength = 300

/**
 * Paths
 */
const blogPath = './src/blog'
const blogTargetPath = './web/blog'
const postLayout = fs.readFileSync('./src/blog/_postLayout.ejs', 'utf-8') // FIXME: Try catch
const blogIndexLayout = fs.readFileSync('./src/blog/_indexLayout.ejs', 'utf-8') // FIXME: Try catch

// Pipeline functions

function insertFrontMatter (obj) {
  let frontMatter = fm(obj.source)
  return pieceup.helpers.merge(obj, {data: frontMatter.attributes, source: frontMatter.body})
  // TODO: Figure out a way to return an object with the properties to modify
  // so a helper function doesn't have to be used
}

function insertToEJSLayout (layout) {
  return function (obj) {
    let renderedSource = ejs.render(layout, {...obj.data, yield: obj.source})
    return pieceup.helpers.merge(obj, {source: renderedSource})
  }
}

const renderEJS = (obj) => pieceup.helpers.merge(obj, {source: ejs.render(obj.source, obj.data)})

const renderMarkdown = (obj) => pieceup.helpers.merge(obj, {source: markdown.toHTML(obj.source)})

// Other functions

function getPostPreviews (tree) {
  return tree.map(obj => {
    // TODO: Slice for amount of words
    let excerpt = obj.source.length > excerptLength ? obj.source.slice(0, excerptLength) + '...' : obj.source
    return {title: obj.data.title, excerpt: excerpt}
  })
}

function slugify (text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}
/**
 * Blog processing
 */

// Set up the pipeline used to pre-process blog entries
const blogEntryPipeline = pieceup.setPipeline(
  insertFrontMatter,
  renderMarkdown)

// Read and get the source tree for those blog entries
const entriesSource = pieceup.createSourceTree(blogPath, [
  /** File reading rules, using glob patterns. */

  '/**/*.md', // Select all .md files
  '!/**/_*' // Exclude files starting with '_'
])

// Execute the pipeline in order to get the HTML content for each blog entry.
// We truncate to this point intentionally in order to use that HTML code later.
var blogEntries = blogEntryPipeline(entriesSource)

// Piece up (pun intended) the blog entries into its respective layout.
const renderedBlog = pieceup.setPipeline(
  insertToEJSLayout(postLayout)
)(blogEntries)

// Write to a file using the supplied function to get an output path
pieceup.toFile(renderedBlog, function (obj) {
  let localpath = path.relative(blogPath, obj.dir) + slugify(obj.data.title) + '.html'

  return path.join(blogTargetPath, localpath)
})

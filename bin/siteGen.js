const pieceup = require('pieceup-js')
const path = require('path')
const fs = require('fs-extra')

// Rendering tools
const ejs = require('ejs')
const markdown = require('markdown').markdown

// Include paths
const {srcPath, targetPath} = require('./paths.json')

/**
 * Pipeline Functions
 */

function parseMarkdown (obj) {
  let html = obj.source

  // Gets the beginning and ending indexes of the content within the first {MD} tag
  function tagIndexes (html) {
      let beginIndex = html.indexOf('{MD}') + 4
      
      // If the tag is not found, indexOf() will return -1; So beginIndex will be 3.
      if (beginIndex === 3)
        return false
    
      let endIndex = html.indexOf('{/MD}')

      return {begin: beginIndex, end: endIndex}
  }
  
  while(tagIndexes(html)){
      let indexes = tagIndexes(html)
      // We extract the markdown content from the html
      var markdownContent = html.slice(indexes.begin, indexes.end)
      // Clean up leading whitespaces (not including new lines) and tabs
      markdownContent = markdownContent.replace(/[\t]|^(?!\n)\s+/gm, '')
      
      // We slice the string until the opening tab, then add the rendered content, and then the rest after the closing tag. The -4 and +5 accounts for the length of the tag string
      html = html.slice(0, indexes.begin - 4).concat(markdown.toHTML(markdownContent)).concat(html.slice(indexes.end + 5))
  }
  return pieceup.helpers.merge(obj, {source: html})
}

function renderEJS(data) {
  return function (obj) {
    return pieceup.helpers.merge(obj, {source: ejs.render(obj.source, data)})
  }
}
/**
 * Util
 */

function getProjects (projectsPath) {
  let fileList = fs.readdirSync(projectsPath)

  return fileList.map(function (val) {
    return require(projectsPath + '/' + val)
  })
}
/**
 * Generation
*/

// Source Trees obtention
const pageSource = pieceup.createSourceTree(srcPath, {
  patternArray: [
    '/**/*.ejs', // Select all .ejs files,
    '!/**/_*' // Exclude files starting with '_'
  ]
})

// Gather data
var data = {projects: getProjects(srcPath + '/_projects')}

const pipeline = pieceup.setPipeline(
  renderEJS(data),
  parseMarkdown
)

const renderedSite = pipeline(pageSource)
// Empty old assets
fs.emptyDirSync(path.join(targetPath, '/assets'))
// Move new assets
fs.copySync(path.join(srcPath, '/assets'), path.join(targetPath, '/assets'))

// Write sourceTree
pieceup.toFile(renderedSite, function (obj) {
  let localpath = path.relative(srcPath, obj.dir) + '/'

  localpath += obj.name + '.html'

  return path.join(targetPath, localpath)
})
# Pieceup.js
Pieceup is a small library designed for Node.js that aids in the process of setting up a static site generator. In a more specific sense, it provides a structure and a guideline for modifying source code in a procedural manner.

## Installation

```
npm install pieceup-js
```
## Usage

Pieceup implements a scheme comprised of two structures: ```sourceObject```, an object that contains the source code, data and other relevant information,  and ```sourceTree```, an array that contains all the ```sourceObjects``` pertinent to a process.

A **Source Tree** can be created using ```createSourceTree()```, which will read the contents of a folder and generate the array. Alternatively, a single file (which would result in a **Source Object**) can be read by using ```setFileSourceObj()```.

## Example

```javascript
// Include the library
const pieceup = require('pieceup-js')

// Store the source tree in a variable
const blogSourceTree = pieceup.createSourceTree(blogPath, [
  // Glob patterns used for selecting files

  '/**/*.md', // Select all .md files
  '!/**/_*' // Exclude files starting with '_'
])

// Set up a pipeline to do modifications to the tree
const blogEntryPipeline = pieceup.setPipeline(
  insertFrontMatter,
  renderMarkdown,
  nestInLayout)

// Execute the pipeline on the tree and store the result
var renderedBlog = blogEntryPipeline(entriesSource)

// Write to a file. The supplied function will tell the filename to use
pieceup.toFile(renderedBlog, function (obj) {
    return obj.name + '.html'
})

```
Refer to __linkplaceholder__ for a functioning example.

## Documentation

TODO


# Pieceup.js

Pieceup is a small library designed for Node, with functional programming in mind, that aids in the process of setting up a static site generator. In a more specific sense, it provides a structure and a guideline for modifying source code in a procedural manner. (Since that's what static site generators mostly do anyways)

## Installation

```
npm install pieceup-js
```
## Usage

Pieceup implements a scheme comprised of two structures: ```sourceObject```, an object that contains the source code, data and other relevant information,  and a ```sourceTree```, an array that contains all the ```sourceObjects``` pertinent to a process. Then, these objects are modified using a "pipeline", an adaptation of a [pipe function](https://medium.com/@venomnert/pipe-function-in-javascript-8a22097a538e) tailored for this particular use.

### Source Tree

A Source Tree can be created using ```createSourceTree()```, which will read the contents of a folder and generate the array. 

### Source Object

Alternatively, a single file (which would result in a Source Object) can be read by using ```setFileSourceObj()```.

### Pipeline

Pipelines can be created by using ```setPipeline()```. This provides a way of applying several functions, one after another, to each object in a Source Tree. A more detailed explanation is provided in the [documentation](https://github.com/alleras/pieceup.js#documentation).

## Example

```javascript
// Include the library
const pieceup = require('pieceup-js')

// Store the source tree in a variable
// Read and get the source tree for those blog entries
const entriesSource = pieceup.createSourceTree(blogPath, {
  patternArray: [
    '/**/*.md', // Select all .md files,
    '!/**/_*' // Exclude files starting with '_'
  ]
})

// Set up a pipeline to do modifications to the tree
const blogEntryPipeline = pieceup.setPipeline(
  insertFrontMatter,
  renderMarkdown,
  nestInLayout)

// Execute the pipeline on the tree and store the result
// Note that the argument provided is a Source Tree, but the setPipeline() function will iterate over it and call the composition of functions using each Source Object as the argument.
var renderedBlog = blogEntryPipeline(entriesSource)

// Write to a file. The supplied function will provide the filename to use
pieceup.toFile(renderedBlog, function (obj) {
    return obj.name + '.html'
})

```

## Documentation

More details on what's described here and documentation can be found [here](https://github.com/alleras/pieceup.js/blob/master/docs/INDEX.md), and all the methods [here](https://github.com/alleras/pieceup.js/blob/master/docs/API.md).
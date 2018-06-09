const fs = require('fs-extra')
const glob = require('glob')
const minimatch = require('minimatch')
const path = require('path')

/**
 * TODO: Implement assets management (CSS Precompilers, stuff like that).
 */

/**
 * Helpers
 */

// TODO: Async
const _compose = function (f1, f2) { // FIXME: Analyze for a better implementation
  return function (arg, callback) { // FIXME: Callback error management
    const result = f2(f1(arg))
    if (typeof callback === 'function') callback(result)
    return result
  }
}
const _pipeline = (...fn) => fn.reduce(_compose)

const _isObject = (...objArr) => objArr.every((obj) => (obj && typeof obj === 'object'))

const _clone = (obj) => {
  return Object.keys(obj).reduce((p, c) => {
    return _isObject(obj[c]) ? {...p, [c]: _clone(obj[c])} : {...p, [c]: obj[c]}
  }, {})
}

const _merge = (obj, source) => {
  var target = _clone(obj)

  if (_isObject(source, target)) {
    return Object.keys(source).reduce((p, c) => {
      let conditional = _isObject(target[c], source[c])
      return conditional ? {...p, [c]: _merge(target[c], source[c])} : {...p, [c]: source[c]}
    }, target)
  }
}

const _toArray = (val) => {
  if (val === null || val === undefined) {
    return []
  }
  return Array.isArray(val) ? val : [val]
}
/**
 * Filters the array weeding out non function values. If the filtered array is empty, returns false.
 * @param {*} array
 */
const returnOnlyFunctions = (array) => {
  let result = array.filter((val) => {
    if (typeof val === 'function') { return true }
    return false
  })

  return (array === undefined || array.length === 0) ? false : result
}

var Helpers = (function () {
  return {
    merge: _merge,
    pipeline: _pipeline
  }
})()

var pieceup = (function () {
  const setSourceData = function (sourceObj, data) {
    return _merge(sourceObj, {data: data})
  }

  // FIXME: URGENT Accept async functions
  const setPipeline = function (...fn) {
    return function (sourceTree, callback) {
      return sourceTree.map((obj) => _pipeline(...fn)(obj, callback))
    }
  }

  const toFile = function (sourceTree, getOuputPath) {
    // Set a fallback function to get the output path
    if (typeof getOuputPath !== 'function') {
      console.log('No function specified for getting an output path. Trying to ' +
      'use sourceObj.name property to generate a filePath')

      getOuputPath = function (obj) {
        return path.join('output', obj.name + '.html')
      }
    }
    sourceTree.map(function (obj) {
      const outputPath = getOuputPath(obj)
      try {
        let filename = obj.name && obj.ext ? obj.name.concat(obj.ext) : 'unknown filename'
        console.log(`Writing ${filename} to ${outputPath}`)
        fs.outputFileSync(outputPath, obj.source)
      } catch (err) {
        console.log(`Error writing file. Error information: ${err}\n`,
          `Object that caused the error:\n`, obj)
      }
    })
    return true
  }

  const setFileSourceObj = function (filePath, data = null, parsingFunctions = null) {
    const source = fs.readFileSync(filePath, 'utf-8')
    let sourceObject = {source: source}

    // If the supplied parsingFunctions are not functions resort to path.parse()
    if (!returnOnlyFunctions(_toArray(parsingFunctions))) {
      parsingFunctions = path.parse
    }

    // If the supplied parsingFunctions is false, we make properties null
    let properties = parsingFunctions === false ? null : parseFileProperties(filePath, parsingFunctions)

    // Let's check what to put in the object
    if (_isObject(data)) sourceObject.data = data
    if (_isObject(properties)) sourceObject = _merge(sourceObject, properties)

    return sourceObject
  }

  const createSourceTree = function (
    folderPath,
    options = {}
  ) {
    var fileList = glob.sync(`${folderPath}/**/*`)
    const {
      data = null,
      parsingFunctions = null,
      patternArray = ['!/**/*.js', '/**/*.*'],
      matchingFunction = matchPatterns(patternArray) // Default matching function
    } = options

    // Filter the obtained fileList with the provided or default function
    fileList = matchingFunction(fileList)

    return fileList.map(function (filePath) {
      return setFileSourceObj(filePath, data, parsingFunctions)
    })
  }

  const matchPatterns = function (patternArray) {
    patternArray = _toArray(patternArray)

    return function (fileList) {
      return patternArray.reduce((listArray, pattern) => {
        return listArray.filter((filePath) => {
          // Minimatch won't do anything with paths starting with a dot, so we remove them.
          const target = filePath.startsWith('.') ? filePath.slice(1) : filePath
          return minimatch(target, pattern)
        })
      }, fileList)
    }
  }

  const parseFileProperties = function (filePath, parsingFunctions = []) {
    parsingFunctions = _toArray(parsingFunctions)

    return parsingFunctions.filter((val) => { // Weed out non function values
      if (typeof val === 'function') { return true }
      return false
    }).map((parseFn) => { // Execute each function in the array to get desired data for this path
      return parseFn(filePath)
    }).reduce((previous, current) => { // Merge the resulting array of objects into a single object
      return _merge(previous, current)
    }, {})
  }

  // Expose Methods
  return {
    setFileSourceObj: setFileSourceObj,
    createSourceTree: createSourceTree,
    setPipeline: setPipeline,
    setSourceData: setSourceData,
    matchPatterns: matchPatterns,
    toFile: toFile,
    helpers: Helpers
  }
})()

module.exports = pieceup

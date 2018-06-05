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

var SiteGenerator = (function () {
  /**
   * Sets object data.
   *
   * @param {*} sourceObj The Source Object to which the data will be set.
   * @param {*} data An object containing the properties to change or add.
   *
   * @returns {object} sourceObj
   */
  const setSourceData = function (sourceObj, data) {
    return _merge(sourceObj, {data: data})
  }

  /**
   * Sets a chain of processing functions, that will be applied to each Source Object in the Source Tree. In the execution of each function, the ouput of the previous is the input of the next.
   *
   * FIXME: URGENT Accept async functions
   * @param {array} fn Functions that will process the Source Object. Each should return a Source Object.
   * @returns {function} Partially applied function that will take the SourceTree and a callback (optional) as arguments.
   */
  const setPipeline = function (...fn) {
    return function (sourceTree, callback) {
      return sourceTree.map((obj) => _pipeline(...fn)(obj, callback))
    }
  }

  /**
   * Writes the "source" property of each sourceObject in a Tree to a file.
   *
   * @param {array} sourceTree The Source Tree containing all the Source Objects.
   * @param {function=} getOuputPath A function that takes the Source Object as input and returns an output path.
   */
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
  }

  /**
   * Creates a new Source Object using the content read from a file.
   *
   * @param {string} filePath The path of the file to be read.
   * @param {object} data An object containing variables. It will be inserted in the "data" property of the Source Object.
   * @param {array} parsingFunctions Array of functions, or a function, that will return an object with the properties of the file.
   *
   * @returns {object} An object containing the structured data of the file.
   */
  const setFileSourceObj = function (filePath, data, parsingFunctions) {
    const source = fs.readFileSync(filePath, 'utf-8')
    let sourceObject = {source: source}

    // If the supplied parsingFunctions are not functions resort to path.parse()
    if (!returnOnlyFunctions(_toArray(parsingFunctions))) {
      parsingFunctions = path.parse
    }

    // If the supplied parsingFunctions is false, we make properties null
    let properties = parsingFunctions === false ? null : parseFileProperties(filePath, parsingFunctions)

    // Let's check what to put in the object
    if (data) sourceObject.data = data
    if (_isObject(properties)) sourceObject = _merge(sourceObject, properties)

    return sourceObject
  }

  /**
  * @typedef {Object} SourceTreeOptions
  * @property {object=} data Will be inserted in the "data" property of the Source Object.
  * @property {array=} parsingFunctions Array of functions, or a function, that will return an object with the properties of the file. Pass false to not get the file properties.
  * @property {function=} matchingFunction A function used to select which files will be included (or excluded). Should return an array of paths.
  */

  /**
  * Creates an array of Source Objects parting from the files obtained after reading the specified folder and filtering through the glob patterns.
  *
  *
  * @param {string} folderPath The path to the folder where the files to be read are.
  * @param {array=} patternArray An array of glob matching patterns, to be applied in order.
  * @param {SourceTreeOptions=} options
  *
  * @returns {array} An array containing Source Objects.
  */
  const createSourceTree = function (
    folderPath,
    patternArray = ['!/**/*.js', '/**/*.*'], // FIXME: Make part of options object
    options = {}
  ) {
    var fileList = glob.sync(`${folderPath}/**/*`)
    const {
      data = null,
      parsingFunctions = null,
      matchingFunction = matchPatterns(patternArray) // Default matching function
    } = options

    // Filter the obtained fileList with the provided or default function
    fileList = matchingFunction(fileList)

    return fileList.map(function (filePath) {
      return setFileSourceObj(filePath, data, parsingFunctions)
    })
  }
  /**
   * Executes multiple minimatch patterns.
   *
   * @param {array} patternArray Array containing the patterns to use. Function executes them in order to get a fileList. If patternArray is null or undefined, the returned fileList will be empty.
   *
   * @returns {array} A list of paths.
   */
  const matchPatterns = function (patternArray) {
    patternArray = _toArray(patternArray)

    return function (fileList) {
      return patternArray.reduce((listArray, pattern) => {
        return listArray.filter((path) => {
          // Minimatch won't do anything with paths starting with a dot, so we remove them.
          const target = path.startsWith('.') ? path.slice(1) : path
          return minimatch(target, pattern)
        })
      }, fileList)
    }
  }
  /**
   * Execute a function or array of functions to get a file's properties.
   *
   * @param {*} filePath The path to the file.
   * @param {*} parseArray Array of functions to use. Each function should use the path of the file as a parameter.
   *
   * @returns {object} An object with the parsed properties.
   */
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

module.exports = SiteGenerator

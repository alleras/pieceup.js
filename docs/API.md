## API

### `` setSourceData(sourceObj, data) ``
Sets data in a sourceObject.

#### Arguments

* **sourceObj _``(object)``_**: The Source Object to which the data will be set.

* **data _``(object)``_**: An object containing the properties to change or add.

#### Returns

* **_``(object)``_**: A sourceObject with the modified data.

### `` setPipeline(...fn) ``

Sets a chain of processing functions that will be applied to each ``Source Object`` in the ``Source Tree``. In the execution of each function, the ouput of the previous is the input of the next.

#### Arguments

* **fn _``(function)``_**: Functions that will process the ``Source Object`` as the pipeline iterates. Each should return the same kind of object. As many functions (in this case, arguments) can be used as needed.

#### Returns

* **_``(function)``_**: Partially applied function that will take the ``SourceTree`` and a ``callback`` (optional) as arguments.

### `` toFile(sourceTree, getOuputPath) ``

Writes the "source" property of each sourceObject in a Tree to a file.

#### Arguments

* **sourceTree _``(Array)``_**: The ``Source Tree`` containing all the ``Source Objects``.

* **getOuputPath _``(function)``_**: A function that takes the ``Source Object`` as input and returns an output path.

#### Returns

* ``True`` if function succeeds.

### `` setFileSourceObj(filePath, data, parsingFunctions) ``

Creates a new Source Object using the content read from a file.

#### Arguments

* **filePath _``(string)``_**: The path of the file to be read.

* **data _``(object)``_**: (Default: ``null``) An object containing variables. It will be inserted in the "data" property of the ``Source Object``.

* **parsingFunctions _``(Array)``_**: (Default: ``null``) Array of functions, or a function, that will return an object with the properties of the file.

#### Returns

* **_``Object``_**: An object containing the structured data of the file.

### `` createSourceTree(folderPath, options) ``

Creates a ``Source Tree``, which is an array of Source Objects parting from the files obtained after reading the specified folder and filtering through the glob patterns.

#### Arguments

* **folderPath _``(string)``_**: The path to the folder where the files to be read are.

* **options _``(object)``_**: All options are described in the table below.

| Parameter | Type | Description |
| --- | --- | --- |
| data | **_``(object)``_** | **(Default: ``null``)** Will be inserted in the "data" property of the Source Object.|
| parsingFunctions | **_``(array)``_** | **(Default: ``null``)** Array of functions, or a function, that will return an object with the properties of the file. Pass false to not get the file properties. |
| patternArray | **_``(array)``_** | **(Default: ``['!/**/*.js', '/**/*.*']``)** An array of glob matching patterns, to be applied in order. |
| matchingFunction | **_``(function)``_** | **(Default: ``matchPatterns(patternArray)``)** A function used to select which files will be included (or excluded). Should return an array of paths. |

For more information on how to use ``patternArray`` refer to https://github.com/alleras/pieceup.js/blob/master/docs/how-to-use-pattern-array.md

#### Returns

* **_``(array)``_**: An array containing ``Source Objects``.

### `` matchPatterns(patternArray)``

Executes multiple minimatch patterns.

#### Arguments

* **patternArray _``(array)``_**: Array containing the patterns to use. Function executes them in order to select the paths that comply with the rules. 

#### Returns

* **_(array)_**: A list of paths. If ``patternArray`` is ``null`` or ``undefined``, the returned array will be empty.

### `` parseFileProperties(filePath, parsingFunctions) ``

Execute a function or array of functions to get a file's properties.

#### Arguments

* **filePath _``(string)``_**: The path to the file.

* **parseArray _``(array)``_**: Array of functions to use. Each function should use the path of the file as a parameter.

#### Returns

* **_``(object)``_**: An object with the parsed properties.
# Pieceup.js Documentation

Content table:

* [Source Object](#source-object) - The actual **stuff** we're handling.
* [Source Tree](#source-tree) - Just an array, man.
* [Pipeline](#pipeline) - Complicated, except it's not.

Also see:

* [How to use the patternArray?](https://github.com/alleras/pieceup.js/blob/master/docs/how-to-use-pattern-array.md)
* [API Documentation](https://github.com/alleras/pieceup.js/blob/master/docs/API.md)

Pieceup is a small library designed for Node, with functional programming in mind, that aids in the process of setting up a static site generator. In a more specific sense, it provides a structure and a guideline for modifying source code in a procedural manner. (Since that's what static site generators mostly do anyways)

The library focuses on the three most importants steps in an asset flow:

1. Reading files and obtaining data.
2. Making modifications and gathering information from a source code.
3. Rendering and writing to files.

For that, Pieceup.js implements the following schemes:

## Source Object

A **Source Object** is the most important and smaller unit in Pieceup.js. At its core, it's a simple object that contains all the information for a single element (file) in the structure. This object can take any form, and any kind of data can be added to it, since all the modification is handled by other entities rather than Pieceup; the library is just there to facilitate the handling of information. 

However, Pieceup relies on two properties: ``sourceObject.source`` and ``sourceObject.data`` which are only manipulated by the library in order to write to a file. (And even with that, you could implement your own writing function and just ditch the provided one).

A typical structure for a ``Source Object`` would be as follows:

```javascript 
{
    source: 'Source code in a string',
    data: {
        here: 'val',
        is: {},
        an: ['val1', 'val2'],
        object: 1234
    },
    name: 'filename',
    ext: '.ejs',
    dir: '/path/to/dir'
}
```

## Source Tree

Starting on that structure, then, everything else is a piece of cake. In projects we would have several files, so a ``Source Tree`` is simply an array used to accomodate all the ``Source Objects`` as necessary.

```javascript 
[
    {
        source: 'first source code in a string',
        data: {
            here: 'val',
            is: {},
            an: ['val1', 'val2'],
            object: 1234
        },
        name: 'filename1',
        ext: '.ejs',
        dir: '/path/to/dir'
    },
    {
        source: 'second source code in a string',
        data: {
            whoops: 'This one only has a value!'
        },
        name: 'filename2',
        ext: '.ejs',
        dir: '/path/to/dir'
    },
]
```

## """"Pipeline""""

And last but not least, having already handled the situation of reading data and source code, Pieceup implements a "pipeline", which is used to modify each object in a ``Source Tree`` using a set of functions. It is enclosed on so many quotes because, simply, a "pipeline" is a composition of functions:

```javascript
// Apply the first function to an object
// Then apply the second function on the return value of that first function
f2(f1(obj))
```
Which is used as many times as needed (a pipe function):

```javascript
// We can go on and on and on
...fn(f3(f2(f1(obj))))
```

But in this case, the function ``setPipeline()`` lets us do that without too much hassle, instead defining all the functions in its arguments:

```javascript
// Define the pipeline
var pipeline = setPipeline(
    f1,
    f2,
    f3,
    ..fn
)

// And execute it upon an object
var result = pipeline(obj)
```

Since we need some consistency (keeping the properties ``sourceObject.source`` and ``sourceObject.data``) all the functions used in the pipeline should return a ``Source Object``.

[This article](https://medium.com/@venomnert/pipe-function-in-javascript-8a22097a538e) explains composition and the use of a pipe function.
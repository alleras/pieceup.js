# Pieceup.js Documentation

## So, how do I use that "patternArray"?

The function ``createSourceTree()`` includes in its ``options`` object a property called ``patternArray`` that defines what glob pattern will apply and how. 

Let's begin with an example.

### The example

Let's say we have the following, very problematic file structure: 

```
path/to/project/

ReadThisFolder/index.ejs
ButNotThisOne/dontReadMe.ejs
_OrThisOne/index.ejs
index.ejs
anotherFile.ejs
_dontReadUnderscores.ejs
dontReadJS.js

```

So we don't want to read ``ButNotThisOne`` and its files, or ``_dontReadUnderscores.ejs`` ... and so on.

We could use a ``patternArray`` as the following:

```javascript
var patternArray = [
    // Select all files with .ejs files and exclude everything else
    '/**/*.ejs',
    // Exclude files starting with an underscore
    '!/**/_*',
    // Exclude folders starting with an underscore
    '!/**/_*/**/*',
    // Exclude folder ButNotThisOne
    '!/ButNotThisOne/**'
]
```

### What's happening?

When ``createSourceTree()`` is called with the option ``patternArray``, Pieceup calls internally a function named ``matchPatterns()``. 

The responsibility of that function is to select a rule, walk through the list of files (which is an array too) and remove each element that doesn't apply. Then, the next rule will be selected but now using the already filtered file list, and so on.

So the first rule (`'/**/*.ejs'`) will make the next rule be processed with the following file list:

```
path/to/project/

ReadThisFolder/index.ejs
ButNotThisOne/dontReadMe.ejs
_OrThisOne/index.ejs
index.ejs
anotherFile.ejs
_dontReadUnderscores.ejs
```

Then ``'!/**/_*'`` makes it:

```
path/to/project/

ReadThisFolder/index.ejs
ButNotThisOne/dontReadMe.ejs
_OrThisOne/index.ejs
index.ejs
anotherFile.ejs
```

Then ``'!/**/_*/**/*'``:


```
path/to/project/

ReadThisFolder/index.ejs
ButNotThisOne/dontReadMe.ejs
index.ejs
anotherFile.ejs
```

And so on, until it has no more rules to select and then returns whatever is left. The [source code for matchPatterns()](https://github.com/alleras/pieceup.js/blob/ad8debab45b73f7cef85f76aeab1260c47da169b/pieceup.js#L144) can give more insight on its workings.
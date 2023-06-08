# Tag Checker

Tag Checker is a program to check strings whether containing well-matched HTML tag, and to report checking result.

## Prerequisites

The following run time is required to run this program:

-   Node.JS (developed and tested in v18)

## How to run

1. Install dependencies
    ```bash
    > npm i
    ```
1. [Optional] Change the inputs in [./src/index.ts](/src/index.ts)

    ```typescript
    // at line 3
    const inputs = [
        'The following text<C><B>is centred and in boldface</B></C>',
        '<B>This <g>is <B>boldface</B> in <<*> a</B> <\\6> <<d>sentence',
        '<B><C> This should be centred and in boldface, but the tags are wrongly nested </B></C>',
        '<B>This should be in boldface, but there is an extra closing tag</B></C>',
        '<B><C>This should be centred and in boldface, but there is a missing closing tag</C>',
    ]
    ```

1. Transpile the TS code into JS

    ```bash
    > npm run build
    ```

1. Run the program (and it prints the result out)

    ```bash
    > npm run main
    ```

    Sample output:

    ```
    Correctly tagged paragraph
    Correctly tagged paragraph
    Expected </C> found </B>
    Expected # found </C>
    Expected </B> found #
    ```

## Tech Stack used

-   JavaScript
-   TypeScript
-   Jest

## Approach

### Project structure

All working codes are placed under `src` folder, with entry point in `./src/index.ts` which contains some test inputs and uses [validateTag](./src/tag-checker.ts) function to print the result

### Overview

The solution consists of three parts:

validateTag -> readTag -> parseTag

### validateTag

This is the engine for checking if all tags are fully matched. It maintains a stack (`tagStack`) to keep track of the latest unclosed tag, while the `readTag` generator function will continuously digest the input string and return a stream of `Tag` objects.

Here are the handling for the tag outputted by the generator:

-   leading tag: push the tag into stack
-   closing tag: pop the tag out from stack, and check whether it matches the current closing tag name
    -   if matched: continue to read the next tag (Happy case)
    -   otherwise: report the error for un-matching tag and end the whole process

After all tags are read, the stack should be empty, as all pair of tag should be matched, and report a valid string. If not, report missing closing tag error.

### readTag

A thin layer to hide all the parsing details from the outer world and relay the found valid tag to the consumer. It essentially connects and translates the output from the parser `parseTag` to the engine `validateTag`.

### parseTag

It is a specialized function to parse the input string by extracting a valid tag name and its tag status, and the substring immediately followed by the found tag.

Regex is employed to do the pattern matching for the valid tag (capital letters surrounded by angular bracket and with optional backslash).

The return of this functions contains a found tag (if any) and a remnant string (if any, the substring directly followed by the tag)

## Unit tests

`Jest` test suite is used for running tests with the spec files under `./src/__tests__` folder.

To run the tests:

```bash
> npm run test
```

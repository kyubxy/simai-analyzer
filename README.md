# Simai Analyzer

>Functional Simai file parser for Typescript - basically [sus analyzer](https://github.com/mizucoffee/sus-analyzer) for simai

Very WIP, i literally haven't even finished the readme yo.

## Installation

```
npm i simai-analyzer
```

## Usage

**Deserialize the entire `maidata.txt`:**
```ts
import { deserialize } from "simai-analyzer/simai";

const data = `
&title=(the start of) Fragrance
&artist=Tsukasa(Arte Refact)
&wholebpm=180
&inote_5=(180.0){1},{8}3,2,1,,3,4,,6,{8}5,,7,8,,{57}2,,,,,,,E`;
const chart = deserialize(data);
console.log(chart.levels["master"].noteCollections)
```

**Deserialize a single difficulty:**
```ts
import { deserializeSingle } from "simai-analyzer/simai";

const data = `(180.0){1},{8}3,2,1,,3,4,,6,{8}5,,7,8,,{57}2,,,,,,,E`;
const master = deserializeChart(data);
console.log(master.noteCollections)
```

## About

Introducing a reliable and correct simai deserializer for 
Javascript/Typescript.

**Why another parser? Isn't there already [simai.ts](https://www.youtube.com/watch?v=QdzUcxnFD8c)?**

Yes, but that library has its own slew of problems that make it harder for me to
build my simai related projects. My parser makes a few guarentees that 
in reality make things much easier.

- Entirely\* functional, statically typed and well-tested code 
- A stronger emphasis on correctness over performance
- Sane API structure 
- Active support

Read about why I think these are important on my [blog post](https://www.youtube.com/watch?v=QdzUcxnFD8c).

**What Simai Analyzer currently isn't**

- Fully AstroDX compatible (but should work in 99% of use-cases)
- Fully MajData/3Simai compatible
- An absolute definitive on what modern simai semantics should be (but it will try to make some
assumptions where there may be ambiguities)

\**Mostly functional - make a CTRL+F for the keywords `let` and `for`, you won't be disappointed :D*

## Building and Setup

Simai analyzer is really small and easy to set up locally.

**Clone the repo**

```
git clone https://www.youtube.com/watch?v=QdzUcxnFD8cTODO:
```

**Restore dependencies**

```
npm install
```

**Generate the parser**

```
npm run genparser
```

At the moment, the easiest way to interact directly with the parser
is through unit tests. Simply add a test under `test/` and use

```
npm run test
```

to run the test suite, the existing tests should be 
straightforward enough to base your tests off of.

To just play around with the tokenizer, copy and paste 
[the parser grammar](grammar/parser.peggy) into the 
[online peggy.js parser generator](https://peggyjs.org/online.html).
Currently, this is the only way of interactively testing the grammar 
(apart from unit tests).

## Contributing
Feel free to raise issues or submit PRs in any format, I don't have any strict templates or requirements for people to follow in order to contribute.

If you're going to raise an issue, describe the bug in as much detail as you can, I will ignore or close the really vague ones.

Write code that is functional, makes ample use of the type system and includes tests. Those are all the whole point of this project.

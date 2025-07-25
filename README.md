<p align="center">
  <img src="graphicdesignismypassion.png" alt="graphic design is my passion" />
</p>

<h1 align="center"> Simai Analyzer Tools for Typescript </h1>

<center>

[![npm version](https://badge.fury.io/js/simai-analyzer.svg)](https://badge.fury.io/js/simai-analyzer)
[![Node.js CI](https://github.com/kyubxy/simai-analyzer/actions/workflows/node.js.yml/badge.svg)](https://github.com/kyubxy/simai-analyzer/actions/workflows/node.js.yml)
[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)

</center>

>Functional Simai file parser for Typescript - basically [sus analyzer](https://github.com/mizucoffee/sus-analyzer) for simai

## Installation

```txt
npm i simai-analyzer
```

> [!WARNING]
> This project is still relatively new and is not fully done yet.
> Deserialisation might work, but serialisation is still not implemented.

## Usage

**Deserialize the entire `maidata.txt`:**

```ts
import { deserializeMaidata } from "simai-analyzer/simai";

const file = `
&title=(the start of) Fragrance
&artist=Tsukasa(Arte Refact)
&wholebpm=180
&inote_5=(180.0){1},{8}3,2,1,,3,4,,6,{8}5,,7,8,,{57}2,,,,,,,E`;
const { errors, chart } = deserializeMaidata(file);
doStuffWith(chart.levels[difficulty.master].noteCollections)
```

**Deserialize a single difficulty:**

```ts
import { deserializeLevel } from "simai-analyzer/simai";

const data = `(180.0){1},{8}3,2,1,,3,4,,6,{8}5,,7,8,,{57}2,,,,,,,E`;
const { errors, chart: master } = deserializeSingle(data);
doStuffWith(master.noteCollections)
```

See [the parse type UML diagram](https://github.com/kyubxy/simai-analyzer/wiki/Parse-type-UML-diagram) for more details on the deserialisation output.

## About

Introducing a reliable and correct simai deserializer for
Javascript/Typescript.

**What's so good about this one?**

This parser has a few good things going for it which should make the lives of
developers and players easier.

- A fault tolerant system. Malformed charts still partially come
through without just giving up and throwing errors.
- Entirely functional, typed and well-tested code
- Robust and clearly defined syntax parsing with Peggy.js
- A stronger emphasis on correctness over performance
- Sane API structure
- Active support

**What Simai Analyzer currently is not**

- Fully AstroDX compatible (but should work in 99% of use-cases)
- Fully MajData/3Simai compatible
- An absolute definitive on what simai semantics should be
(but it will make clear any some assumptions where there may be ambiguities)

## Building and Setup

Simai analyzer is really small and easy to set up locally.

**Restore dependencies**

```txt
npm install
```

**Generate the parser**

```txt
npm run genparser
```

At the moment, the easiest way to interact directly with the parser
is through unit tests. Simply add a test under `test/` and use

```txt
npm run test
```

to run the test suite, the existing tests should be
straightforward enough to base your tests off of.

To play around with just the tokenizer, copy and paste
[the parser grammar](grammar/parser.peggy) into the
[online peggy.js parser generator](https://peggyjs.org/online.html).
It is also possible to download the peggyjs vscode extension to
test the grammar directly. Of course, unit tests are always the best way
of doing tests.

## Contributing

Feel free to raise issues or submit PRs in any format.

If you're going to raise an issue, describe the bug in as much detail as you can.

Try to follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) style of writing commit messages.

Write code that is functional, makes ample use of the type system and includes tests. Those are all the whole point of this project.

# Simai Analyzer

>Simai file parser for Javascript - basically [sus analyzer](https://www.npmjs.com/package/sus-analyzer) for simai

**Now written in fp-ts!**

English | [日本語](docs/nihongo.md)

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
console.log(chart.master.noteCollections)
```

**Deserialize a single difficulty:**
```ts
import { deserializeSingle } from "simai-analyzer/simai";

const data = `(180.0){1},{8}3,2,1,,3,4,,6,{8}5,,7,8,,{57}2,,,,,,,E`;
const master = deserializeSingle(data);
console.log(master.noteCollections)
```

## About

Introducing a reliable and correct simai deserializer for 
Javascript/Typescript.

**Why another parser? Isn't there already [simai.ts](TODO:)?**

Yes, but that library has its own slew of problems that make it harder for me to
build my simai related projects. My parser makes a few guarentees that make life
easier.

- Entirely\* functional, statically typed and well-tested code 
- A stronger stance on correctness over performance
- Sane API structure 
- Active support

Read about why I think these are important on my [blog post](TODO:).

**What Simai Analyzer currently isn't**

- Fully AstroDX compatible (but should work in 99% of use-cases)
- Fully MajData/3Simai compatible
- An absolute definitive on what modern simai semantics should be (but it will try to make some
assumptions where there may be ambiguities)

\**Mostly functional - make a CTRL+F for the keywords `let` and `for`, you won't be disappointed :D*

# Still a WIP

## Contributing


# Simai Analyzer

>Simai file parser for Javascript - basically [sus analyzer](https://www.npmjs.com/package/sus-analyzer) for simai

**Now written in fp-ts!**

English | [日本語](docs/nihongo.md)

## Installation

```
npm i simai-analyzer
```

## Usage
TODO:

## About

Introducing a reliable and correct simai deserializer for 
Javascript/Typescript.

**Advantages of Simai Analyzer for simai file parsing**

- Functional, well-tested code - ~78% code coverage\*
- Uses Peggy.js for parsing
- Sane API structure 
- Active support

**What Simai Analyzer currently isn't**

- Fully AstroDX compatible (but should work in 99% of use-cases)
- Fully MajData/3Simai compatible
- An absolute definitive on what modern simai semantics should be (but it will make some
assumptions where there may be ambiguities)

\**Coverage derived from running `npx jest --coverage`, 
I don't update the readme a lot so the actual number may deviate 
slightly.*

# Still a WIP

## Contributing


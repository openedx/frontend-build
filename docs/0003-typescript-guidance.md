# Introducing TypeScript

## Status
Accepted

## Context
TypeScript is a strongly-typed superset of JavaScript that adds optional static type checking, class-based object-oriented programming, and other features to JavaScript.  
Here are some of the advantages of TypeScript over JavaScript:

### Type safety
TypeScript helps catch errors at compile-time instead of runtime by adding type annotations to variables, functions, and classes. This can help prevent errors that might occur when dealing with large codebases (particularly when engaging in large refactorings).
### Better tooling support
TypeScript has better tooling support than JavaScript, with features like code navigation, auto-completion, and refactoring tools in popular code editors like Visual Studio Code.
### Improved code organization
TypeScript's class-based object-oriented programming model allows developers to organize code in a more structured and maintainable way.
### Easy adoption
TypeScript is a superset of JavaScript, which means that any valid JavaScript code is also valid TypeScript code. This makes it easy for developers to adopt TypeScript gradually, without needing to rewrite their entire codebase.
### Community support
TypeScript has a growing community of developers who contribute to its development, create libraries and tools, and provide support to other developers. This makes it easier for developers to learn and adopt TypeScript.

## Decision
### Alternatives Considered
#### Flow
Flow, developed by Facebook, accomplishes many of the same things as TypeScript, albeit as an annotation system bolted on to Javascript rather than as a separate language.  While it theoretically has an easier learning curve, its popularity has been eclipsed by TypeScript over time.
#### Plain JavaScript with more JSDoc documentation
While JSDoc strings can annotate functions argument types and even complex objects, it doesn't have the same level of linting tooling that TypeScript does. 

### Target Goals
Prioritize using TypeScript in the following places:
* New code files
* Existing API endpoints (and their payloads)
* React Context/Redux state objects
* Components or Functions take a lot of parameters, or use parameters that are themselves complex objects

Less important are:
* React components without complex input objects (especially since they are often adequately served with PropTypes)
* Test code

### Migration Strategy
While migrating Javascript code to TypeScript code is relatively straightforward, the initial introduction of TypeScript into a code base can involve some unexpected wrinkles.  While we will 
work to streamline our infrastructure to make this easier over time, we advise introducing TypeScript in a minimalist fashion initially, by introducing or migrating a single file into TypeScript (or even a single function within a file).  

The reasons for this are practical:
* The most difficult part of the initial process of introducing TypeScript into a Javascript codebase is harmonizing with the existing build, test, and lint configuration.
* The smaller the initial effort of introducing TypeScript into a codebase, the easier it is to actually implement around more pressing feature work.

## Consequences
### Benefits
* Code that requires heavy contracts, whether that's functions/components with lots or parameters, or complex objects returned from backend API's, will become much more comprehensible and easier to work with in a modern programming IDE.
* Because TypeScript is a superset of Javascript, the code does not need to be migrated all at once, but can be updated to TypeScript during the course of regular feature work.

### Challenges
* Migrating to TypeScript falls into the category of Tech Debt, which is difficult to get around to around the demands of mission-critical feature work and bug fixes.
* There can be a bit of a learning curve around using TypeScript, particularly for Javascript developers who don't have prior experience with strongly-typed languages. 

## Follow-up Questions
### Should we still use...
#### React PropTypes
For repositories with PropTypes already in place (and related eslint checks), it likely still makes sense to keep using PropTypes alongside TypeScript for now.  Additionally, some tooling currently in use(such as Gatsby documentation) relies on PropTypes.

## References
* https://www.typescriptlang.org/

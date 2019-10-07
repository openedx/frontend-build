1. Non-Usage of Gatsby
----------------------

Status
------

Accepted

Context
-------

This package is responsible for containing common code concerning the transpilation,
building, linting, and testing of React-based microfrontends. Gatsby was considered as a
potential tool for this job.

Decision
--------

We will not use Gatsby in these frontend build tools for two reasons:

- Gatsby is itself a javascript framework. It concerns itself with more than 
  frontend build tooling, including patterns and tools for the runtime of the frontend app itself.
- Gatsby relies heavily on convention, expecting to find files in particular places.
  This makes it difficult/impossible to pull a common configuration of Gatsby into a
  package like this one.

Consequences
------------

Gatsby is a great tool for us leverage when appropriate, but it is not the right tool
for the concern of this package.

References
----------

* https://www.gatsbyjs.org/docs/
* https://www.gatsbyjs.org/docs/gatsby-project-structure/

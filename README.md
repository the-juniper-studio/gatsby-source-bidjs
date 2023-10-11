<p align="center">
  <a href="https://www.gatsbyjs.com">
    <img alt="Gatsby" src="https://www.gatsbyjs.com/Gatsby-Monogram.svg" width="60" />
  </a>
  <span>+<span>
  <a href="https://bidjs.com/">
  <img alt="BidJS" src="https://media.bidjs.com/image/upload/f_auto,q_auto/v1629452347/bidjs-com/logo.png" width="60">
  </a>
</p>
<h1 align="center">
  Gatsby Source BidJS
</h1>

** This Plugin is Still in Alpha release and is subject to breaking changes until V1 is offificially releases **

## What does this plugin do?

This plugin queries live auctions and past auctions on the BidJS platform and returns the information is GraphQL.

## Why should you use it?

This Service is great for generating link to specific auction items and generating your own auction pages. It does not allow users to bid on items. The API calls are purely to return content.

## 🚀 Quick start

```shell
npm install gatsby-source-bidjs
```

## Add environment variables

Environment variables allow you to safely store sensitive information about your projects, like your BidJS ClientId or Region. At the root of your project, create two files:

.env.development
.env.production

Then, add the variables on each file to match your BidJS Config information (provided by BidJS)
GATSBY_BIDJS_CLIENT_ID // e.g. demonstration
GATSBY_BIDJS_REGION // e.g. eu-west-2
GATSBY_BIDJS_SERVER // e.g. hove
GATSBY_BIDJS_VERSION // e.g. 5
GATSBY_COMPANY_URL // e.g. https://www.thejuniperstudio.com (do not include trailing slash)

## Configure the plugin

Define the plugin configuration in the `gatsby-config.js` file. The following gives a basic example of the plugin.

```shell
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  plugins: [
    // ...
    {
      resolve: gatsby-source-bidjs,
      options: {
        clientId: process.env.GATSBY_BIDJS_CLIENT_ID,
        region: process.env.GATSBY_BIDJS_REGION,
        server: process.env.GATSBY_BIDJS_SERVER,
        version: process.env.GATSBY_BIDJS_VERSION,
        siteURL: process.env.GATSBY_COMPANY_URL
      }
    },
  ]
}
```

This will now return

## How to Contribute

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd love to have your help.

Asking a question or reporting a bug: please feel free to open an [issue](https://github.com/the-juniper-studio/gatsby-source-bidjs/issues).

Suggesting an improvement: Open an issue explaining your improvement or feature so we can discuss and learn more. Please also check [our roadmap](ROADMAP.md) to see what ideas for improvements we already have

Submitting code changes: For small fixes, feel free to open a PR with a description of your changes. For large changes, please first open an issue so we can discuss if and how the changes should be implemented.

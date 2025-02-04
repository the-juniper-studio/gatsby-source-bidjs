const { addSlashIfNotPresent } = require('./src/utils/stringUtils')
const path = require('path')
const chalk = require('chalk')

console.log(chalk.hex('#fff')('╔═══════╗'))
console.log(chalk.hex('#fff').bold('║ Bid') + chalk.hex('#22C997').bold('JS') + chalk.hex('#fff').bold(' ║'))
console.log(chalk.hex('#fff')('╚═══════╝'))

console.time('Create BidJS GraphQL')

exports.sourceNodes = async ({ actions: { createNode }, createContentDigest, createNodeId, store, cache, reporter }, pluginOptions) => {
  // Get Company URL
  const companyUrl = addSlashIfNotPresent(pluginOptions.siteURL)

  // Live Auctions
  const homeResponse = await fetch(`https://${pluginOptions.server}.${pluginOptions.region}.bidjs.com/auction-007/api/v1/home`, {
    headers: {
      'x-forwarded-client-id': pluginOptions.clientId
    }
  })
  const bidjsHome = await homeResponse.json()

  bidjsHome.models.HomePageModel.upcomingModel.upcomingAuctions.forEach((auction) => {
    const nodeData = Object.assign({
      ...auction,
      auctionUuid: auction.auctionUuid,
      children: [],
      endsOrStarts: auction.endsOrStarts,
      featured: false,
      id: createNodeId(auction.auctionId),
      auctionLogo: auction.auctionLogo ? auction.auctionLogo?.attachmentUrl : 'null',
      firstImage: auction.firstItem.attachmentModel?.attachmentUrl ? auction.firstItem.attachmentModel.attachmentUrl : 'null',
      internal: {
        type: `BidJS`,
        contentDigest: createContentDigest(auction)
      },
      image: {
        url: auction.auctionLogo ? auction.auctionLogo?.attachmentUrl : 'null',
        alt: auction.auctionLogo ? auction.auctionLogo?.label : 'null'
      },
      itemCount: auction.itemCount,
      location: auction.location,
      parent: null,
      path: `/auction/#!/auctions/${auction.auctionUuid}`,
      title: auction.title,
      typeMessage: auction.typeMessage
    })
    createNode(nodeData)
  })

  bidjsHome.models.HomePageModel.upcomingModel.upcomingFeaturedAuctions.forEach((featuredAuction) => {
    const nodeData = Object.assign({
      ...featuredAuction,
      auctionUuid: featuredAuction.auctionUuid,
      children: [],
      endsOrStarts: featuredAuction.endsOrStarts,
      featured: true,
      id: createNodeId(featuredAuction.auctionId),
      auctionLogo: featuredAuction.auctionLogo ? featuredAuction.auctionLogo?.attachmentUrl : 'null',
      firstImage: featuredAuction.firstItem.attachmentModel?.attachmentUrl ? featuredAuction.firstItem.attachmentModel?.attachmentUrl : 'null',
      internal: {
        type: `BidJS`,
        contentDigest: createContentDigest(featuredAuction)
      },
      image: {
        url: featuredAuction.auctionLogo ? featuredAuction.auctionLogo?.attachmentUrl : 'null',
        alt: featuredAuction.auctionLogo ? featuredAuction.auctionLogo?.label : 'null'
      },
      itemCount: featuredAuction.itemCount,
      location: featuredAuction.location,
      parent: null,
      path: `/auction/#!/auctions/${featuredAuction.auctionUuid}`,
      title: featuredAuction.title,
      typeMessage: featuredAuction.typeMessage,
      url: `${companyUrl}/auction/#!/auctions/${featuredAuction.auctionUuid}`
    })

    createNode(nodeData)
  })

  // Archived Auctions
  const auctionsArchivedResponse = await fetch(`https://${pluginOptions.server}.${pluginOptions.region}.bidjs.com/auction-007/api/v1/auctionsArchived`, {
    headers: {
      'x-forwarded-client-id': pluginOptions.clientId
    }
  })
  const bidjsAuctionsArchived = await auctionsArchivedResponse.json()
  if (bidjsAuctionsArchived?.basicAuctionBidJSModelList?.length > 0) {
    bidjsAuctionsArchived.basicAuctionBidJSModelList.forEach((archivedAuction) => {
      const last_publication_date = new Date(archivedAuction.auctionEndTime)
      const nodeData = Object.assign({
        ...archivedAuction,
        children: [],
        id: createNodeId(archivedAuction.auctionId),
        internal: {
          type: `BidJSAuctionsArchived`,
          contentDigest: createContentDigest(archivedAuction)
        },
        last_publication_date: last_publication_date?.toISOString(),
        parent: null,
        path: `/auction/#!/auctions/${archivedAuction.auctionUuid}`,
        url: `${companyUrl}/auction/#!/auctions/${archivedAuction.auctionUuid}`
      })
      createNode(nodeData)
    })
  } else {
    console.warn('No BidJS Archived Auctions Found')
  }

  // Fetch Marketplace Data
  const marketplaceResponse = await fetch(`https://${pluginOptions.server}.${pluginOptions.region}.bidjs.com/auction-007/api/v3/marketplace`, {
    headers: {
      'x-forwarded-client-id': pluginOptions.clientId
    }
  })
  const marketplaceData = await marketplaceResponse.json()
  const salesData = marketplaceData?.marketplaceDetails?.sellingInformation?.sales || {}
  const salesStatusesData = marketplaceData?.marketplaceDetails?.sellingInformation?.salesStatuses || {}
  const purchaseTypesdata = marketplaceData?.marketplaceDetails?.sellingInformation?.purchaseTypes || {}

  // Iterate over marketplace listings
  if (marketplaceData?.marketplaceDetails?.information?.listings && Object.keys(marketplaceData.marketplaceDetails.information.listings).length > 0) {
    Object.values(marketplaceData.marketplaceDetails.information.listings).forEach((listing) => {
      const salesInfo = salesData[listing.uuid] || {} // Default to empty object if no sales data
      const salesStatusInfo = salesStatusesData[listing.uuid] || {} // Default to empty object if no sales data
      const purchaseType = purchaseTypesdata[salesInfo.purchaseTypeId] || 'Unknown'

      // Construct full URLs for images
      const images = listing.images
        ?.map((imageUuid) => {
          const attachment = marketplaceData.marketplaceDetails.attachments[imageUuid]
          return attachment
            ? {
                url: `${attachment.basePath}${attachment.versionAndPublicId}`,
                alt: attachment.label // Alt text fallback
              }
            : null
        })
        .filter(Boolean)

      const firstImage = images && images.length > 0 ? images[0] : null

      const nodeData = {
        ...listing,
        ...salesInfo,
        ...salesStatusInfo,
        id: createNodeId(listing.uuid),
        internal: {
          type: `BidJsMarketplace`,
          contentDigest: createContentDigest(listing)
        },
        parent: null,
        title: listing.title,
        description: listing.summary || '',
        price: salesInfo.buyNowValue || 'N/A', // Example; replace with relevant pricing field
        firstImage,
        images,
        bidJSPath: `/auction/#!/marketplace/items/${listing.uuid}`,
        path: (safePath = listing.title
          ?.toLowerCase()
          ?.replace(/[^a-z0-9\s-]/g, '')
          ?.replace(/\s+/g, '-')
          .replace(/-+/g, '-')),
        auctionUuid: listing.auctionUuid,
        location: listing.address?.address || 'Unknown',
        category: listing.categoryUuid || 'Uncategorized',
        lotNumber: listing.lotNumber || '',
        purchaseType
      }
      createNode(nodeData)
    })
  } else {
    console.warn('No BidJS Marketplace Items Found - CREATING A NODE')
    const nodeData = {
      id: createNodeId('empty-bidjs-auction'),
      parent: null,
      children: [],
      internal: {
        type: `BidJsMarketplace`,
        contentDigest: createContentDigest({ empty: true })
      },
      title: null,
      description: null,
      summary: null,
      auctionUuid: null,
      firstImage: {
        alt: null,
        url: null
      },
      images: [
        {
          alt: null,
          url: null
        }
      ],
      path: null,
      featured: false,
      uuid: null
    }
    console.log(nodeData)
    createNode(nodeData)
  }
}

console.timeEnd('Create BidJS GraphQL')

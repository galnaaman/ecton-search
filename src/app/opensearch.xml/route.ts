import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { protocol, host } = new URL(request.url)
  const baseUrl = `${protocol}//${host}`

  const opensearchXml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/" xmlns:moz="http://www.mozilla.org/2006/browser/search/">
  <ShortName>Ecton Search</ShortName>
  <Description>Ecton Internal Network Search Engine - Search company resources, documents, and systems</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="16" height="16" type="image/x-icon">${baseUrl}/favicon.ico</Image>
  <Url type="text/html" method="get" template="${baseUrl}/api/opensearch/search?q={searchTerms}"/>
  <Url type="application/x-suggestions+json" method="get" template="${baseUrl}/api/opensearch/suggestions?q={searchTerms}"/>
  <moz:SearchForm>${baseUrl}/</moz:SearchForm>
  <Developer>Ecton Internal Team</Developer>
  <Contact>admin@internal.company.com</Contact>
  <Tags>internal company search network resources</Tags>
  <Language>en-us</Language>
  <OutputEncoding>UTF-8</OutputEncoding>
  <SyndicationRight>private</SyndicationRight>
  <AdultContent>false</AdultContent>
</OpenSearchDescription>`

  return new NextResponse(opensearchXml, {
    headers: {
      'Content-Type': 'application/opensearchdescription+xml',
      'Cache-Control': 'public, max-age=86400',
    }
  })
} 
'use server'

export type GetBooksError = { message: string }
export type GetBooksResult = {
  queries: string[]
  errors?: string[]
  data?: Book[]
}

export async function getBooks(
  _: GetBooksError | GetBooksResult,
  formData: FormData
): Promise<GetBooksError | GetBooksResult> {
  const queriesStr = formData.get('books')

  if (typeof queriesStr !== 'string') {
    return { message: 'Please enter some book titles to generate stickers for' }
  }

  const queries = queriesStr
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  if (queries.length === 0) {
    return { message: 'Please enter some book titles to generate stickers for' }
  }

  if (queries.length > 49) {
    return { message: '49 per page please' }
  }

  const results: (BookDetailsResponse | BookDetailsError)[] = []
  for (const query of queries) {
    results.push(await getBookDetails(query))
  }

  const errors = results.filter((r): r is BookDetailsError => 'error' in r).map(r => r.error)
  const books = results.filter((r): r is BookDetailsResponse => 'data' in r).map(r => r.data)

  return {
    queries,
    ...(errors.length > 0 && { errors }),
    ...(books.length > 0 && { data: books }),
  }
}

type BookSearchResponse = {
  totalItems: number
  items?: {
    kind: string
    selfLink: string
    volumeInfo: {
      title: string
      authors: string[]
      industryIdentifiers: [
        {
          type: 'ISBN_13' | 'ISBN_10'
          identifier: string
        },
      ]
      imageLinks?: {
        smallThumbnail: string
        thumbnail: string
        small?: string
        medium?: string
        large?: string
        extraLarge?: string
      }
    }
  }[]
}

type BookDetailsError = { error: string }
export type Book = { title: string; authors: string[]; coverImage: string }
type BookDetailsResponse = { data: Book }

async function getBookDetails(query: string): Promise<BookDetailsResponse | BookDetailsError> {
  const url = new URL('https://www.googleapis.com/books/v1/volumes')
  url.searchParams.set('q', query)
  url.searchParams.set('langRestrict', 'en')
  url.searchParams.set('printType', 'books')
  url.searchParams.set('key', '---ELIDED---')

  const res = await fetch(url)
  if (!res.ok) {
    const errorText = await res.text()

    return {
      error: `There was an error fetching the results for ${query}: ${errorText}`,
    }
  }

  const searchResponse = (await res.json()) as BookSearchResponse

  // Find the first item with images
  const volumes = searchResponse.items?.filter(w => w.kind === 'books#volume' && w.volumeInfo.imageLinks)
  const work = volumes?.find(w => query.toLowerCase().includes(w.volumeInfo.title.toLowerCase())) ?? volumes?.at(0)

  if (!work) {
    return {
      error: `No results found for ${query}`,
    }
  }

  const volumeURL = new URL(work.selfLink)
  volumeURL.searchParams.set('key', '---ELIDED---')

  const volumeRes = await fetch(volumeURL)
  if (!volumeRes.ok) {
    const errorText = await volumeRes.text()

    return {
      error: `There was an error fetching the volume info for ${work.volumeInfo.title} - ${work.volumeInfo.authors.join(
        ', '
      )}: ${errorText}`,
    }
  }

  const volumeResponse = (await volumeRes.json()) as Required<BookSearchResponse>['items'][number]

  const imageUrl =
    volumeResponse.volumeInfo.imageLinks?.thumbnail ??
    volumeResponse.volumeInfo.imageLinks?.smallThumbnail ??
    volumeResponse.volumeInfo.imageLinks?.medium ??
    volumeResponse.volumeInfo.imageLinks?.small ??
    volumeResponse.volumeInfo.imageLinks?.large ??
    volumeResponse.volumeInfo.imageLinks?.extraLarge

  if (!imageUrl) {
    return {
      error: `No cover image found for ${volumeResponse.volumeInfo.title} - ${volumeResponse.volumeInfo.authors.join(
        ', '
      )}`,
    }
  }

  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) {
    const errorText = await imageResponse.text()

    return {
      error: `There was an error fetching the image from ${imageUrl}: ${errorText}`,
    }
  }

  const buffer = await imageResponse.arrayBuffer()
  const contentType = imageResponse.headers.get('content-type')

  const coverImage = `data:${contentType ?? 'image/jpeg'};base64,${Buffer.from(buffer).toString('base64')}`

  return {
    data: {
      title: volumeResponse.volumeInfo.title,
      authors: volumeResponse.volumeInfo.authors,
      coverImage,
    },
  }
}

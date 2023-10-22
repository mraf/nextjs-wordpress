import getAllBooks from '@/lib/api/queries/getAllBooks'
import getBookBySlug from '@/lib/api/queries/getBookBySlug'
import {Metadata} from 'next'
import {notFound} from 'next/navigation'

export const dynamicParams = true
export const revalidate = 60

/**
 * Generate the static routes at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  // Get a list of all books.
  const books = await getAllBooks()

  // No books? Bail...
  if (!books) {
    return []
  }

  // Return the slugs for each book.
  return books.map((book: {slug: string}) => ({
    slug: book.slug
  }))
}

/**
 * Generate the metadata for each static route at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata({
  params
}: {
  params: {slug: string}
}): Promise<Metadata | null> {
  // Get the page.
  const book = await getBookBySlug(params.slug)

  // No post? Bail...
  if (!book) {
    return {}
  }

  return {
    title: book.seo.title,
    description: book.seo.metaDesc
  }
}

/**
 * A single book route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Page({params}: {params: {slug: string}}) {
  // Fetch a single page from WordPress.
  const book = await getBookBySlug(params.slug)

  // No post? Bail...
  if (!book) {
    notFound()
  }

  return (
    <main className="flex flex-col gap-8">
      <article className="w-full">
        <h1 dangerouslySetInnerHTML={{__html: book.title}} />
        <div dangerouslySetInnerHTML={{__html: book.content}} />
      </article>
    </main>
  )
}

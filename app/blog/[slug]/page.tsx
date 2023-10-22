import CommentForm from '@/components/CommentForm'
import getAllPosts from '@/lib/api/queries/getAllPosts'
import getPostBySlug from '@/lib/api/queries/getPostBySlug'
import {Metadata} from 'next'
import Image from 'next/image'
import {notFound} from 'next/navigation'

export const dynamicParams = true
export const revalidate = 60

/**
 * Generate the static routes at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  // Get all blog posts.
  const posts = await getAllPosts()

  // No posts? Bail...
  if (!posts) {
    return []
  }

  // Return the slugs for each post.
  return posts.map((post: {slug: string}) => ({
    slug: post.slug
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
  // Get the blog post.
  const post = await getPostBySlug(params.slug)

  // No post? Bail...
  if (!post) {
    return {}
  }

  return {
    title: post.seo.title,
    description: post.seo.metaDesc
  }
}

/**
 * The blog post route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Page({params}: {params: {slug: string}}) {
  // Fetch a single post from WordPress.
  const post = await getPostBySlug(params.slug)

  // No post? Bail...
  if (!post) {
    notFound()
  }

  return (
    <article>
      <header>
        <h2 dangerouslySetInnerHTML={{__html: post.title}} />
        <p className="italic">
          By {post.author.node.name} on <time>{post.date}</time>
        </p>
      </header>
      <div dangerouslySetInnerHTML={{__html: post.content}} />
      <footer className="flex items-center justify-between gap-4 pb-4">
        <div>
          <h3>Categories</h3>
          <ul className="m-0 flex list-none gap-2 p-0">
            {post.categories.nodes.map((category) => (
              <li className="m-0 p-0" key={category.databaseId}>
                {category.name}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Tags</h3>
          <ul className="m-0 flex list-none gap-2 p-0">
            {post.tags.nodes.map((tag) => (
              <li className="m-0 p-0" key={tag.databaseId}>
                {tag.name}
              </li>
            ))}
          </ul>
        </div>
      </footer>
      <section className="border-t-2">
        <h3>Comments</h3>
        {post.comments.nodes.map((comment) => (
          <article key={comment.databaseId}>
            <header className="flex items-center gap-2">
              <Image
                alt={comment.author.node.name}
                className="m-0 rounded-full"
                height={64}
                src={comment.author.node.gravatarUrl}
                width={64}
              />
              <div className="flex flex-col gap-2">
                <h4
                  className="m-0 p-0 leading-none"
                  dangerouslySetInnerHTML={{__html: comment.author.node.name}}
                />
                <time className="italic">{comment.date}</time>
              </div>
            </header>

            <div dangerouslySetInnerHTML={{__html: comment.content}} />
          </article>
        ))}
      </section>
      <CommentForm postID={post.databaseId} />
    </article>
  )
}

import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { Section, Reveal } from '@/components/ui/Section';
import { useBlogPosts } from '@/lib/queries';
import { formatDate } from '@/lib/format';

export function BlogListPage() {
  const { data: posts } = useBlogPosts();

  return (
    <>
      <div className="bg-ink-900 text-white py-16 lg:py-20">
        <div className="container-x">
          <span className="section-eyebrow text-gold">Journal</span>
          <h1 className="font-heading text-4xl lg:text-display-md font-semibold text-white mt-3">
            Recipes, tips & stories
          </h1>
          <p className="mt-3 text-cream-200 text-lg max-w-2xl">
            Baking tips, festive inspiration and behind-the-scenes from the Milano Foods kitchen.
          </p>
        </div>
      </div>

      <Section className="bg-cream">
        <div className="container-x">
          {posts && posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <Reveal key={post.id} delay={i * 0.06}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group card overflow-hidden h-full flex flex-col hover:shadow-lift hover:-translate-y-1 transition-all"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-cream-200">
                      {post.cover_image && (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      {post.category && (
                        <span className="absolute top-3 left-3 chip bg-white/90 backdrop-blur text-ink-800">
                          {post.category}
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-3 text-xs text-muted">
                        {post.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> {formatDate(post.published_at)}
                          </span>
                        )}
                        {post.author && (
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" /> {post.author}
                          </span>
                        )}
                      </div>
                      <h2 className="font-heading text-lg font-semibold text-ink-900 mt-3 group-hover:text-primary transition-colors leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-sm text-ink-500 mt-2 line-clamp-3 flex-1">{post.excerpt}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        Read more <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="font-heading text-xl font-semibold text-ink-900">No articles yet</h3>
              <p className="text-muted mt-2 text-sm">Check back soon for baking tips and recipes.</p>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}

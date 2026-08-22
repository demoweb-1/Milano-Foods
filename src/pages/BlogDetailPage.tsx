import { Link, useParams, Navigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import { Section, Reveal } from '@/components/ui/Section';
import { useBlogPost, useBlogPosts } from '@/lib/queries';
import { formatDate } from '@/lib/format';

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useBlogPost(slug ?? '');
  const { data: allPosts } = useBlogPosts();

  if (!isLoading && !post) {
    return <Navigate to="/404" replace />;
  }

  if (isLoading || !post) {
    return (
      <div className="container-x py-20">
        <div className="max-w-3xl mx-auto">
          <div className="skeleton h-6 w-32 rounded-full mb-4" />
          <div className="skeleton h-12 w-full rounded-xl mb-4" />
          <div className="skeleton aspect-[16/9] rounded-2xl mb-6" />
          <div className="skeleton h-4 w-full mb-3" />
          <div className="skeleton h-4 w-full mb-3" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      </div>
    );
  }

  const related = allPosts?.filter((p) => p.id !== post.id).slice(0, 3) ?? [];
  const paragraphs = post.content?.split('\n\n') ?? [];

  return (
    <>
      {/* Hero */}
      <div className="relative bg-ink-900 text-white py-16 lg:py-20 overflow-hidden">
        {post.cover_image && (
          <div className="absolute inset-0">
            <img src={post.cover_image} alt={post.title} className="h-full w-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/80 to-ink-900/60" />
          </div>
        )}
        <div className="container-x relative">
          <div className="max-w-3xl">
            <Link to="/blog" className="inline-flex items-center gap-2 text-cream-300 hover:text-white transition-colors text-sm mb-4">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Link>
            {post.category && (
              <span className="chip bg-primary/20 text-gold border border-gold/30 mb-4">{post.category}</span>
            )}
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mt-2 text-balance">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 mt-5 text-cream-300 text-sm">
              {post.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {formatDate(post.published_at)}
                </span>
              )}
              {post.author && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" /> {post.author}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <Section className="bg-cream">
        <div className="container-x max-w-3xl">
          {post.excerpt && (
            <p className="font-heading text-xl text-ink-700 leading-relaxed mb-8 italic border-l-4 border-primary pl-6">
              {post.excerpt}
            </p>
          )}
          <article className="prose-milano">
            {paragraphs.map((para, i) => {
              const trimmed = para.trim();
              if (!trimmed) return null;
              if (trimmed.startsWith('## ')) {
                return <h2 key={i}>{trimmed.slice(3)}</h2>;
              }
              if (trimmed.startsWith('### ')) {
                return <h3 key={i}>{trimmed.slice(4)}</h3>;
              }
              if (trimmed.startsWith('- ') || trimmed.startsWith('1. ')) {
                const items = trimmed.split('\n').map((line) => line.replace(/^[-\d.]+\s*/, ''));
                const isOrdered = trimmed.startsWith('1.');
                return isOrdered ? (
                  <ol key={i}>{items.map((item, j) => <li key={j}>{item}</li>)}</ol>
                ) : (
                  <ul key={i}>{items.map((item, j) => <li key={j}>{item}</li>)}</ul>
                );
              }
              if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                return <p key={i}><strong>{trimmed.slice(2, -2)}</strong></p>;
              }
              // Inline bold
              const html = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
              return <p key={i} dangerouslySetInnerHTML={{ __html: html }} />;
            })}
          </article>

          {post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-cream-300">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-muted" />
                {post.tags.map((tag) => (
                  <span key={tag} className="chip bg-cream-200 text-ink-600">#{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Related */}
      {related.length > 0 && (
        <Section className="bg-white py-14">
          <div className="container-x">
            <h2 className="font-heading text-2xl font-semibold text-ink-900 mb-8">Keep reading</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((rp, i) => (
                <Reveal key={rp.id} delay={i * 0.06}>
                  <Link
                    to={`/blog/${rp.slug}`}
                    className="group card overflow-hidden h-full flex flex-col hover:shadow-lift hover:-translate-y-1 transition-all"
                  >
                    {rp.cover_image && (
                      <div className="aspect-[16/10] overflow-hidden bg-cream-200">
                        <img
                          src={rp.cover_image}
                          alt={rp.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-heading text-base font-semibold text-ink-900 group-hover:text-primary transition-colors leading-snug">
                        {rp.title}
                      </h3>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        Read <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>
      )}
    </>
  );
}

import { Heart, MessageCircle, Share2, Eye, FileText, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLATFORM_META = {
  instagram: { label: 'Instagram', chip: 'bg-pink-50 text-pink-600' },
  twitter: { label: 'Twitter', chip: 'bg-sky-50 text-sky-600' },
  linkedin: { label: 'LinkedIn', chip: 'bg-blue-50 text-blue-700' },
  facebook: { label: 'Facebook', chip: 'bg-indigo-50 text-indigo-600' },
};

function formatCount(value) {
  const num = Number(value) || 0;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(num);
}

function formatDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function PostRow({ post }) {
  const meta = PLATFORM_META[post.platform] || {
    label: post.platform || 'Platform',
    chip: 'bg-slate-100 text-slate-600',
  };
  const caption = (post.caption || '').trim();
  const engagement = Number(post.engagementRate) || 0;

  return (
    <li className="flex items-center gap-3.5 rounded-xl border border-transparent p-2.5 transition-colors hover:border-app-border hover:bg-slate-50">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-app-border bg-slate-100">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.visibility = 'hidden';
            }}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-slate-300">
            <FileText size={20} />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.chip}`}
          >
            {meta.label}
          </span>
          <span className="text-[11px] text-slate-400">{formatDate(post.postDate)}</span>
        </div>

        <p className="mt-1 truncate text-sm font-medium text-slate-800">
          {caption || 'Untitled post'}
        </p>

        <div className="mt-1 flex items-center gap-3 text-[11px] font-medium text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Heart size={12} className="text-rose-400" /> {formatCount(post.likes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle size={12} className="text-sky-400" /> {formatCount(post.comments)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Share2 size={12} className="text-violet-400" /> {formatCount(post.shares)}
          </span>
          {post.views > 0 && (
            <span className="inline-flex items-center gap-1">
              <Eye size={12} className="text-slate-400" /> {formatCount(post.views)}
            </span>
          )}
        </div>
      </div>

      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-base font-extrabold tabular-nums text-slate-900">{engagement}%</p>
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Engagement</p>
      </div>
    </li>
  );
}

export default function TopPostsCard({ posts, onAddCompetitor }) {
  const hasPosts = Array.isArray(posts) && posts.length > 0;

  return (
    <section className="glass-card flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Top Performing Posts</h2>
          <p className="mt-0.5 text-sm text-slate-500">Ranked by engagement rate</p>
        </div>
        <Link
          to="/insights"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-violet-600 transition-colors hover:bg-violet-50"
        >
          View All <ArrowRight size={13} />
        </Link>
      </div>

      {hasPosts ? (
        <ul className="mt-4 flex-1 space-y-1">
          {posts.map((post, i) => (
            <PostRow key={post._id || `${post.competitorId}-${post.postUrl || i}`} post={post} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
            <FileText size={28} />
          </span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            Add competitors and analyze their posts to see engagement data.
          </p>
          <button
            onClick={onAddCompetitor}
            className="gradient-brand mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <Plus size={16} /> Add Competitor
          </button>
        </div>
      )}
    </section>
  );
}

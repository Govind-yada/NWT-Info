import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ExternalLink, Sparkles, Filter, Layers } from 'lucide-react';

export const PortfolioPage = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Website Development', 'Software Development', 'Mobile App Development', 'Branding & Campaign Management'];

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await api.get('/content/portfolios');
        if (res.data.success) {
          setPortfolios(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching portfolios:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const filteredItems = category === 'All'
    ? portfolios
    : portfolios.filter((p) => p.category === category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold text-brand-electric">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Case Studies & Client Deliverables</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Our Work & Client Portfolio
        </h1>
        <p className="text-sm text-slate-300">
          Explore real-world web apps, SaaS dashboards, and high-performance software delivered by the Next World Tech engineering team.
        </p>

        {/* Categories */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                category === cat
                  ? 'bg-brand-blue text-white shadow-glow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredItems.map((item) => (
            <div key={item._id} className="group glass-card rounded-2xl overflow-hidden hover:shadow-glow transition flex flex-col justify-between">
              <div>
                <div className="relative h-64 overflow-hidden bg-slate-900">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent"></div>
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-navy-950/80 backdrop-blur-md border border-slate-700 text-[11px] font-semibold text-brand-electric">
                    {item.category}
                  </div>
                </div>

                <div className="p-6">
                  <span className="text-[11px] text-slate-400 font-medium block mb-1">{item.clientName}</span>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {(item.tags || []).map((tag, tIdx) => (
                    <span key={tIdx} className="px-2.5 py-1 rounded-md bg-slate-800 text-[10px] text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>

                {item.liveUrl && (
                  <a
                    href={item.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-electric hover:underline ml-4"
                  >
                    <span>View Project</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-navy-900/40 rounded-2xl border border-slate-800">
          <Layers className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-white">No items found in this category</h4>
        </div>
      )}

    </div>
  );
};

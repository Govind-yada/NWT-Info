import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FileEdit,
  Plus,
  Trash2,
  Edit2,
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Layers,
  HelpCircle,
  MessageSquareQuote,
} from 'lucide-react';

export const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' | 'testimonials' | 'faqs'

  const [portfolios, setPortfolios] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Portfolio modal
  const [portModal, setPortModal] = useState(false);
  const [portEditing, setPortEditing] = useState(null);
  const [portForm, setPortForm] = useState({
    title: '',
    category: 'Website Development',
    clientName: '',
    description: '',
    thumbnail: '',
    liveUrl: '',
    tags: '',
  });

  // Testimonial modal
  const [testModal, setTestModal] = useState(false);
  const [testEditing, setTestEditing] = useState(null);
  const [testForm, setTestForm] = useState({
    clientName: '',
    clientRole: 'CEO',
    clientCompany: '',
    rating: 5,
    review: '',
    serviceProvided: 'Website Development',
  });

  // FAQ modal
  const [faqModal, setFaqModal] = useState(false);
  const [faqEditing, setFaqEditing] = useState(null);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'General',
  });

  const fetchContent = async () => {
    try {
      const [portRes, testRes, faqRes] = await Promise.all([
        api.get('/content/portfolios'),
        api.get('/content/testimonials'),
        api.get('/content/faqs'),
      ]);

      if (portRes.data.success) setPortfolios(portRes.data.data);
      if (testRes.data.success) setTestimonials(testRes.data.data);
      if (faqRes.data.success) setFaqs(faqRes.data.data);
    } catch (err) {
      console.error('Error fetching CMS content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Portfolio Handlers
  const openPortCreate = () => {
    setPortEditing(null);
    setPortForm({
      title: '',
      category: 'Website Development',
      clientName: '',
      description: '',
      thumbnail: '',
      liveUrl: '',
      tags: '',
    });
    setPortModal(true);
  };

  const handlePortSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...portForm,
        tags: portForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (portEditing) {
        await api.put(`/admin/portfolios/${portEditing._id}`, payload);
      } else {
        await api.post('/admin/portfolios', payload);
      }
      setPortModal(false);
      await fetchContent();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving portfolio');
    }
  };

  const deletePort = async (id) => {
    if (window.confirm('Delete this portfolio item?')) {
      await api.delete(`/admin/portfolios/${id}`);
      await fetchContent();
    }
  };

  // Testimonial Handlers
  const openTestCreate = () => {
    setTestEditing(null);
    setTestForm({
      clientName: '',
      clientRole: 'Founder & CEO',
      clientCompany: '',
      rating: 5,
      review: '',
      serviceProvided: 'Website Development',
    });
    setTestModal(true);
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    try {
      if (testEditing) {
        await api.put(`/admin/testimonials/${testEditing._id}`, testForm);
      } else {
        await api.post('/admin/testimonials', testForm);
      }
      setTestModal(false);
      await fetchContent();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving testimonial');
    }
  };

  const deleteTest = async (id) => {
    if (window.confirm('Delete this testimonial?')) {
      await api.delete(`/admin/testimonials/${id}`);
      await fetchContent();
    }
  };

  // FAQ Handlers
  const openFaqCreate = () => {
    setFaqEditing(null);
    setFaqForm({
      question: '',
      answer: '',
      category: 'General',
    });
    setFaqModal(true);
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    try {
      if (faqEditing) {
        await api.put(`/admin/faqs/${faqEditing._id}`, faqForm);
      } else {
        await api.post('/admin/faqs', faqForm);
      }
      setFaqModal(false);
      await fetchContent();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving FAQ');
    }
  };

  const deleteFaq = async (id) => {
    if (window.confirm('Delete this FAQ?')) {
      await api.delete(`/admin/faqs/${id}`);
      await fetchContent();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Website Content Management System (CMS)</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage dynamic portfolio case studies, customer feedback testimonials, and client FAQs
        </p>
      </div>

      {/* CMS Tabs */}
      <div className="p-1 rounded-2xl bg-navy-900 border border-slate-800 flex gap-2 max-w-md">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'portfolio' ? 'bg-violet-600 text-white shadow-glow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Portfolio ({portfolios.length})
        </button>

        <button
          onClick={() => setActiveTab('testimonials')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'testimonials' ? 'bg-violet-600 text-white shadow-glow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquareQuote className="w-3.5 h-3.5" /> Reviews ({testimonials.length})
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'faqs' ? 'bg-violet-600 text-white shadow-glow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" /> FAQs ({faqs.length})
        </button>
      </div>

      {/* PORTFOLIO TAB */}
      {activeTab === 'portfolio' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white">Portfolio Showcase Gallery</h3>
            <button
              onClick={openPortCreate}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition"
            >
              <Plus className="w-4 h-4" /> Add Project Case Study
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((p) => (
              <div key={p._id} className="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="h-44 bg-slate-900 overflow-hidden relative">
                    <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover opacity-80" />
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-navy-950/80 border border-slate-700 text-[10px] text-brand-electric font-semibold">
                      {p.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <span className="text-[10px] text-slate-400">{p.clientName}</span>
                    <h4 className="text-sm font-bold text-white">{p.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-800/60 flex justify-between items-center mt-3">
                  <span className="text-[10px] text-slate-500">{(p.tags || []).join(', ')}</span>
                  <div className="space-x-2">
                    <button onClick={() => deletePort(p._id)} className="p-1 text-slate-400 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TESTIMONIALS TAB */}
      {activeTab === 'testimonials' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white">Client Reviews & Testimonials</h3>
            <button
              onClick={openTestCreate}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition"
            >
              <Plus className="w-4 h-4" /> Add Client Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t._id} className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 italic">"{t.review}"</p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-4">
                  <div>
                    <span className="text-xs font-bold text-white block">{t.clientName}</span>
                    <span className="text-[10px] text-slate-400">{t.clientRole}, {t.clientCompany}</span>
                  </div>
                  <button onClick={() => deleteTest(t._id)} className="p-1 text-slate-400 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQS TAB */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white">Frequently Asked Questions</h3>
            <button
              onClick={openFaqCreate}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition"
            >
              <Plus className="w-4 h-4" /> Create FAQ Entry
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f._id} className="p-4 rounded-2xl bg-navy-950 border border-slate-800 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-brand-electric uppercase">{f.category}</span>
                  <h4 className="text-sm font-bold text-white">{f.question}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">{f.answer}</p>
                </div>
                <button onClick={() => deleteFaq(f._id)} className="p-1 text-slate-400 hover:text-rose-400 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Add Modal */}
      {portModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg bg-navy-900 border border-slate-800 rounded-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Portfolio Case Study</h3>
              <button onClick={() => setPortModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handlePortSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Project Title *</label>
                <input type="text" required value={portForm.title} onChange={(e) => setPortForm({ ...portForm, title: e.target.value })} className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Category *</label>
                  <select value={portForm.category} onChange={(e) => setPortForm({ ...portForm, category: e.target.value })} className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white">
                    <option value="Website Development">Website Development</option>
                    <option value="Software Development">Software Development</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                    <option value="SEO / SMO">SEO / SMO</option>
                    <option value="Branding & Campaign Management">Branding & Campaigns</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Client Name *</label>
                  <input type="text" required value={portForm.clientName} onChange={(e) => setPortForm({ ...portForm, clientName: e.target.value })} className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Thumbnail Image URL *</label>
                <input type="text" required value={portForm.thumbnail} onChange={(e) => setPortForm({ ...portForm, thumbnail: e.target.value })} className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Description *</label>
                <textarea rows={2} required value={portForm.description} onChange={(e) => setPortForm({ ...portForm, description: e.target.value })} className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white"></textarea>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Tags (comma separated)</label>
                <input type="text" value={portForm.tags} onChange={(e) => setPortForm({ ...portForm, tags: e.target.value })} placeholder="React, Node.js, Razorpay" className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setPortModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-violet-600 text-white font-bold">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Add Modal */}
      {testModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-navy-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Client Review</h3>
              <button onClick={() => setTestModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleTestSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Client Full Name *</label>
                <input type="text" required value={testForm.clientName} onChange={(e) => setTestForm({ ...testForm, clientName: e.target.value })} className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Role / Designation</label>
                  <input type="text" value={testForm.clientRole} onChange={(e) => setTestForm({ ...testForm, clientRole: e.target.value })} className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Company *</label>
                  <input type="text" required value={testForm.clientCompany} onChange={(e) => setTestForm({ ...testForm, clientCompany: e.target.value })} className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Review Text *</label>
                <textarea rows={3} required value={testForm.review} onChange={(e) => setTestForm({ ...testForm, review: e.target.value })} className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white"></textarea>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setTestModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-violet-600 text-white font-bold">Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Add Modal */}
      {faqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-navy-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add FAQ Question</h3>
              <button onClick={() => setFaqModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleFaqSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Question *</label>
                <input type="text" required value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Answer *</label>
                <textarea rows={3} required value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white"></textarea>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setFaqModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-violet-600 text-white font-bold">Save FAQ</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

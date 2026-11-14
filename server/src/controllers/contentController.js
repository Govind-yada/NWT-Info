import Portfolio from '../models/Portfolio.js';
import Testimonial from '../models/Testimonial.js';
import FAQ from '../models/FAQ.js';
import { slugify } from '../utils/helpers.js';
import { uploadFile } from '../config/cloudinary.js';

// ==================== PORTFOLIO ====================

export const getPortfolios = async (req, res, next) => {
  try {
    const { category, featured } = req.query;
    let query = {};
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;

    const items = await Portfolio.find(query).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

export const createPortfolio = async (req, res, next) => {
  try {
    let { title, category, clientName, description, liveUrl, tags, completionDate, isFeatured, order, thumbnail } = req.body;

    if (!title || !category || !clientName || !description) {
      return res.status(400).json({ success: false, message: 'Please provide all required portfolio fields' });
    }

    if (req.file) {
      const uploadResult = await uploadFile(req.file.path, 'nwt-portfolio');
      thumbnail = uploadResult.url;
    }

    let parsedTags = [];
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    } else if (Array.isArray(tags)) {
      parsedTags = tags;
    }

    const item = await Portfolio.create({
      title,
      slug: slugify(title),
      category,
      clientName,
      description,
      thumbnail: thumbnail || '',
      liveUrl: liveUrl || '',
      tags: parsedTags,
      completionDate: completionDate || '2026',
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : true,
      order: order ? Number(order) : 0,
    });

    res.status(201).json({ success: true, message: 'Portfolio item created', data: item });
  } catch (error) {
    next(error);
  }
};

export const updatePortfolio = async (req, res, next) => {
  try {
    const item = await Portfolio.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Portfolio not found' });

    let { title, category, clientName, description, liveUrl, tags, completionDate, isFeatured, order, thumbnail } = req.body;

    if (title) {
      item.title = title;
      item.slug = slugify(title);
    }
    if (category) item.category = category;
    if (clientName) item.clientName = clientName;
    if (description) item.description = description;
    if (liveUrl !== undefined) item.liveUrl = liveUrl;
    if (completionDate) item.completionDate = completionDate;
    if (isFeatured !== undefined) item.isFeatured = Boolean(isFeatured);
    if (order !== undefined) item.order = Number(order);

    if (req.file) {
      const uploadResult = await uploadFile(req.file.path, 'nwt-portfolio');
      item.thumbnail = uploadResult.url;
    } else if (thumbnail) {
      item.thumbnail = thumbnail;
    }

    if (tags !== undefined) {
      if (typeof tags === 'string') {
        try {
          item.tags = JSON.parse(tags);
        } catch (e) {
          item.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
        }
      } else if (Array.isArray(tags)) {
        item.tags = tags;
      }
    }

    await item.save();
    res.status(200).json({ success: true, message: 'Portfolio updated', data: item });
  } catch (error) {
    next(error);
  }
};

export const deletePortfolio = async (req, res, next) => {
  try {
    const item = await Portfolio.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Portfolio not found' });
    await item.deleteOne();
    res.status(200).json({ success: true, message: 'Portfolio item deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== TESTIMONIALS ====================

export const getTestimonials = async (req, res, next) => {
  try {
    const items = await Testimonial.find({ isFeatured: true }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

export const createTestimonial = async (req, res, next) => {
  try {
    const { clientName, clientRole, clientCompany, avatar, rating, review, serviceProvided, isFeatured, order } = req.body;

    if (!clientName || !clientCompany || !review) {
      return res.status(400).json({ success: false, message: 'Client name, company, and review are required' });
    }

    const item = await Testimonial.create({
      clientName,
      clientRole: clientRole || 'Business Owner',
      clientCompany,
      avatar: avatar || '',
      rating: rating ? Number(rating) : 5,
      review,
      serviceProvided: serviceProvided || 'Website Development',
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : true,
      order: order ? Number(order) : 0,
    });

    res.status(201).json({ success: true, message: 'Testimonial created', data: item });
  } catch (error) {
    next(error);
  }
};

export const updateTestimonial = async (req, res, next) => {
  try {
    const item = await Testimonial.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Testimonial not found' });

    Object.assign(item, req.body);
    await item.save();

    res.status(200).json({ success: true, message: 'Testimonial updated', data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteTestimonial = async (req, res, next) => {
  try {
    const item = await Testimonial.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    await item.deleteOne();
    res.status(200).json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== FAQS ====================

export const getFAQs = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = { isActive: true };
    if (category) query.category = category;

    const items = await FAQ.find(query).sort({ order: 1, createdAt: 1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

export const createFAQ = async (req, res, next) => {
  try {
    const { question, answer, category, order, isActive } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Question and answer are required' });
    }

    const item = await FAQ.create({
      question,
      answer,
      category: category || 'General',
      order: order ? Number(order) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({ success: true, message: 'FAQ created', data: item });
  } catch (error) {
    next(error);
  }
};

export const updateFAQ = async (req, res, next) => {
  try {
    const item = await FAQ.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'FAQ not found' });

    Object.assign(item, req.body);
    await item.save();

    res.status(200).json({ success: true, message: 'FAQ updated', data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteFAQ = async (req, res, next) => {
  try {
    const item = await FAQ.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'FAQ not found' });
    await item.deleteOne();
    res.status(200).json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    next(error);
  }
};

import Package from '../models/Package.js';
import Service from '../models/Service.js';
import { slugify } from '../utils/helpers.js';

// @desc    Get packages by Service ID or Slug
// @route   GET /api/packages/service/:serviceIdentifier
// @access  Public
export const getPackagesByService = async (req, res, next) => {
  try {
    const { serviceIdentifier } = req.params;
    let service;

    if (serviceIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
      service = await Service.findById(serviceIdentifier);
    } else {
      service = await Service.findOne({ slug: serviceIdentifier });
    }

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const packages = await Package.find({
      serviceId: service._id,
      isActive: true,
    }).sort({ order: 1, price: 1 });

    res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single package details
// @route   GET /api/packages/:id
// @access  Public
export const getPackageById = async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id).populate('serviceId', 'name category slug');
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create package
// @route   POST /api/admin/packages
// @access  Private (Admin)
export const createPackage = async (req, res, next) => {
  try {
    const { serviceId, name, description, price, discountPrice, deliveryEstimate, features, isPopular, isActive, order } = req.body;

    if (!serviceId || !name || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide serviceId, name, description, and price.',
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Associated service does not exist.' });
    }

    let parsedFeatures = [];
    if (typeof features === 'string') {
      try {
        parsedFeatures = JSON.parse(features);
      } catch (e) {
        parsedFeatures = features.split(',').map((f) => f.trim()).filter(Boolean);
      }
    } else if (Array.isArray(features)) {
      parsedFeatures = features;
    }

    const pkg = await Package.create({
      serviceId,
      name,
      slug: slugify(name),
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      deliveryEstimate: deliveryEstimate || '7-10 Business Days',
      features: parsedFeatures,
      isPopular: Boolean(isPopular),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      order: order ? Number(order) : 0,
    });

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update package
// @route   PUT /api/admin/packages/:id
// @access  Private (Admin)
export const updatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, discountPrice, deliveryEstimate, features, isPopular, isActive, order } = req.body;

    const pkg = await Package.findById(id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    if (name) {
      pkg.name = name;
      pkg.slug = slugify(name);
    }
    if (description) pkg.description = description;
    if (price !== undefined) pkg.price = Number(price);
    if (discountPrice !== undefined) pkg.discountPrice = discountPrice ? Number(discountPrice) : null;
    if (deliveryEstimate) pkg.deliveryEstimate = deliveryEstimate;
    if (isPopular !== undefined) pkg.isPopular = Boolean(isPopular);
    if (isActive !== undefined) pkg.isActive = Boolean(isActive);
    if (order !== undefined) pkg.order = Number(order);

    if (features !== undefined) {
      if (typeof features === 'string') {
        try {
          pkg.features = JSON.parse(features);
        } catch (e) {
          pkg.features = features.split(',').map((f) => f.trim()).filter(Boolean);
        }
      } else if (Array.isArray(features)) {
        pkg.features = features;
      }
    }

    await pkg.save();

    res.status(200).json({
      success: true,
      message: 'Package updated successfully',
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete package
// @route   DELETE /api/admin/packages/:id
// @access  Private (Admin)
export const deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pkg = await Package.findById(id);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    await pkg.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

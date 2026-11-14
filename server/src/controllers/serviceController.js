import Service from '../models/Service.js';
import Package from '../models/Package.js';
import { slugify } from '../utils/helpers.js';
import { uploadFile } from '../config/cloudinary.js';

// @desc    Get all active services (with packages count or packages populated)
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const services = await Service.find(query).sort({ order: 1, createdAt: 1 });

    // Fetch packages for all services
    const servicesWithPackages = await Promise.all(
      services.map(async (service) => {
        const packages = await Package.find({
          serviceId: service._id,
          isActive: true,
        }).sort({ order: 1, price: 1 });

        return {
          ...service.toObject(),
          packages,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: servicesWithPackages.length,
      data: servicesWithPackages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service by slug or ID with its packages
// @route   GET /api/services/:identifier
// @access  Public
export const getServiceByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let service;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      service = await Service.findById(identifier);
    } else {
      service = await Service.findOne({ slug: identifier });
    }

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    const packages = await Package.find({
      serviceId: service._id,
      isActive: true,
    }).sort({ order: 1, price: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...service.toObject(),
        packages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all services (including inactive)
// @route   GET /api/admin/services
// @access  Private (Admin)
export const getAdminServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: -1 });

    const servicesWithPackages = await Promise.all(
      services.map(async (service) => {
        const packages = await Package.find({ serviceId: service._id }).sort({ order: 1 });
        return {
          ...service.toObject(),
          packagesCount: packages.length,
          packages,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: servicesWithPackages.length,
      data: servicesWithPackages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create service
// @route   POST /api/admin/services
// @access  Private (Admin)
export const createService = async (req, res, next) => {
  try {
    let { name, category, shortDescription, description, icon, features, startingPrice, order, isActive } = req.body;

    if (!name || !category || !shortDescription || !description || startingPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required service fields.',
      });
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

    let image = req.body.image || '';
    if (req.file) {
      const uploadResult = await uploadFile(req.file.path, 'nwt-services');
      image = uploadResult.url;
    }

    const slug = slugify(name);

    const service = await Service.create({
      name,
      slug,
      category,
      shortDescription,
      description,
      icon: icon || 'Globe',
      image,
      features: parsedFeatures,
      startingPrice: Number(startingPrice),
      order: order ? Number(order) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update service
// @route   PUT /api/admin/services/:id
// @access  Private (Admin)
export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { name, category, shortDescription, description, icon, features, startingPrice, order, isActive, image } = req.body;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (name) {
      service.name = name;
      service.slug = slugify(name);
    }
    if (category) service.category = category;
    if (shortDescription) service.shortDescription = shortDescription;
    if (description) service.description = description;
    if (icon) service.icon = icon;
    if (startingPrice !== undefined) service.startingPrice = Number(startingPrice);
    if (order !== undefined) service.order = Number(order);
    if (isActive !== undefined) service.isActive = Boolean(isActive);

    if (features !== undefined) {
      if (typeof features === 'string') {
        try {
          service.features = JSON.parse(features);
        } catch (e) {
          service.features = features.split(',').map((f) => f.trim()).filter(Boolean);
        }
      } else if (Array.isArray(features)) {
        service.features = features;
      }
    }

    if (req.file) {
      const uploadResult = await uploadFile(req.file.path, 'nwt-services');
      service.image = uploadResult.url;
    } else if (image) {
      service.image = image;
    }

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete service
// @route   DELETE /api/admin/services/:id
// @access  Private (Admin)
export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Delete associated packages
    await Package.deleteMany({ serviceId: id });
    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service and associated packages deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

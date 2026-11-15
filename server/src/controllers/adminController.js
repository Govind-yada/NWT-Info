import os from 'os';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Service from '../models/Service.js';
import Package from '../models/Package.js';
import Booking from '../models/Booking.js';
import Setting from '../models/Setting.js';

// @desc    Get Comprehensive Admin Analytics & Metrics
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin)
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalOrders = await Order.countDocuments();
    const newOrders = await Order.countDocuments({ projectStatus: 'pending' });
    const activeProjects = await Order.countDocuments({
      projectStatus: { $in: ['confirmed', 'in_progress', 'review'] },
    });
    const completedProjects = await Order.countDocuments({ projectStatus: 'completed' });

    // Financial Metrics
    const successfulPayments = await Payment.find({ status: 'success' });
    const totalRevenue = successfulPayments.reduce((acc, curr) => acc + curr.amount, 0);
    const advancePaymentsReceived = successfulPayments
      .filter((p) => p.type === 'advance')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const remainingPaymentsReceived = successfulPayments
      .filter((p) => p.type === 'remaining')
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Calculate pending remaining balances on confirmed/in-progress projects
    const unpaidOrders = await Order.find({ advancePaid: true, remainingPaid: false });
    const pendingRemainingPayments = unpaidOrders.reduce((acc, curr) => acc + curr.remainingAmount, 0);

    // Monthly revenue aggregation for Recharts (last 6 months)
    const monthlyRevenue = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthPayments = await Payment.find({
        status: 'success',
        createdAt: { $gte: start, $lte: end },
      });

      const monthAdvance = monthPayments
        .filter((p) => p.type === 'advance')
        .reduce((sum, p) => sum + p.amount, 0);
      const monthRemaining = monthPayments
        .filter((p) => p.type === 'remaining')
        .reduce((sum, p) => sum + p.amount, 0);

      monthlyRevenue.push({
        month: `${months[d.getMonth()]} ${d.getFullYear()}`,
        total: monthAdvance + monthRemaining,
        advance: monthAdvance,
        remaining: monthRemaining,
      });
    }

    // Project status breakdown for Recharts pie chart
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$projectStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusBreakdown = statusCounts.map((item) => ({
      name: (item._id || 'pending').replace('_', ' ').toUpperCase(),
      value: item.count,
    }));

    // Recent 5 orders
    const recentOrders = await Order.find()
      .populate('serviceId', 'name category')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalOrders,
        newOrders,
        activeProjects,
        completedProjects,
        totalRevenue,
        advancePaymentsReceived,
        remainingPaymentsReceived,
        pendingRemainingPayments,
      },
      charts: {
        monthlyRevenue,
        statusBreakdown,
      },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all registered customers with metrics
// @route   GET /api/admin/customers
// @access  Private (Admin)
export const getAdminCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = { role: 'customer' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await User.find(query).sort({ createdAt: -1 });

    const customersWithData = await Promise.all(
      customers.map(async (cust) => {
        const orders = await Order.find({ userId: cust._id });
        const payments = await Payment.find({ userId: cust._id, status: 'success' });
        const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

        return {
          ...cust.toObject(),
          orderCount: orders.length,
          totalSpent,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: customersWithData.length,
      data: customersWithData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get specific customer details with orders & payments
// @route   GET /api/admin/customers/:id
// @access  Private (Admin)
export const getCustomerDetails = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const orders = await Order.find({ userId: customer._id })
      .populate('serviceId packageId bookingId')
      .sort({ createdAt: -1 });

    const payments = await Payment.find({ userId: customer._id })
      .populate('orderId', 'orderNumber projectTitle')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      customer,
      orders,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Terminal Command Execution Engine
// @route   POST /api/admin/terminal/execute
// @access  Private (Admin)
export const executeTerminalCommand = async (req, res, next) => {
  try {
    const { command = '' } = req.body;
    const trimmed = command.trim();
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0]?.toLowerCase() || '';

    if (!cmd) {
      return res.status(200).json({
        success: true,
        output: {
          type: 'text',
          lines: ['Empty command. Type "help" to see available commands.'],
        },
      });
    }

    // Helper: format uptime
    const formatUptime = (seconds) => {
      const d = Math.floor(seconds / (3600 * 24));
      const h = Math.floor((seconds % (3600 * 24)) / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return `${d > 0 ? d + 'd ' : ''}${h}h ${m}m ${s}s`;
    };

    switch (cmd) {
      case 'help': {
        return res.status(200).json({
          success: true,
          output: {
            type: 'help',
            title: 'NWT INFO ADMIN TERMINAL - COMMAND DIRECTORY',
            commands: [
              { cmd: 'status', desc: 'Display live server health, uptime, memory & environment' },
              { cmd: 'sysinfo', desc: 'Detailed OS hardware, CPU cores, heap memory usage' },
              { cmd: 'db:status', desc: 'MongoDB connection state, host, and collection document counts' },
              { cmd: 'orders:summary', desc: 'Comprehensive order breakdown across all lifecycle stages' },
              { cmd: 'payments:audit', desc: 'Audited financial ledger: volume, 30% advances, balances, gateway split' },
              { cmd: 'users:list', desc: 'Customer & Admin accounts summary and recent registrations' },
              { cmd: 'services:list', desc: 'List active digital services, categories, and tier counts' },
              { cmd: 'upi:config', desc: 'Display live Company UPI ID, Payee, and Payment Gateway toggles' },
              { cmd: 'settings:get', desc: 'Fetch current dynamic platform settings & booking constraints' },
              { cmd: 'clear', desc: 'Clear the terminal output screen' },
            ],
          },
        });
      }

      case 'status':
      case 'ping': {
        const memory = process.memoryUsage();
        return res.status(200).json({
          success: true,
          output: {
            type: 'status',
            data: {
              serverStatus: 'ONLINE / OPERATIONAL',
              nodeVersion: process.version,
              uptime: formatUptime(process.uptime()),
              environment: process.env.NODE_ENV || 'production',
              platform: `${os.type()} (${os.arch()})`,
              hostname: os.hostname(),
              pid: process.pid,
              heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
              heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
              rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
              timestamp: new Date().toISOString(),
            },
          },
        });
      }

      case 'sysinfo': {
        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const usedMem = (totalMem - freeMem).toFixed(2);
        const cpus = os.cpus();

        return res.status(200).json({
          success: true,
          output: {
            type: 'sysinfo',
            data: {
              osType: os.type(),
              osRelease: os.release(),
              architecture: os.arch(),
              cpuModel: cpus[0]?.model || 'Standard CPU',
              cpuCores: cpus.length,
              totalMemory: `${totalMem} GB`,
              freeMemory: `${freeMem} GB`,
              usedMemory: `${usedMem} GB (${Math.round((usedMem / totalMem) * 100)}%)`,
              loadAverage: os.loadavg ? os.loadavg().map((l) => l.toFixed(2)).join(', ') : 'N/A',
            },
          },
        });
      }

      case 'db':
      case 'db:status':
      case 'db:ping': {
        const stateMap = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
        const state = stateMap[mongoose.connection.readyState] || 'Unknown';

        const [users, orders, payments, services, packages, bookings] = await Promise.all([
          User.countDocuments(),
          Order.countDocuments(),
          Payment.countDocuments(),
          Service.countDocuments(),
          Package.countDocuments(),
          Booking.countDocuments(),
        ]);

        return res.status(200).json({
          success: true,
          output: {
            type: 'db',
            data: {
              status: state,
              databaseName: mongoose.connection.name || 'nwt-info',
              host: mongoose.connection.host || 'MongoDB Atlas / Local',
              port: mongoose.connection.port || 27017,
              collections: {
                users,
                orders,
                payments,
                services,
                packages,
                bookings,
              },
            },
          },
        });
      }

      case 'orders':
      case 'orders:summary': {
        const [
          total,
          pending,
          confirmed,
          inProgress,
          review,
          completed,
          cancelled,
          recentList,
        ] = await Promise.all([
          Order.countDocuments(),
          Order.countDocuments({ projectStatus: 'pending' }),
          Order.countDocuments({ projectStatus: 'confirmed' }),
          Order.countDocuments({ projectStatus: 'in_progress' }),
          Order.countDocuments({ projectStatus: 'review' }),
          Order.countDocuments({ projectStatus: 'completed' }),
          Order.countDocuments({ projectStatus: 'cancelled' }),
          Order.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('orderNumber projectTitle totalAmount paymentStatus projectStatus createdAt'),
        ]);

        return res.status(200).json({
          success: true,
          output: {
            type: 'orders',
            data: {
              total,
              breakdown: {
                pending,
                confirmed,
                inProgress,
                review,
                completed,
                cancelled,
              },
              recent: recentList.map((o) => ({
                orderNumber: o.orderNumber,
                title: o.projectTitle,
                client: o.userId?.name || 'Guest Client',
                amount: `₹${o.totalAmount.toLocaleString('en-IN')}`,
                paymentStatus: o.paymentStatus,
                projectStatus: o.projectStatus,
              })),
            },
          },
        });
      }

      case 'payments':
      case 'payments:audit': {
        const successful = await Payment.find({ status: 'success' });
        const totalGross = successful.reduce((sum, p) => sum + p.amount, 0);
        const advanceTotal = successful
          .filter((p) => p.type === 'advance')
          .reduce((sum, p) => sum + p.amount, 0);
        const remainingTotal = successful
          .filter((p) => p.type === 'remaining')
          .reduce((sum, p) => sum + p.amount, 0);

        const upiCount = successful.filter((p) => p.paymentMethod === 'upi_qr' || p.upiTransactionId).length;
        const razorpayCount = successful.filter((p) => p.paymentMethod === 'razorpay' || p.razorpayPaymentId).length;

        const recentPayments = await Payment.find()
          .populate('userId', 'name')
          .sort({ createdAt: -1 })
          .limit(5)
          .select('paymentReference amount type paymentMethod status createdAt');

        return res.status(200).json({
          success: true,
          output: {
            type: 'payments',
            data: {
              totalGross: `₹${totalGross.toLocaleString('en-IN')}`,
              advanceReceived: `₹${advanceTotal.toLocaleString('en-IN')}`,
              remainingReceived: `₹${remainingTotal.toLocaleString('en-IN')}`,
              totalTransactions: await Payment.countDocuments(),
              successfulCount: successful.length,
              upiTransactions: upiCount,
              razorpayTransactions: razorpayCount,
              recent: recentPayments.map((p) => ({
                ref: p.paymentReference,
                client: p.userId?.name || 'Customer',
                amount: `₹${p.amount.toLocaleString('en-IN')}`,
                type: p.type,
                method: p.paymentMethod || 'razorpay',
                status: p.status,
              })),
            },
          },
        });
      }

      case 'users':
      case 'users:list': {
        const [total, customers, admins, recentUsers] = await Promise.all([
          User.countDocuments(),
          User.countDocuments({ role: 'customer' }),
          User.countDocuments({ role: 'admin' }),
          User.find().sort({ createdAt: -1 }).limit(5).select('name email role company createdAt'),
        ]);

        return res.status(200).json({
          success: true,
          output: {
            type: 'users',
            data: {
              totalAccounts: total,
              customers,
              administrators: admins,
              recent: recentUsers.map((u) => ({
                name: u.name,
                email: u.email,
                role: u.role,
                company: u.company || 'Individual',
                joined: new Date(u.createdAt).toLocaleDateString('en-IN'),
              })),
            },
          },
        });
      }

      case 'services':
      case 'services:list': {
        const services = await Service.find().select('name category basePrice');
        const list = await Promise.all(
          services.map(async (s) => {
            const packageCount = await Package.countDocuments({ serviceId: s._id });
            return {
              name: s.name,
              category: s.category,
              basePrice: `₹${s.basePrice?.toLocaleString('en-IN') || 0}`,
              packageCount,
            };
          })
        );
        return res.status(200).json({
          success: true,
          output: {
            type: 'services',
            data: {
              totalServices: services.length,
              list,
            },
          },
        });
      }

      case 'upi':
      case 'upi:config':
      case 'upi:get': {
        let setting = await Setting.findOne();
        if (!setting) {
          setting = await Setting.create({});
        }

        return res.status(200).json({
          success: true,
          output: {
            type: 'upi',
            data: {
              companyUpiId: setting.companyUpiId || process.env.COMPANY_UPI_ID || 'nwtinfo@okaxis',
              companyPayeeName: setting.companyPayeeName || process.env.COMPANY_PAYEE_NAME || 'NWT Info (Next World Tech)',
              advancePercentage: `${setting.advancePercentage}%`,
              upiQrStatus: setting.upiQrEnabled ? 'ENABLED / ACTIVE' : 'DISABLED',
              razorpayStatus: setting.razorpayEnabled ? 'ENABLED / ACTIVE' : 'DISABLED',
              razorpayKeyId: setting.razorpayKeyId || 'Configured via Environment',
            },
          },
        });
      }

      case 'settings':
      case 'settings:get': {
        let setting = await Setting.findOne();
        if (!setting) {
          setting = await Setting.create({});
        }

        return res.status(200).json({
          success: true,
          output: {
            type: 'settings',
            data: {
              companyName: setting.companyName,
              tagline: setting.companyTagline,
              supportEmail: setting.supportEmail,
              supportPhone: setting.supportPhone,
              address: setting.companyAddress,
              maxBookingsPerDay: setting.maxBookingsPerDay,
              autoConfirm: setting.autoConfirmBookings ? 'ENABLED' : 'MANUAL REVIEW',
              maintenanceMode: setting.maintenanceMode ? 'ACTIVE (LOCKED)' : 'NORMAL',
            },
          },
        });
      }

      case 'clear':
      case 'cls': {
        return res.status(200).json({
          success: true,
          output: {
            type: 'clear',
          },
        });
      }

      default: {
        return res.status(200).json({
          success: true,
          output: {
            type: 'error',
            message: `Command not recognized: "${cmd}". Type "help" to display supported system commands.`,
          },
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get dynamic platform settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
export const getPlatformSettings = async (req, res, next) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({
        companyUpiId: process.env.COMPANY_UPI_ID || 'nwtinfo@okaxis',
        companyPayeeName: process.env.COMPANY_PAYEE_NAME || 'NWT Info (Next World Tech)',
      });
    }

    res.status(200).json({
      success: true,
      data: setting,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update dynamic platform settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
export const updatePlatformSettings = async (req, res, next) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting();
    }

    const {
      companyName,
      companyTagline,
      supportEmail,
      supportPhone,
      companyAddress,
      companyUpiId,
      companyPayeeName,
      advancePercentage,
      maxBookingsPerDay,
      razorpayKeyId,
      razorpayEnabled,
      upiQrEnabled,
      autoConfirmBookings,
      maintenanceMode,
    } = req.body;

    if (companyName !== undefined) setting.companyName = companyName;
    if (companyTagline !== undefined) setting.companyTagline = companyTagline;
    if (supportEmail !== undefined) setting.supportEmail = supportEmail;
    if (supportPhone !== undefined) setting.supportPhone = supportPhone;
    if (companyAddress !== undefined) setting.companyAddress = companyAddress;
    if (companyUpiId !== undefined) {
      setting.companyUpiId = companyUpiId.trim();
      process.env.COMPANY_UPI_ID = companyUpiId.trim();
    }
    if (companyPayeeName !== undefined) {
      setting.companyPayeeName = companyPayeeName.trim();
      process.env.COMPANY_PAYEE_NAME = companyPayeeName.trim();
    }
    if (advancePercentage !== undefined) setting.advancePercentage = Number(advancePercentage);
    if (maxBookingsPerDay !== undefined) setting.maxBookingsPerDay = Number(maxBookingsPerDay);
    if (razorpayKeyId !== undefined) setting.razorpayKeyId = razorpayKeyId.trim();
    if (razorpayEnabled !== undefined) setting.razorpayEnabled = Boolean(razorpayEnabled);
    if (upiQrEnabled !== undefined) setting.upiQrEnabled = Boolean(upiQrEnabled);
    if (autoConfirmBookings !== undefined) setting.autoConfirmBookings = Boolean(autoConfirmBookings);
    if (maintenanceMode !== undefined) setting.maintenanceMode = Boolean(maintenanceMode);

    await setting.save();

    res.status(200).json({
      success: true,
      message: 'Platform configuration updated successfully.',
      data: setting,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Change Admin Password
// @route   PUT /api/admin/change-password
// @access  Private (Admin)
export const changeAdminPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    // Fetch user with password field
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin account not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Admin security password has been updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

import User from '../models/User.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Service from '../models/Service.js';
import Package from '../models/Package.js';

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

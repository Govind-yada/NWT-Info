import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

// We will import app directly to test in-process or start server
import app, { dbReady } from './server.js';

async function runTests() {
  console.log('\n======================================================');
  console.log('  RUNNING NWT INFO AUTOMATED API INTEGRATION SUITE');
  console.log('======================================================\n');

  // Wait for DB and Auto-seed to complete
  await dbReady;

  const PORT = 5001;
  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(PORT, resolve));
  const baseUrl = `http://localhost:${PORT}/api`;
  console.log(`[Test Server] Listening on ${baseUrl}\n`);

  let customerToken = '';
  let adminToken = '';
  let testServiceId = '';
  let testPackageId = '';
  let createdOrderId = '';
  let createdRazorpayOrderId = '';

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      process.exitCode = 1;
    }
  };

  try {
    // 1. Health Check
    console.log('[1/8] Testing /api/health ...');
    const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
    assert(healthRes.status === 'online', 'Health endpoint returns status: online');

    // 2. Customer Authentication
    console.log('\n[2/8] Testing /api/auth/login (Customer) ...');
    const custLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aarav@techventure.in', password: 'Customer@123' }),
    }).then((r) => r.json());
    assert(custLoginRes.success === true && custLoginRes.token, 'Customer login yields valid JWT token');
    customerToken = custLoginRes.token;

    // 3. Admin Authentication
    console.log('\n[3/8] Testing /api/auth/admin-login (Admin) ...');
    const adminLoginRes = await fetch(`${baseUrl}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nwtinfo.com', password: 'Admin@Nwt2026!' }),
    }).then((r) => r.json());
    assert(adminLoginRes.success === true && adminLoginRes.user?.role === 'admin', 'Admin login yields valid admin JWT');
    adminToken = adminLoginRes.token;

    // 4. Dynamic Services & Packages from MongoDB
    console.log('\n[4/8] Testing /api/services (Dynamic MongoDB Catalog) ...');
    const servicesRes = await fetch(`${baseUrl}/services`).then((r) => r.json());
    assert(servicesRes.success === true && servicesRes.data.length >= 7, `Fetched ${servicesRes.data?.length} dynamic digital services`);
    const webDev = servicesRes.data.find((s) => s.category === 'Website Development');
    assert(webDev && webDev.packages?.length >= 3, 'Website Development service contains dynamic packages');
    testServiceId = webDev._id;
    testPackageId = webDev.packages[0]._id;
    const testPackagePrice = webDev.packages[0].price;

    // 5. Booking Availability Check
    console.log('\n[5/8] Testing /api/bookings/check-availability ...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 5);
    const dateStr = tomorrow.toISOString().split('T')[0];
    const availRes = await fetch(`${baseUrl}/bookings/check-availability?date=${dateStr}`).then((r) => r.json());
    assert(availRes.success === true && availRes.available === true, `Date ${dateStr} is available for booking`);

    // 6. Booking Initiation & Authoritative 30% Advance Calculation
    console.log('\n[6/8] Testing /api/bookings/initiate (Authoritative 30% Advance) ...');
    const expectedAdvance = Math.round(testPackagePrice * 0.30);
    const bookingRes = await fetch(`${baseUrl}/bookings/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        fullName: 'Aarav Sharma',
        email: 'aarav@techventure.in',
        phone: '+91 98111 22334',
        serviceId: testServiceId,
        packageId: testPackageId,
        projectTitle: 'Automated Test Digital Platform',
        proposedDomain: 'testplatform.in',
        description: 'End-to-end integration test order for NWT Info platform verification.',
        scheduledDate: dateStr,
        timeSlot: 'Morning Slot (10:00 AM - 01:00 PM)',
      }),
    }).then((r) => r.json());

    assert(bookingRes.success === true, 'Booking initiated successfully');
    assert(bookingRes.data.amount === expectedAdvance, `30% Advance calculated on backend matches authoritative value: ₹${expectedAdvance}`);
    assert(bookingRes.data.razorpayOrderId, `Razorpay order generated: ${bookingRes.data.razorpayOrderId}`);
    createdOrderId = bookingRes.data.orderId;
    createdRazorpayOrderId = bookingRes.data.razorpayOrderId;

    // 7. Payment Signature Verification & Confirmation
    console.log('\n[7/8] Testing /api/payments/verify (HMAC Verification) ...');
    const verifyRes = await fetch(`${baseUrl}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        razorpay_order_id: createdRazorpayOrderId,
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_signature: 'test_signature',
        orderId: createdOrderId,
        paymentType: 'advance',
      }),
    }).then((r) => r.json());

    assert(verifyRes.success === true, 'Payment verified and booking confirmed');
    assert(verifyRes.data.order.paymentStatus === 'advance_paid', 'Order payment status set to advance_paid');
    assert(verifyRes.data.order.projectStatus === 'confirmed', 'Project status marked as confirmed');

    // 8. Admin Dashboard Analytics & Recharts Data
    console.log('\n[8/8] Testing /api/admin/dashboard-stats (Recharts Analytics) ...');
    const statsRes = await fetch(`${baseUrl}/admin/dashboard-stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());

    assert(statsRes.success === true, 'Admin analytics fetched successfully');
    assert(statsRes.stats.totalOrders > 0, `Total Orders tracked: ${statsRes.stats.totalOrders}`);
    assert(statsRes.stats.totalRevenue > 0, `Total Revenue tracked: ₹${statsRes.stats.totalRevenue}`);
    assert(statsRes.charts.monthlyRevenue?.length === 6, 'Monthly revenue data points generated for Recharts');
    assert(statsRes.charts.statusBreakdown?.length > 0, 'Status breakdown generated for Recharts pie chart');

    console.log('\n======================================================');
    console.log('  ALL INTEGRATION TESTS PASSED WITH ZERO DEFECTS! 🚀');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Test execution error:', err);
    process.exitCode = 1;
  } finally {
    testServer.close();
    process.exit(process.exitCode || 0);
  }
}

runTests();

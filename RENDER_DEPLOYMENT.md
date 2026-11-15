# Render Deployment Guide – NWT Info Platform

This repository is fully configured and optimized for zero-configuration, production deployment on [Render](https://render.com/).

In production, the Node.js / Express backend serves both the `/api/*` REST endpoints and the compiled React + Vite frontend SPA from `client/dist`.

---

## Option 1: Automatic Blueprint Deployment (Recommended & Fastest)

Render supports Infrastructure-as-Code via the included [`render.yaml`](./render.yaml).

1. Push this project to your **GitHub** or **GitLab** account.
2. Sign in to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** at the top right and select **Blueprint**.
4. Connect your GitHub/GitLab repository.
5. Render will automatically detect [`render.yaml`](./render.yaml) and configure:
   - **Service Name**: `nwt-info-platform`
   - **Environment**: `Node`
   - **Plan**: `Free`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
6. Under Environment Variables:
   - Provide your **`MONGODB_URI`** (e.g., from [MongoDB Atlas Free M0](https://www.mongodb.com/atlas)).
   - Provide your **Razorpay** (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) and **Cloudinary** credentials if using live keys, or leave the configured sandbox mock keys.
7. Click **Apply**. Render will build and deploy your application.

---

## Option 2: Manual Web Service Deployment

If you prefer to configure the Web Service manually in Render:

1. Go to [Render Dashboard](https://dashboard.render.com/) -> Click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `nwt-info-platform` (or your preferred name)
   - **Region**: Any (e.g. `Oregon (US West)` or `Frankfurt (EU)`)
   - **Branch**: `master` (or `main`)
   - **Root Directory**: Leave blank (root of repo)
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan Type**: `Free`

4. Add the following **Environment Variables** under the **Environment** tab:

| Key | Suggested / Default Value | Purpose |
|---|---|---|
| `NODE_ENV` | `production` | Enables production mode and client SPA serving |
| `PORT` | `10000` | Render default web service port |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/nwt_info` | MongoDB Atlas database connection string |
| `JWT_SECRET` | *(Generate a 32+ character random string)* | Secure token signing key |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `COMPANY_UPI_ID` | `nwtinfo@okaxis` | Company UPI ID for QR payments |
| `COMPANY_PAYEE_NAME` | `NWT Info (Next World Tech)` | Beneficiary name displayed on QR code |
| `RAZORPAY_KEY_ID` | `rzp_test_mockKeyId12345` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | `mockRazorpaySecretKey987654` | Razorpay Secret Key |
| `RAZORPAY_WEBHOOK_SECRET`| `mockWebhookSecretKey54321` | Razorpay Webhook Secret |
| `CLOUDINARY_CLOUD_NAME`| `mock_cloud` | Cloudinary storage (or local fallback) |
| `CLOUDINARY_API_KEY` | `mock_api_key` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET`| `mock_api_secret` | Cloudinary API Secret |
| `ADMIN_EMAIL` | `admin@nwtinfo.com` | Initial administrator login email |
| `ADMIN_PASSWORD` | `Admin@Nwt2026!` | Initial administrator login password |
| `ADMIN_NAME` | `NWT System Administrator` | Initial admin display name |

5. Under **Advanced Settings**:
   - Set **Health Check Path** to: `/api/health`
6. Click **Create Web Service**.

---

## 3. Database: Setting Up Free MongoDB Atlas

Render does not host free MongoDB instances internally. Use MongoDB Atlas (Free Tier):

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Create a free **M0 Sandbox cluster** (Select AWS / closest region).
3. Under **Database Access**, create a database user (e.g., `nwt_admin`) with a secure password.
4. Under **Network Access**, click **Add IP Address** -> Select **Allow Access from Anywhere** (`0.0.0.0/0`) so Render servers can connect.
5. In your Cluster view, click **Connect** -> **Drivers (Node.js)**.
6. Copy the connection string:
   ```text
   mongodb+srv://nwt_admin:<password>@cluster0.abcde.mongodb.net/nwt_info?retryWrites=true&w=majority
   ```
7. Paste this string as your `MONGODB_URI` environment variable in Render.

---

## 4. Automatic Database Seeding on First Boot

When the deployed service boots for the first time with an empty database:
- The system automatically detects an empty database.
- It seeds all **7 digital services** and **service package tiers**.
- It seeds client testimonials and FAQ entries.
- It creates the administrator account:
  - **Email**: `admin@nwtinfo.com`
  - **Password**: `Admin@Nwt2026!`
- It creates a demo customer account:
  - **Email**: `aarav@techventure.in`
  - **Password**: `Customer@123`

---

## 5. Verification Checklist

Once the deployment shows **Live**:
- Visit `https://<your-service>.onrender.com` -> The agency homepage loads immediately.
- Visit `https://<your-service>.onrender.com/api/health` -> Returns `{ "status": "online" }`.
- Log in at `/login` with customer or admin credentials.
- Test the **Book Project** modal: supports both **Razorpay** and **UPI QR Code** payments.

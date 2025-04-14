# CertAethon 🧾

**CertAethon** is a web-based certification tracking platform built for organizations to manage employee certifications with ease. The system supports individual profile views, a searchable certificate catalog, admin dashboards, and real-time updates from employee data feeds.

## 📌 Project Overview

CertAethon allows:
- **Employees** to view and manage their certifications.
- **Admins** to oversee their own and team members' certification progress.
- **Organizations** to maintain up-to-date certification catalogs and profiles using batch data feeds.

## 🔧 Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Jest & React Testing Library

**Backend:**
- C# (.NET Core Web API)
- Entity Framework Core
- SQL Server

**Tools & Platforms:**
- Swagger (API Docs)
- Postman (Testing)
- Azure Data Studio / SQL Server Management Studio
- Azure App Services / GitHub Actions (CI/CD)

## 🚀 Features

### 🌐 General
- Role-based access: Employee and Admin
- Authentication via secure login

### 👤 Profile Management
- View/update personal info (name, role, email, mobile)
- Upload profile pictures
- Change passwords securely

### 🎓 Certification Dashboard
- Add, edit, and delete certifications
- Browse certification catalog
- Search and filter certifications

### 🧑‍💼 Admin Page
- View summary statistics
- Manage employee profiles and certification progress
- Add employees via modal

### ⚙️ System Integration
- Real-time syncing with external employee feeds
- Default password generation and email notifications for new users

## 🛠️ Getting Started

### Prerequisites
- [.NET 7+](https://dotnet.microsoft.com/)
- [Node.js 18+](https://nodejs.org/)
- SQL Server
- (Optional) Azure CLI & GitHub Actions

### Backend Setup

```bash
cd Backend
dotnet restore
dotnet ef database update
dotnet run```

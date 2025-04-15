# CertAethon – Certification Tracker Platform

CertAethon is a cloud-native certification management platform developed for CSCE 590 – Azure Cloud Native Development. It enables employees and administrators to manage, validate, and track certifications in real time, leveraging a modern Azure-based microservices architecture.

> Developed by Team CertAefied Copilots 

---

## Overview

CertAethon is a full-stack web application designed to:
- Provide employees with a secure dashboard to manage their certifications.
- Allow administrators to maintain employee records and oversee team certifications.
- Automatically load and validate certifications from uploaded PDFs using AI.
- Integrate with external feeds for real-time updates using Azure Functions and Service Bus.

---

## Features

### Core Use Cases

1. **Home Screen**
   - View all uploaded certifications
   - Quick access to key actions: upload, validate, manage

2. **Certificate Management**
   - Add, edit, or delete certifications
   - Real-time status updates

3. **Notification System**
   - System alerts for expiring or newly added certifications

4. **Dashboard**
   - Admin view of team certification progress
   - Summary stats

5. **Profile & Certificate Catalog**
   - View and update user details
   - Browse searchable certificate catalog

---

## Epic 5: Real-Time Data Loading

**Feature 5.1: Employee and Certificate Feed Integration**
- Automatically loads employee and certificate data from external feeds into the database.
- Ensures data is always current by triggering updates in real time.

**User Stories:**
- As an admin, I want the system to process feeds automatically so that the database is always current.
- As an admin, I want to avoid manual updates and let the system manage data ingestion.

**Acceptance Criteria:**
- Feeds are processed automatically and in real time.
- Data is accurately persisted into Azure SQL Database.

---

## Epic 6: Smart Certificate Validation

**Feature 6.1: OCR-Powered Certificate Parsing**
- Users upload certificate PDFs directly from the Home Screen.
- Azure Cognitive Services (OCR) extract:
  - Certificate Name
  - Issue Date
  - Expiry Date

**User Stories:**
1. Upload PDF to system
2. Auto-extract certificate info via OCR
3. Review/edit extracted info
4. Save certificate to the system
5. View/manage uploaded certificates

**Benefits:**
- Reduces manual data entry
- Improves accuracy using AI
- Enhances user experience

---

## Optional Features

### Optional Use Case 1: Login and Authentication
- Secure login page
- Password change functionality
- Forced password change on first login

### Optional Use Case 2: Profile Picture Upload
- Upload profile pictures to Azure Blob Storage
- Integrated into the user profile

---

## Tech Stack

### Development Tools
- Visual Studio (C#/.NET 8)
- Azure Data Studio

### Frontend
- React (Vite)
- Tailwind CSS
- HTML, JavaScript

### Backend
- .NET Core 8 Web API
- RESTful services
- Entity Framework Core

---

## Azure Services Used

| Service                  | Purpose                                  |
|--------------------------|-------------------------------------------|
| Azure SQL Database       | Store user, certification, and feed data |
| Azure Cosmos DB          | Scalable NoSQL data for feed ingestion   |
| Azure Blob Storage       | Store PDFs and profile images            |
| Azure Cognitive Services | OCR for certificate validation           |
| Azure Function App       | Trigger on feed and file upload events   |
| Azure Service Bus        | Async messaging for real-time updates    |
| Azure Logic App          | Low-code process automation              |
| Azure Data Factory       | Feed integration pipelines               |

---

## Setup Instructions

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/)
- [Node.js 18+](https://nodejs.org/)
- Azure Account with appropriate service access

### Backend Setup
```bash
cd Backend
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend Setup
```
cd Frontend
npm install
npm run dev
```
Access API via Swagger: https://localhost:<port>/swagger
Access frontend: http://localhost:5173

After having everything downloaded and your connection string to your database, running
```
dotnet run
```
in the Backend folder, this will launch the frontend and backend.

---

## Team Members

Team Name: CertAefied Copilots
- Dillon McLaughlin - Scrum Analyst
- Kayly Tran - Test Analyst
- Basith Penna-Hakkim - Technical Design Analyst
- Marcus Campbell - Developer Analyst
- Kasra Korminejad - Developer Analyst

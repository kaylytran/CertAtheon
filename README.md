# CertAethon – Certification Tracker Platform

CertAethon is a cloud-native certification management platform developed for CSCE 590 – Azure Cloud Native Development. It enables employees and administrators to add, manage, validate, and track certifications in real time, leveraging a modern Azure-based microservices architecture.

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

### Account Creation

Users are not able to "sign up" and make their own accounts. 

Managers have to be added directly to the database. This can be done through Swagger as well. (api/Manager/register)

Employees can be add multiple ways, but only by the Manager. Once the Manager has an account and can access thhe website they can:
1. Drop and excel file with the fields: id, first_name, last_name, email, phone, grade, role, username
   - This allows Managers to add multiple employees at once.
2. Managers can add one employee at a time through the "Add Employee" button on the "Dashboard" page.

Once a user (Manager/Employee) is created, they will get an email about their account creation with the email and temporary password.
Since the password is being sent through an email and this can be unsecure, when the user first login, they will be directed to a change paassword page. 


### Admin Feactures

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



---


---

## Tech Stack

### Development Tools
- Visual Studio (C#/.NET 9)
- Azure Data Studio

### Frontend
- React (Vite)
- Tailwind CSS
- HTML, JavaScript

### Backend
- .NET Core 9 Web API
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
- [.NET 9 SDK](https://dotnet.microsoft.com/)
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
Access frontend: http://localhost:<port>

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

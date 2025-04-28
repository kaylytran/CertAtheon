# CertAethon – Certification Tracker Platform

![Build and Test](https://github.com/kaylytran/CertAtheon/actions/workflows/build-and-test.yml/badge.svg)

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

Employees can be add multiple ways, but only by the Manager. Once the Manager has an account and can access the website they can:
1. To add multiple empolyees at a time, drop and excel file with the fields: id, first_name, last_name, email, phone, grade, role, username
2. Managers can add one employee at a time through the "Add Employee" button on the "Dashboard" page. This can be done through Swagger as well. (api/Auth/register)

Once a user (Manager/Employee) is created, they will get an email about their account creation with the email and temporary password.
Since the password is being sent through an email and this can be unsecure, so when the user first login, they will be directed to a "Change Paassword" page. 

### Manager Features

1. **Home Screen - My certification**
   - User will be able to see all of their certificates and the following information: Certification Name, Certified Date, Certificate Level, Expiry Date.
   - User will be able to Edit or Delete a certificate.
   - User will be able to drag and drop a pdf file of their certificate for easy input.
2. **Ceritificate Catalogue Screen**
   - User will be able to see all of the certifiactes required/needed for their company
   - Manger will be able to add certificates to the Certificate Catalogue
   wip
3. **Admin Dashboard - Employee Management**
   - Manager will be able to see all employees and all certificate status.
   - Manager will be able to filter by year to see total number of employees, employees with certificates, and overall adoption rate.
   wip
4. **Profile Page**
   - User will be able to see all of their information.
   - User will be able to upload/change their profile picture.
   - User will be able to change their password if desired.


### Employee Features

1. **Home Screen - My Certifications**
   - Same as manager.
2. **Certificate Catalogue Screen**
   - Same as manager, but can not add certificates.
3. **Profile Page**
   - Same as manager.
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
# TODO, connection
---

## Team Members

Team Name: CertAefied Copilots
- Dillon McLaughlin - Scrum Analyst
- Kayly Tran - Test Analyst
- Basith Penna-Hakkim - Technical Design Analyst
- Marcus Campbell - Developer Analyst
- Kasra Korminejad - Developer Analyst

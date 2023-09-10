# Gatsby & AWS CDK Bookmark App

![Gatsby](https://img.shields.io/badge/Gatsby-3.0.0%2B-663399)
![AWS CDK](https://img.shields.io/badge/AWS%20CDK-1.130.0%2B-232F3E)
![Node.js](https://img.shields.io/badge/Node.js-14.17.5%2B-339933)

A modern bookmark app built with Gatsby as the frontend and AWS CDK for the backend infrastructure. This app allows you to save and organize your favorite bookmarks in the cloud, ensuring you have access to them from anywhere.

## Table of Contents
- [Getting Started](#getting-started)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Folder Structure](#folder-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

To run the Gatsby frontend and deploy the AWS CDK backend, follow these steps:

### Full Stack (Gatsby & AWS CDK)

1. Clone this repository:
   ```bash
   git clone https://github.com/aliijaz1997/Eventdriven-bookmark.git
   cd Eventdriven-bookmark/frontend-bookmark
   npm install
   cd ../backend
   npm run build
   npm run watch
   npm run test
   cdk deploy
   cdk diff
   cdk synth

### Features

- User-friendly bookmark management.
- AWS infrastructure for data storage.
- Secure authentication using Amazon Cognito.
- Responsive design for desktop and mobile.

### Technologies Used

**Frontend (Gatsby)**

- **Gatsby**: A React-based framework for building fast websites and applications.
- **React**: A JavaScript library for building user interfaces.
- **GraphQL**: A query language for your API, and a server-side runtime for executing those queries by your data.
- **Netlify**: For easy deployment and hosting.

**Backend (AWS CDK)**

- **AWS CDK**: A software development framework to define cloud infrastructure in code and provision it through AWS CloudFormation.
- **Amazon DynamoDB**: A managed NoSQL database service for handling bookmark data.
- **Amazon Cognito**: Provides authentication, authorization, and user management for the app.
- **AWS Lambda**: For serverless functions and business logic.
- **AWS S3**: To store user data and assets.

### Folder Structure

- `/frontend-bookmark`: Gatsby frontend code.
- `/backend`: AWS CDK infrastructure code.

### Deployment

The Gatsby frontend is deployed automatically to Netlify whenever changes are pushed to the main branch.

The AWS CDK backend can be deployed by following the steps outlined in the "Getting Started" section.

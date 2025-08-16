# Database Schema for Towing Service Management App

## Overview
This document outlines the complete database schema for the towing service management application built on Zoho Creator. The schema includes all tables, fields, relationships, and data types required for the application.

## Table Structure

### 1. Service_Requests

**Purpose**: Store incoming service requests from customers

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| Service_Request_ID | Auto Number | Yes | Unique identifier for service request |
| Customer_Name | Text | Yes | Customer's full name |
| Contact_Number | Phone | Yes | Customer's phone number |
| Customer_Email | Email | No | Customer's email address |
| Emergency_Contact | Text | No | Emergency contact information |
| Preferred_Contact_Method | Dropdown | No | Phone, Email, SMS |
| Preferred_Contact_Time | Dropdown | No | Morning, Afternoon, Evening, Any Time |
| Vehicle_Make | Dropdown | Yes | Vehicle manufacturer |
| Vehicle_Model | Text | Yes | Vehicle model |
| Vehicle_Year | Number | Yes | Vehicle year (1900-current) |
| VIN | Text | No | Vehicle identification number (17 chars) |
| License_Plate | Text | No | License plate number |
| License_Plate_State | Dropdown | No | State of registration |
| Current_Location | Text | Yes | Current vehicle location |
| Destination | Text | No | Destination address |
| Service_Type | Dropdown | Yes | Type of service required |
| Urgency_Level | Dropdown | Yes | Standard, Priority, Emergency |
| Special_Instructions | Multi-line Text | No | Additional instructions |
| Status | Dropdown | Yes | Current status of request |
| Assigned_Driver | Lookup | No | Reference to Drivers table |
| Created_Date | DateTime | Yes | When request was created |
| Last_Updated | DateTime | Yes | Last modification timestamp |
| Created_By | User | Yes | User who created the request |

**Dropdown Options:**
- Vehicle_Make: ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes", "Audi", "Volkswagen", "Hyundai", "Kia", "Mazda", "Subaru", "Other"]
- Service_Type: ["Tow Service", "Jump Start", "Tire Change", "Lockout Service", "Fuel Delivery", "Battery Replacement", "Other"]
- Status: ["Pending Dispatch", "Assigned", "En Route", "On Scene", "In Progress", "Completed", "Cancelled"]
- Urgency_Level: ["Standard", "Priority", "Emergency"]

### 2. Work_Orders

**Purpose**: Track work orders created from service requests

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| Work_Order_ID | Auto Number | Yes | Unique identifier for work order |
| Service_Request_ID | Lookup | Yes | Reference to Service_Requests table |
| Assigned_Driver | Lookup | Yes | Reference to Drivers table |
| Current_Status | Dropdown | Yes | Current work order status |
| Start_Time | DateTime | No | When work started |
| Arrival_Time | DateTime | No | When driver arrived on scene |
| Work_Start_Time | DateTime | No | When actual work began |
| Completion_Time | DateTime | No | When work was completed |
| Total_Duration | Number | No | Total time spent (hours) |
| Labor_Hours | Number | No | Labor hours charged |
| Special_Notes | Multi-line Text | No | Additional notes |
| Status_Notes | Multi-line Text | No | Notes for status changes |
| Created_Date | DateTime | Yes | When work order was created |
| Last_Updated | DateTime | Yes | Last modification timestamp |
| Last_Updated_By | User | Yes | User who last updated |

**Dropdown Options:**
- Current_Status: ["En Route", "On Scene", "In Progress", "Completed", "Cancelled"]

### 3. Work_Order_Status_History

**Purpose**: Track status changes for work orders

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| Status_History_ID | Auto Number | Yes | Unique identifier |
| Work_Order_ID | Lookup | Yes | Reference to Work_Orders table |
| Status | Dropdown | Yes | Status value |
| Status_Date | DateTime | Yes | When status changed |
| Updated_By | User | Yes | User who changed status |
| Notes | Multi-line Text | No | Notes about status change |

### 4. Drivers

**Purpose**: Store driver/technician information

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| Driver_ID | Auto Number | Yes | Unique identifier for driver |
| Driver_Name | Text | Yes | Driver's full name |
| Employee_ID | Text | Yes | Employee identification number |
| Phone_Number | Phone | Yes | Driver's phone number |
| Email | Email | No | Driver's email address |
| Status | Dropdown | Yes | Current driver status |
| Current_Location | Text | No | Current GPS location |
| Vehicle_Assigned | Text | No | Assigned vehicle information |
| License_Number | Text | Yes | Driver's license number |
| License_Expiry | Date | Yes | License expiration date |
| Certifications | Multi-line Text | No | Professional certifications |
| Hire_Date | Date | Yes | Date driver was hired |
| Last_Status_Update | DateTime | Yes | Last status update timestamp |
| Last_Location_Update | DateTime | No | Last location update timestamp |
| Is_Active | Checkbox | Yes | Whether driver is active |

**Dropdown Options:**
- Status: ["Available", "Busy", "Off Duty", "On Break"]

### 5. Inventory

**Purpose**: Manage product inventory

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| Product_ID | Auto Number | Yes | Unique identifier for product |
| Product_Name | Text | Yes | Product name |
| SKU | Text | Yes | Stock keeping unit |
| Description | Multi-line Text | No | Product description |
| Category | Dropdown | Yes | Product category |
| Unit_of_Measure | Dropdown | Yes | Unit of measurement |
| Unit_Cost | Currency | Yes | Cost per unit |
| Selling_Price | Currency | Yes | Selling price per unit |
| Markup_Percentage | Number | No | Calculated markup percentage |
| Quantity_in_Stock | Number | Yes | Current stock quantity |
| Reorder_Point | Number | Yes | Minimum stock level |
| Maximum_Stock | Number | Yes | Maximum stock level |
| Supplier_Information | Text | No | Supplier details |
| Last_Updated | DateTime | Yes | Last stock update |
| Last_Used_Date | DateTime | No | Last time product was used |
| Is_Active | Checkbox | Yes | Whether product is active |

**Dropdown Options:**
- Category: ["Batteries", "Tires", "Fuel", "Tools", "Safety Equipment", "Other"]
- Unit_of_Measure: ["Each", "Box", "Gallon", "Pound", "Meter", "Other"]

### 6. Product_Usage

**Purpose**: Track products used in work orders

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| Usage_ID | Auto Number | Yes | Unique identifier |
| Work_Order_ID | Lookup | Yes | Reference to Work_Orders table |
| Product_ID | Lookup | Yes | Reference to Inventory table |
| Quantity_Used | Number | Yes | Quantity used |
| Unit_Price | Currency | Yes | Price per unit |
| Total_Amount | Currency | Yes | Total amount for this usage |
| Usage_Date | DateTime | Yes | When product was used |
| Notes | Multi-line Text | No | Notes about usage |

### 7. Invoices

**Purpose**: Generate and track invoices

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| Invoice_ID | Auto Number | Yes | Unique identifier for invoice |
| Work_Order_ID | Lookup | Yes | Reference to Work_Orders table |
| Service_Request_ID | Lookup | Yes | Reference to Service_Requests table |
| Customer_Name | Text | Yes | Customer name |
| Customer_Email | Email | No | Customer email |
| Customer_Phone | Phone | No | Customer phone |
| Invoice_Date | Date | Yes | Invoice date |
| Due_Date | Date | Yes | Payment due date |
| Subtotal | Currency | Yes | Subtotal amount |
| Tax_Amount | Currency | Yes | Tax amount |
| Discount_Amount | Currency | No | Discount amount |
| Grand_Total | Currency | Yes | Total invoice amount |
| Payment_Status | Dropdown | Yes | Payment status |
| Payment_Date | Date | No | When payment was received |
| Payment_Method | Dropdown | No | Method of payment |
| Terms_and_Conditions | Multi-line Text | No | Invoice terms |
| Created_Date | DateTime | Yes | When invoice was created |
| Last_Updated | DateTime | Yes | Last modification timestamp |

**Dropdown Options:**
- Payment_Status: ["Due", "Paid", "Partially Paid", "Overdue", "Cancelled"]
- Payment_Method: ["Cash", "Credit Card", "Debit Card", "Check", "Bank Transfer", "Other"]

### 8. Invoice_Line_Items

**Purpose**: Store individual line items on invoices

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| Line_Item_ID | Auto Number | Yes | Unique identifier |
| Invoice_ID | Lookup | Yes | Reference to Invoices table |
| Description | Text | Yes | Line item description |
| Quantity | Number | Yes | Quantity |
| Unit_Price | Currency | Yes | Price per unit |
| Total_Amount | Currency | Yes | Total amount for line item |
| Line_Item_Type | Dropdown | Yes | Type of line item |
| Product_ID | Lookup | No | Reference to Inventory table |

**Dropdown Options:**
- Line_Item_Type: ["Labor", "Product", "Service", "Custom"]

### 9. Users

**Purpose**: Store user account information

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| User_ID | Auto Number | Yes | Unique identifier for user |
| Username | Text | Yes | Login username |
| Email | Email | Yes | User email address |
| Phone | Phone | No | User phone number |
| First_Name | Text | Yes | User's first name |
| Last_Name | Text | Yes | User's last name |
| Role | Dropdown | Yes | User role |
| Is_Active | Checkbox | Yes | Whether user is active |
| Last_Login | DateTime | No | Last login timestamp |
| Created_Date | DateTime | Yes | When account was created |
| Password_Last_Changed | DateTime | No | Password change timestamp |

**Dropdown Options:**
- Role: ["Admin", "Dispatcher", "Driver", "Manager"]

### 10. Notifications

**Purpose**: Store system notifications

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| Notification_ID | Auto Number | Yes | Unique identifier |
| User_ID | Lookup | Yes | Reference to Users table |
| Title | Text | Yes | Notification title |
| Message | Multi-line Text | Yes | Notification message |
| Type | Dropdown | Yes | Type of notification |
| Priority | Dropdown | Yes | Priority level |
| Status | Dropdown | Yes | Notification status |
| Created_Date | DateTime | Yes | When notification was created |
| Sent_Date | DateTime | No | When notification was sent |
| Read_Date | DateTime | No | When notification was read |

**Dropdown Options:**
- Type: ["Service Request", "Work Order", "Invoice", "Inventory", "Driver Status", "System"]
- Priority: ["Low", "Medium", "High", "Critical"]
- Status: ["Pending", "Sent", "Read", "Failed"]

### 11. Low_Stock_Alerts

**Purpose**: Track low stock alerts

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| Alert_ID | Auto Number | Yes | Unique identifier |
| Product_ID | Lookup | Yes | Reference to Inventory table |
| Product_Name | Text | Yes | Product name |
| Current_Stock | Number | Yes | Current stock level |
| Reorder_Point | Number | Yes | Reorder point |
| Alert_Date | DateTime | Yes | When alert was created |
| Status | Dropdown | Yes | Alert status |
| Resolved_Date | DateTime | No | When alert was resolved |

**Dropdown Options:**
- Status: ["Active", "Resolved", "Dismissed"]

### 12. Reorder_Requests

**Purpose**: Track inventory reorder requests

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| Reorder_ID | Auto Number | Yes | Unique identifier |
| Product_ID | Lookup | Yes | Reference to Inventory table |
| Product_Name | Text | Yes | Product name |
| Current_Stock | Number | Yes | Current stock level |
| Reorder_Point | Number | Yes | Reorder point |
| Reorder_Quantity | Number | Yes | Quantity to reorder |
| Supplier | Text | No | Supplier information |
| Request_Date | Date | Yes | Request date |
| Status | Dropdown | Yes | Request status |
| Completion_Date | Date | No | When order was completed |
| Notes | Multi-line Text | No | Additional notes |
| Created_Date | DateTime | Yes | When request was created |

**Dropdown Options:**
- Status: ["Pending", "Ordered", "Received", "Completed", "Cancelled"]

### 13. Inventory_Receipts

**Purpose**: Track inventory receipts

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| Receipt_ID | Auto Number | Yes | Unique identifier |
| Product_ID | Lookup | Yes | Reference to Inventory table |
| Quantity_Received | Number | Yes | Quantity received |
| Unit_Cost | Currency | Yes | Cost per unit |
| Total_Cost | Currency | Yes | Total cost |
| Receipt_Date | Date | Yes | Receipt date |
| Supplier | Text | No | Supplier information |
| Status | Dropdown | Yes | Receipt status |
| Notes | Multi-line Text | No | Additional notes |
| Created_Date | DateTime | Yes | When receipt was created |

**Dropdown Options:**
- Status: ["Pending", "Received", "Verified", "Rejected"]

### 14. Inventory_Transactions

**Purpose**: Track all inventory transactions

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| Transaction_ID | Auto Number | Yes | Unique identifier |
| Product_ID | Lookup | Yes | Reference to Inventory table |
| Transaction_Type | Dropdown | Yes | Type of transaction |
| Quantity | Number | Yes | Transaction quantity |
| Unit_Cost | Currency | Yes | Cost per unit |
| Total_Cost | Currency | Yes | Total transaction cost |
| Transaction_Date | Date | Yes | Transaction date |
| Reference_ID | Text | No | Reference to related record |
| Notes | Multi-line Text | No | Transaction notes |
| Created_Date | DateTime | Yes | When transaction was created |

**Dropdown Options:**
- Transaction_Type: ["Receipt", "Usage", "Adjustment", "Return", "Damage"]

### 15. Daily_Reports

**Purpose**: Store daily performance reports

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| Report_ID | Auto Number | Yes | Unique identifier |
| Report_Date | Date | Yes | Report date |
| Total_Requests | Number | Yes | Total service requests |
| Completed_Requests | Number | Yes | Completed requests |
| Total_Revenue | Currency | Yes | Total revenue |
| Average_Response_Time | Number | Yes | Average response time (minutes) |
| Created_Date | DateTime | Yes | When report was created |

### 16. Service_Charges

**Purpose**: Store service type charges

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| Service_Charge_ID | Auto Number | Yes | Unique identifier |
| Service_Type | Dropdown | Yes | Type of service |
| Service_Name | Text | Yes | Service name |
| Base_Charge | Currency | Yes | Base charge amount |
| Hourly_Rate | Currency | No | Hourly rate if applicable |
| Description | Multi-line Text | No | Service description |
| Is_Active | Checkbox | Yes | Whether service is active |
| Created_Date | DateTime | Yes | When record was created |

**Dropdown Options:**
- Service_Type: ["Tow Service", "Jump Start", "Tire Change", "Lockout Service", "Fuel Delivery", "Battery Replacement", "Other"]

### 17. Company_Information

**Purpose**: Store company details for invoices and branding

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| Company_ID | Auto Number | Yes | Unique identifier |
| Company_Name | Text | Yes | Company name |
| Address | Multi-line Text | Yes | Company address |
| Phone | Phone | Yes | Company phone |
| Email | Email | Yes | Company email |
| Website | URL | No | Company website |
| Tax_ID | Text | No | Tax identification number |
| Logo_URL | URL | No | Company logo URL |
| Invoice_Footer | Multi-line Text | No | Invoice footer text |
| Terms_and_Conditions | Multi-line Text | No | Standard terms |

## Relationships

### Primary Relationships
1. **Service_Requests** → **Work_Orders** (1:1)
   - Service_Request_ID in Work_Orders references Service_Requests.Service_Request_ID

2. **Work_Orders** → **Work_Order_Status_History** (1:Many)
   - Work_Order_ID in Work_Order_Status_History references Work_Orders.Work_Order_ID

3. **Drivers** → **Work_Orders** (1:Many)
   - Assigned_Driver in Work_Orders references Drivers.Driver_ID

4. **Work_Orders** → **Product_Usage** (1:Many)
   - Work_Order_ID in Product_Usage references Work_Orders.Work_Order_ID

5. **Inventory** → **Product_Usage** (1:Many)
   - Product_ID in Product_Usage references Inventory.Product_ID

6. **Work_Orders** → **Invoices** (1:1)
   - Work_Order_ID in Invoices references Work_Orders.Work_Order_ID

7. **Invoices** → **Invoice_Line_Items** (1:Many)
   - Invoice_ID in Invoice_Line_Items references Invoices.Invoice_ID

### Secondary Relationships
1. **Users** → **Notifications** (1:Many)
2. **Inventory** → **Low_Stock_Alerts** (1:Many)
3. **Inventory** → **Reorder_Requests** (1:Many)
4. **Inventory** → **Inventory_Receipts** (1:Many)
5. **Inventory** → **Inventory_Transactions** (1:Many)

## Data Validation Rules

### Service_Requests
- Customer_Name: Required, minimum 2 characters
- Contact_Number: Required, valid phone format
- Vehicle_Year: Between 1900 and current year + 1
- VIN: Exactly 17 characters if provided
- Service_Type: Must be selected from dropdown

### Work_Orders
- Service_Request_ID: Must reference existing service request
- Assigned_Driver: Must reference existing driver
- Labor_Hours: Must be positive number
- Total_Duration: Auto-calculated from timestamps

### Inventory
- Product_Name: Required, unique
- SKU: Required, unique
- Unit_Cost: Must be positive
- Selling_Price: Must be greater than or equal to Unit_Cost
- Quantity_in_Stock: Must be non-negative

### Invoices
- Work_Order_ID: Must reference existing work order
- Grand_Total: Must equal Subtotal + Tax_Amount - Discount_Amount
- Due_Date: Must be after Invoice_Date

## Indexes and Performance

### Recommended Indexes
1. **Service_Requests**
   - Service_Request_ID (Primary)
   - Status
   - Created_Date
   - Assigned_Driver

2. **Work_Orders**
   - Work_Order_ID (Primary)
   - Service_Request_ID
   - Assigned_Driver
   - Current_Status
   - Created_Date

3. **Inventory**
   - Product_ID (Primary)
   - SKU
   - Category
   - Quantity_in_Stock

4. **Invoices**
   - Invoice_ID (Primary)
   - Work_Order_ID
   - Payment_Status
   - Invoice_Date

## Data Migration Considerations

### Initial Data Setup
1. **Company_Information**: Set up company details
2. **Service_Charges**: Configure service pricing
3. **Users**: Create initial admin and dispatcher accounts
4. **Drivers**: Add existing driver information
5. **Inventory**: Import current inventory levels

### Data Import Templates
- CSV templates for bulk import of:
  - Drivers
  - Inventory
  - Service charges
  - Company information

## Security and Permissions

### Role-Based Access Control
1. **Admin**: Full access to all tables and functions
2. **Dispatcher**: Access to service requests, work orders, invoices, limited user management
3. **Driver**: Access to assigned work orders, status updates, product usage
4. **Manager**: Access to reports, analytics, and management functions

### Data Security
- Row-level security based on user role
- Field-level security for sensitive information
- Audit trail for all data modifications
- Encrypted storage for sensitive data

This comprehensive database schema provides the foundation for a robust towing service management application with proper data relationships, validation, and security measures.



# Deluge Scripts for Towing Service Management App

## Overview
This document contains all the Deluge scripts required for the towing service management app automation. These scripts handle data validation, workflow automation, notifications, and business logic.

## 1. Service Request Management Scripts

### 1.1 Auto-generate Service Request ID
```deluge
// Trigger: onCreate
// Purpose: Generate unique service request ID and set initial status
void onCreate()
{
    // Generate unique service request ID
    request_date = toString(today);
    request_time = toString(now);
    random_num = toString(random(1000, 9999));
    input.Service_Request_ID = "SR" + request_date + request_time + random_num;
    
    // Set initial status and timestamps
    input.Status = "Pending Dispatch";
    input.Created_Date = now;
    input.Last_Updated = now;
    
    // Send notification to dispatchers
    sendNotification();
}

void sendNotification()
{
    // Get all dispatcher users
    dispatchers = Users[Role == "Dispatcher"];
    
    for each dispatcher in dispatchers
    {
        notification = insert into Notifications;
        notification.User_ID = dispatcher.User_ID;
        notification.Title = "New Service Request";
        notification.Message = "New service request " + input.Service_Request_ID + " received from " + input.Customer_Name;
        notification.Type = "Service Request";
        notification.Priority = "High";
        notification.Created_Date = now;
    }
}
```

### 1.2 Service Request Validation
```deluge
// Trigger: onValidate
// Purpose: Validate service request data before submission
void onValidate()
{
    // Validate customer information
    if(input.Customer_Name == null || input.Customer_Name == "")
    {
        alert "Customer name is required";
    }
    
    if(input.Contact_Number == null || input.Contact_Number == "")
    {
        alert "Contact number is required";
    }
    
    // Validate vehicle information
    if(input.Vehicle_Make == null)
    {
        alert "Vehicle make is required";
    }
    
    if(input.Vehicle_Model == null || input.Vehicle_Model == "")
    {
        alert "Vehicle model is required";
    }
    
    if(input.Vehicle_Year == null || input.Vehicle_Year < 1900 || input.Vehicle_Year > year(today) + 1)
    {
        alert "Please enter a valid vehicle year";
    }
    
    // Validate service details
    if(input.Current_Location == null || input.Current_Location == "")
    {
        alert "Current location is required";
    }
    
    if(input.Service_Type == null)
    {
        alert "Service type is required";
    }
    
    // Validate VIN format (basic validation)
    if(input.VIN != null && input.VIN != "")
    {
        if(length(input.VIN) != 17)
        {
            alert "VIN must be exactly 17 characters";
        }
    }
}
```

### 1.3 Service Request Status Update
```deluge
// Trigger: onUpdate
// Purpose: Handle status changes and create work orders
void onUpdate()
{
    // Update timestamp
    input.Last_Updated = now;
    
    // If status changed to "Assigned", create work order
    if(input.Status == "Assigned" && input.Assigned_Driver != null)
    {
        createWorkOrder();
    }
    
    // If status changed to "Cancelled", handle cancellation
    if(input.Status == "Cancelled")
    {
        handleCancellation();
    }
    
    // Send status update notifications
    sendStatusNotification();
}

void createWorkOrder()
{
    work_order = insert into Work_Orders;
    work_order.Service_Request_ID = input.Service_Request_ID;
    work_order.Assigned_Driver = input.Assigned_Driver;
    work_order.Current_Status = "En Route";
    work_order.Start_Time = now;
    work_order.Created_Date = now;
    
    // Add status history entry
    status_history = insert into Work_Order_Status_History;
    status_history.Work_Order_ID = work_order.Work_Order_ID;
    status_history.Status = "En Route";
    status_history.Status_Date = now;
    status_history.Updated_By = input.Assigned_Driver;
    status_history.Notes = "Work order created and assigned to driver";
}

void handleCancellation()
{
    // Update any existing work order
    existing_work_order = Work_Orders[Service_Request_ID == input.Service_Request_ID];
    if(existing_work_order != null)
    {
        existing_work_order.Current_Status = "Cancelled";
        existing_work_order.Completion_Time = now;
        update existing_work_order;
        
        // Add cancellation to status history
        status_history = insert into Work_Order_Status_History;
        status_history.Work_Order_ID = existing_work_order.Work_Order_ID;
        status_history.Status = "Cancelled";
        status_history.Status_Date = now;
        status_history.Updated_By = input.Last_Updated_By;
        status_history.Notes = "Service request cancelled by customer";
    }
}

void sendStatusNotification()
{
    // Notify customer of status change
    if(input.Customer_Email != null && input.Customer_Email != "")
    {
        email_template = Email_Templates[Template_Name == "Status Update"];
        if(email_template != null)
        {
            sendmail
            [
                from:email_template.From_Email
                to:input.Customer_Email
                subject:email_template.Subject
                message:email_template.Message
            ]
        }
    }
    
    // Send SMS notification if phone number provided
    if(input.Contact_Number != null && input.Contact_Number != "")
    {
        sms_message = "Your service request " + input.Service_Request_ID + " status has been updated to: " + input.Status;
        // Note: SMS integration would require external API call
    }
}
```

## 2. Work Order Management Scripts

### 2.1 Work Order Status Update
```deluge
// Trigger: onUpdate (Work_Orders table)
// Purpose: Handle work order status changes and time tracking
void onUpdate()
{
    // Update last modified timestamp
    input.Last_Updated = now;
    
    // Handle status-specific actions
    if(input.Current_Status == "On Scene")
    {
        handleOnScene();
    }
    else if(input.Current_Status == "In Progress")
    {
        handleInProgress();
    }
    else if(input.Current_Status == "Completed")
    {
        handleCompletion();
    }
    
    // Add status history entry
    addStatusHistory();
    
    // Update service request status
    updateServiceRequestStatus();
}

void handleOnScene()
{
    // Record arrival time
    input.Arrival_Time = now;
    
    // Send notification to customer
    service_request = Service_Requests[Service_Request_ID == input.Service_Request_ID];
    if(service_request != null)
    {
        sendCustomerNotification(service_request, "Your service technician has arrived at the location.");
    }
}

void handleInProgress()
{
    // Record work start time
    if(input.Work_Start_Time == null)
    {
        input.Work_Start_Time = now;
    }
}

void handleCompletion()
{
    // Record completion time
    input.Completion_Time = now;
    
    // Calculate total duration
    if(input.Start_Time != null && input.Completion_Time != null)
    {
        duration_hours = (input.Completion_Time - input.Start_Time) / 3600000; // Convert to hours
        input.Total_Duration = round(duration_hours, 2);
    }
    
    // Generate invoice
    generateInvoice();
    
    // Update driver availability
    updateDriverAvailability();
}

void addStatusHistory()
{
    status_history = insert into Work_Order_Status_History;
    status_history.Work_Order_ID = input.Work_Order_ID;
    status_history.Status = input.Current_Status;
    status_history.Status_Date = now;
    status_history.Updated_By = input.Last_Updated_By;
    status_history.Notes = input.Status_Notes;
}

void updateServiceRequestStatus()
{
    service_request = Service_Requests[Service_Request_ID == input.Service_Request_ID];
    if(service_request != null)
    {
        service_request.Status = input.Current_Status;
        service_request.Last_Updated = now;
        update service_request;
    }
}

void updateDriverAvailability()
{
    driver = Drivers[Driver_ID == input.Assigned_Driver];
    if(driver != null)
    {
        driver.Status = "Available";
        driver.Last_Status_Update = now;
        update driver;
    }
}
```

### 2.2 Product Usage Tracking
```deluge
// Trigger: onUpdate (Product_Usage subform)
// Purpose: Track product usage and update inventory
void onUpdate()
{
    // Validate product availability
    validateProductAvailability();
    
    // Update inventory levels
    updateInventory();
    
    // Calculate line item totals
    calculateLineItemTotals();
}

void validateProductAvailability()
{
    for each product in input.Products_Used
    {
        inventory_item = Inventory[Product_ID == product.Product_ID];
        if(inventory_item != null)
        {
            if(product.Quantity_Used > inventory_item.Quantity_in_Stock)
            {
                alert "Insufficient stock for product: " + inventory_item.Product_Name;
            }
        }
    }
}

void updateInventory()
{
    for each product in input.Products_Used
    {
        inventory_item = Inventory[Product_ID == product.Product_ID];
        if(inventory_item != null)
        {
            inventory_item.Quantity_in_Stock = inventory_item.Quantity_in_Stock - product.Quantity_Used;
            inventory_item.Last_Used_Date = now;
            
            // Check if stock is below reorder point
            if(inventory_item.Quantity_in_Stock <= inventory_item.Reorder_Point)
            {
                createLowStockAlert(inventory_item);
            }
            
            update inventory_item;
        }
    }
}

void calculateLineItemTotals()
{
    for each product in input.Products_Used
    {
        inventory_item = Inventory[Product_ID == product.Product_ID];
        if(inventory_item != null)
        {
            product.Unit_Price = inventory_item.Selling_Price;
            product.Total_Amount = product.Quantity_Used * product.Unit_Price;
        }
    }
}

void createLowStockAlert(inventory_item)
{
    alert = insert into Low_Stock_Alerts;
    alert.Product_ID = inventory_item.Product_ID;
    alert.Product_Name = inventory_item.Product_Name;
    alert.Current_Stock = inventory_item.Quantity_in_Stock;
    alert.Reorder_Point = inventory_item.Reorder_Point;
    alert.Alert_Date = now;
    alert.Status = "Active";
    
    // Send notification to admin users
    admin_users = Users[Role == "Admin"];
    for each admin in admin_users
    {
        notification = insert into Notifications;
        notification.User_ID = admin.User_ID;
        notification.Title = "Low Stock Alert";
        notification.Message = "Product " + inventory_item.Product_Name + " is running low on stock. Current quantity: " + inventory_item.Quantity_in_Stock;
        notification.Type = "Inventory";
        notification.Priority = "Medium";
        notification.Created_Date = now;
    }
}
```

## 3. Invoice Generation Scripts

### 3.1 Automatic Invoice Generation
```deluge
// Trigger: onUpdate (Work_Orders table)
// Purpose: Generate invoice when work order is completed
void generateInvoice()
{
    // Check if invoice already exists
    existing_invoice = Invoices[Work_Order_ID == input.Work_Order_ID];
    if(existing_invoice != null)
    {
        return; // Invoice already exists
    }
    
    // Get service request details
    service_request = Service_Requests[Service_Request_ID == input.Service_Request_ID];
    if(service_request == null)
    {
        return;
    }
    
    // Create new invoice
    invoice = insert into Invoices;
    invoice.Work_Order_ID = input.Work_Order_ID;
    invoice.Service_Request_ID = input.Service_Request_ID;
    invoice.Customer_Name = service_request.Customer_Name;
    invoice.Customer_Email = service_request.Customer_Email;
    invoice.Customer_Phone = service_request.Contact_Number;
    invoice.Invoice_Date = today;
    invoice.Due_Date = addDays(today, 30);
    invoice.Payment_Status = "Due";
    invoice.Created_Date = now;
    
    // Calculate line items
    calculateInvoiceLineItems(invoice);
    
    // Calculate totals
    calculateInvoiceTotals(invoice);
    
    // Send invoice to customer
    sendInvoiceToCustomer(invoice);
}

void calculateInvoiceLineItems(invoice)
{
    // Add labor charges
    if(input.Labor_Hours != null && input.Labor_Hours > 0)
    {
        labor_rate = 75; // $75 per hour
        labor_line = insert into Invoice_Line_Items;
        labor_line.Invoice_ID = invoice.Invoice_ID;
        labor_line.Description = "Labor - " + input.Labor_Hours + " hours";
        labor_line.Quantity = input.Labor_Hours;
        labor_line.Unit_Price = labor_rate;
        labor_line.Total_Amount = input.Labor_Hours * labor_rate;
        labor_line.Line_Item_Type = "Labor";
    }
    
    // Add product charges
    for each product in input.Products_Used
    {
        inventory_item = Inventory[Product_ID == product.Product_ID];
        if(inventory_item != null)
        {
            product_line = insert into Invoice_Line_Items;
            product_line.Invoice_ID = invoice.Invoice_ID;
            product_line.Description = inventory_item.Product_Name;
            product_line.Quantity = product.Quantity_Used;
            product_line.Unit_Price = inventory_item.Selling_Price;
            product_line.Total_Amount = product.Quantity_Used * inventory_item.Selling_Price;
            product_line.Line_Item_Type = "Product";
            product_line.Product_ID = product.Product_ID;
        }
    }
    
    // Add service type charges
    service_charges = Service_Charges[Service_Type == input.Service_Type];
    if(service_charges != null)
    {
        service_line = insert into Invoice_Line_Items;
        service_line.Invoice_ID = invoice.Invoice_ID;
        service_line.Description = service_charges.Service_Name;
        service_line.Quantity = 1;
        service_line.Unit_Price = service_charges.Base_Charge;
        service_line.Total_Amount = service_charges.Base_Charge;
        service_line.Line_Item_Type = "Service";
    }
}

void calculateInvoiceTotals(invoice)
{
    // Calculate subtotal
    line_items = Invoice_Line_Items[Invoice_ID == invoice.Invoice_ID];
    subtotal = 0;
    
    for each item in line_items
    {
        subtotal = subtotal + item.Total_Amount;
    }
    
    invoice.Subtotal = subtotal;
    
    // Calculate tax (assuming 8.5% tax rate)
    tax_rate = 0.085;
    invoice.Tax_Amount = round(subtotal * tax_rate, 2);
    
    // Apply any discounts
    if(invoice.Discount_Amount == null)
    {
        invoice.Discount_Amount = 0;
    }
    
    // Calculate grand total
    invoice.Grand_Total = subtotal + invoice.Tax_Amount - invoice.Discount_Amount;
    
    update invoice;
}

void sendInvoiceToCustomer(invoice)
{
    // Send email invoice
    if(invoice.Customer_Email != null && invoice.Customer_Email != "")
    {
        email_template = Email_Templates[Template_Name == "Invoice"];
        if(email_template != null)
        {
            // Generate PDF invoice
            pdf_url = generatePDFInvoice(invoice);
            
            sendmail
            [
                from:email_template.From_Email
                to:invoice.Customer_Email
                subject:email_template.Subject
                message:email_template.Message
                attachments:pdf_url
            ]
        }
    }
    
    // Send SMS notification
    if(invoice.Customer_Phone != null && invoice.Customer_Phone != "")
    {
        sms_message = "Your invoice for service request " + invoice.Service_Request_ID + " has been generated. Amount: $" + invoice.Grand_Total;
        // Note: SMS integration would require external API call
    }
}

string generatePDFInvoice(invoice)
{
    // This would integrate with Zoho Creator's PDF generation
    // or external PDF service
    pdf_template = "invoice_template.html";
    pdf_data = map();
    pdf_data.put("invoice", invoice);
    pdf_data.put("line_items", Invoice_Line_Items[Invoice_ID == invoice.Invoice_ID]);
    pdf_data.put("company_info", Company_Information[1]);
    
    // Return PDF URL (implementation depends on PDF service used)
    return "https://example.com/invoices/" + invoice.Invoice_ID + ".pdf";
}
```

## 4. Driver Management Scripts

### 4.1 Driver Availability Update
```deluge
// Trigger: onUpdate (Drivers table)
// Purpose: Update driver status and location
void onUpdate()
{
    // Update last status change timestamp
    input.Last_Status_Update = now;
    
    // Handle status-specific actions
    if(input.Status == "Available")
    {
        handleDriverAvailable();
    }
    else if(input.Status == "Busy")
    {
        handleDriverBusy();
    }
    else if(input.Status == "Off Duty")
    {
        handleDriverOffDuty();
    }
    
    // Update location if provided
    if(input.Current_Location != null)
    {
        input.Last_Location_Update = now;
    }
    
    // Send status update to dispatchers
    notifyDispatchers();
}

void handleDriverAvailable()
{
    // Check for pending service requests
    pending_requests = Service_Requests[Status == "Pending Dispatch"];
    if(pending_requests.count() > 0)
    {
        // Send notification to dispatchers about available driver
        dispatchers = Users[Role == "Dispatcher"];
        for each dispatcher in dispatchers
        {
            notification = insert into Notifications;
            notification.User_ID = dispatcher.User_ID;
            notification.Title = "Driver Available";
            notification.Message = "Driver " + input.Driver_Name + " is now available for assignment";
            notification.Type = "Driver Status";
            notification.Priority = "Medium";
            notification.Created_Date = now;
        }
    }
}

void handleDriverBusy()
{
    // Update any active work orders
    active_work_orders = Work_Orders[Assigned_Driver == input.Driver_ID && Current_Status == "En Route"];
    for each work_order in active_work_orders
    {
        work_order.Driver_Status = "Busy";
        update work_order;
    }
}

void handleDriverOffDuty()
{
    // Complete any active work orders
    active_work_orders = Work_Orders[Assigned_Driver == input.Driver_ID && Current_Status != "Completed"];
    for each work_order in active_work_orders
    {
        work_order.Current_Status = "Cancelled";
        work_order.Completion_Time = now;
        work_order.Notes = "Driver went off duty";
        update work_order;
        
        // Add to status history
        status_history = insert into Work_Order_Status_History;
        status_history.Work_Order_ID = work_order.Work_Order_ID;
        status_history.Status = "Cancelled";
        status_history.Status_Date = now;
        status_history.Updated_By = input.Driver_ID;
        status_history.Notes = "Driver went off duty";
    }
}

void notifyDispatchers()
{
    dispatchers = Users[Role == "Dispatcher"];
    for each dispatcher in dispatchers
    {
        notification = insert into Notifications;
        notification.User_ID = dispatcher.User_ID;
        notification.Title = "Driver Status Update";
        notification.Message = "Driver " + input.Driver_Name + " status changed to: " + input.Status;
        notification.Type = "Driver Status";
        notification.Priority = "Low";
        notification.Created_Date = now;
    }
}
```

## 5. Inventory Management Scripts

### 5.1 Inventory Reorder Automation
```deluge
// Trigger: Scheduled Task (Daily)
// Purpose: Check inventory levels and create reorder requests
void checkInventoryLevels()
{
    // Get all products below reorder point
    low_stock_items = Inventory[Quantity_in_Stock <= Reorder_Point];
    
    for each item in low_stock_items
    {
        // Check if reorder request already exists
        existing_reorder = Reorder_Requests[Product_ID == item.Product_ID && Status == "Pending"];
        if(existing_reorder == null)
        {
            createReorderRequest(item);
        }
    }
}

void createReorderRequest(inventory_item)
{
    reorder_request = insert into Reorder_Requests;
    reorder_request.Product_ID = inventory_item.Product_ID;
    reorder_request.Product_Name = inventory_item.Product_Name;
    reorder_request.Current_Stock = inventory_item.Quantity_in_Stock;
    reorder_request.Reorder_Point = inventory_item.Reorder_Point;
    reorder_request.Reorder_Quantity = inventory_item.Maximum_Stock - inventory_item.Quantity_in_Stock;
    reorder_request.Supplier = inventory_item.Supplier_Information;
    reorder_request.Request_Date = today;
    reorder_request.Status = "Pending";
    reorder_request.Created_Date = now;
    
    // Send notification to admin users
    admin_users = Users[Role == "Admin"];
    for each admin in admin_users
    {
        notification = insert into Notifications;
        notification.User_ID = admin.User_ID;
        notification.Title = "Reorder Request";
        notification.Message = "Reorder request created for " + inventory_item.Product_Name + ". Quantity needed: " + reorder_request.Reorder_Quantity;
        notification.Type = "Inventory";
        notification.Priority = "Medium";
        notification.Created_Date = now;
    }
}
```

### 5.2 Inventory Receipt Processing
```deluge
// Trigger: onUpdate (Inventory_Receipts table)
// Purpose: Process inventory receipts and update stock levels
void onUpdate()
{
    if(input.Status == "Received")
    {
        // Update inventory levels
        inventory_item = Inventory[Product_ID == input.Product_ID];
        if(inventory_item != null)
        {
            inventory_item.Quantity_in_Stock = inventory_item.Quantity_in_Stock + input.Quantity_Received;
            inventory_item.Last_Updated = now;
            update inventory_item;
            
            // Update reorder request status
            updateReorderRequest(input);
            
            // Create inventory transaction record
            createInventoryTransaction(input);
        }
    }
}

void updateReorderRequest(receipt)
{
    reorder_request = Reorder_Requests[Product_ID == receipt.Product_ID && Status == "Pending"];
    if(reorder_request != null)
    {
        reorder_request.Status = "Completed";
        reorder_request.Completion_Date = today;
        reorder_request.Notes = "Inventory received on " + today;
        update reorder_request;
    }
}

void createInventoryTransaction(receipt)
{
    transaction = insert into Inventory_Transactions;
    transaction.Product_ID = receipt.Product_ID;
    transaction.Transaction_Type = "Receipt";
    transaction.Quantity = receipt.Quantity_Received;
    transaction.Unit_Cost = receipt.Unit_Cost;
    transaction.Total_Cost = receipt.Quantity_Received * receipt.Unit_Cost;
    transaction.Transaction_Date = today;
    transaction.Reference_ID = receipt.Receipt_ID;
    transaction.Notes = "Inventory receipt from supplier";
    transaction.Created_Date = now;
}
```

## 6. Notification System Scripts

### 6.1 Notification Processing
```deluge
// Trigger: Scheduled Task (Every 5 minutes)
// Purpose: Process pending notifications
void processNotifications()
{
    pending_notifications = Notifications[Status == "Pending"];
    
    for each notification in pending_notifications
    {
        // Send email notification
        if(notification.User_Email != null)
        {
            sendEmailNotification(notification);
        }
        
        // Send SMS notification (if configured)
        if(notification.User_Phone != null && notification.Priority == "High")
        {
            sendSMSNotification(notification);
        }
        
        // Mark notification as sent
        notification.Status = "Sent";
        notification.Sent_Date = now;
        update notification;
    }
}

void sendEmailNotification(notification)
{
    user = Users[User_ID == notification.User_ID];
    if(user != null && user.Email != null)
    {
        email_template = Email_Templates[Template_Name == "Notification"];
        if(email_template != null)
        {
            sendmail
            [
                from:email_template.From_Email
                to:user.Email
                subject:notification.Title
                message:notification.Message
            ]
        }
    }
}

void sendSMSNotification(notification)
{
    user = Users[User_ID == notification.User_ID];
    if(user != null && user.Phone != null)
    {
        // SMS integration would require external API call
        // This is a placeholder for SMS functionality
        sms_message = notification.Title + ": " + notification.Message;
    }
}
```

## 7. Reporting and Analytics Scripts

### 7.1 Daily Performance Report
```deluge
// Trigger: Scheduled Task (Daily at 6:00 AM)
// Purpose: Generate daily performance report
void generateDailyReport()
{
    yesterday = addDays(today, -1);
    
    // Get daily statistics
    daily_stats = map();
    daily_stats.put("total_requests", Service_Requests[Created_Date >= yesterday && Created_Date < today].count());
    daily_stats.put("completed_requests", Service_Requests[Status == "Completed" && Created_Date >= yesterday && Created_Date < today].count());
    daily_stats.put("total_revenue", calculateDailyRevenue(yesterday));
    daily_stats.put("average_response_time", calculateAverageResponseTime(yesterday));
    
    // Create report record
    report = insert into Daily_Reports;
    report.Report_Date = yesterday;
    report.Total_Requests = daily_stats.get("total_requests");
    report.Completed_Requests = daily_stats.get("completed_requests");
    report.Total_Revenue = daily_stats.get("total_revenue");
    report.Average_Response_Time = daily_stats.get("average_response_time");
    report.Created_Date = now;
    
    // Send report to management
    sendDailyReport(report);
}

number calculateDailyRevenue(report_date)
{
    completed_invoices = Invoices[Invoice_Date == report_date && Payment_Status == "Paid"];
    total_revenue = 0;
    
    for each invoice in completed_invoices
    {
        total_revenue = total_revenue + invoice.Grand_Total;
    }
    
    return total_revenue;
}

number calculateAverageResponseTime(report_date)
{
    completed_requests = Service_Requests[Status == "Completed" && Created_Date >= report_date && Created_Date < addDays(report_date, 1)];
    total_response_time = 0;
    request_count = 0;
    
    for each request in completed_requests
    {
        work_order = Work_Orders[Service_Request_ID == request.Service_Request_ID];
        if(work_order != null && work_order.Start_Time != null)
        {
            response_time = (work_order.Start_Time - request.Created_Date) / 60000; // Convert to minutes
            total_response_time = total_response_time + response_time;
            request_count = request_count + 1;
        }
    }
    
    if(request_count > 0)
    {
        return round(total_response_time / request_count, 2);
    }
    
    return 0;
}

void sendDailyReport(report)
{
    management_users = Users[Role == "Admin"];
    
    for each user in management_users
    {
        email_template = Email_Templates[Template_Name == "Daily Report"];
        if(email_template != null)
        {
            sendmail
            [
                from:email_template.From_Email
                to:user.Email
                subject:"Daily Performance Report - " + report.Report_Date
                message:email_template.Message
            ]
        }
    }
}
```

## 8. Data Validation and Security Scripts

### 8.1 User Permission Validation
```deluge
// Trigger: onValidate (All forms)
// Purpose: Validate user permissions for data access
void validateUserPermissions()
{
    current_user = Users[User_ID == input.User_ID];
    if(current_user == null)
    {
        alert "Invalid user session";
        return;
    }
    
    // Check role-based permissions
    if(current_user.Role == "Driver")
    {
        validateDriverPermissions();
    }
    else if(current_user.Role == "Dispatcher")
    {
        validateDispatcherPermissions();
    }
    else if(current_user.Role == "Admin")
    {
        // Admin has full access
        return;
    }
    else
    {
        alert "Insufficient permissions";
    }
}

void validateDriverPermissions()
{
    // Drivers can only access their assigned work orders
    if(input.Work_Order_ID != null)
    {
        work_order = Work_Orders[Work_Order_ID == input.Work_Order_ID];
        if(work_order == null || work_order.Assigned_Driver != input.User_ID)
        {
            alert "Access denied: You can only access your assigned work orders";
        }
    }
}

void validateDispatcherPermissions()
{
    // Dispatchers can access service requests and work orders
    // but cannot modify certain fields
    if(input.Payment_Information != null)
    {
        alert "Access denied: Dispatchers cannot modify payment information";
    }
}
```

### 8.2 Data Integrity Validation
```deluge
// Trigger: onValidate (All forms)
// Purpose: Ensure data integrity across the application
void validateDataIntegrity()
{
    // Validate required fields
    validateRequiredFields();
    
    // Validate data relationships
    validateDataRelationships();
    
    // Validate business rules
    validateBusinessRules();
}

void validateRequiredFields()
{
    // This would be customized for each form
    // Example for Service Requests
    if(input.Customer_Name == null || input.Customer_Name == "")
    {
        alert "Customer name is required";
    }
    
    if(input.Service_Type == null)
    {
        alert "Service type is required";
    }
}

void validateDataRelationships()
{
    // Validate foreign key relationships
    if(input.Assigned_Driver != null)
    {
        driver = Drivers[Driver_ID == input.Assigned_Driver];
        if(driver == null)
        {
            alert "Selected driver does not exist";
        }
    }
    
    if(input.Service_Request_ID != null)
    {
        service_request = Service_Requests[Service_Request_ID == input.Service_Request_ID];
        if(service_request == null)
        {
            alert "Service request does not exist";
        }
    }
}

void validateBusinessRules()
{
    // Validate business-specific rules
    if(input.Labor_Hours != null && input.Labor_Hours < 0)
    {
        alert "Labor hours cannot be negative";
    }
    
    if(input.Quantity_Used != null && input.Quantity_Used <= 0)
    {
        alert "Quantity used must be greater than zero";
    }
}
```

## Usage Instructions

1. **Copy and Paste**: Copy the relevant script sections into your Zoho Creator application
2. **Configure Triggers**: Set up the appropriate triggers (onCreate, onUpdate, onValidate, etc.)
3. **Test Thoroughly**: Test each script in a development environment before deploying
4. **Monitor Performance**: Monitor script execution times and optimize as needed
5. **Backup Data**: Always backup your data before implementing new scripts

## Notes

- All scripts assume the existence of the corresponding tables and fields
- Error handling should be enhanced based on your specific requirements
- External integrations (SMS, PDF generation) require additional setup
- Performance optimization may be needed for large datasets
- Regular maintenance and updates are recommended


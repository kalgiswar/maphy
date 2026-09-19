# Maphy IT Asset & HelpDesk Management Portal — Knowledge Base

This knowledge base document describes the functionality, terminology, user flows, and constraints of the Maphy application. It is structured as individual, self-contained entries suitable for retrieval by an end-user-facing support chatbot.

---

## Login & Two-Factor Authentication (2FA)

Login is the gateway to the Maphy IT Management System, validating user credentials and establishing tenant identity. Two-Factor Authentication (2FA) provides an additional layer of security by requiring a time-based verification code during the authentication process. Users access this flow when starting their session or managing security settings.

### Step-by-Step Instructions
1. Navigate to `/Login`.
2. Input the registered email address in the **Email** field and the password in the **Password** field.
3. Click the **Login** button. If you wish to check your password before submitting, click the eye icon to toggle visibility.
4. If Two-Factor Authentication (2FA) is enabled for your account but not yet configured, you will be redirected to scan a QR code using an authenticator app (such as Google Authenticator). Once scanned, input the code and click **Verify** to complete enrollment.
5. If you forget your password, click the **Forgot Password** link in the login form, enter your email address, and click the **Submit** button to receive a password reset link.

### Rules, Permissions, and Limitations
* Access to the system is denied if the user account's `activated` status is not `1` or if the account has been soft-deleted (`deleted_at` timestamp is present).
* If 2FA is set to opt-in (`two_factor_optin` is enabled in the database) and not yet enrolled, the system forces QR scan setup during the next login attempt.
* Successful authentication stores a JWT token (`maphytoken`) and user permissions in the browser's `localStorage`.

---

## Dashboard Overview

The Dashboard provides a summary of metrics, asset statuses, and recent activities. It serves as the landing page after authentication, giving users an immediate high-level view of their IT infrastructure and administrative workload.

### Step-by-Step Instructions
1. Access the Dashboard by clicking **Dashboard** in the sidebar navigation or navigating to `/Dashboard`.
2. Review the summary metrics cards at the top, which show total counts for **Assets**, **Accessories**, **Consumables**, and **Licenses**.
3. View the charts section to analyze visual statistics, including **Asset Status** (Deployable, Deployed, Undeployed), **Accessories Status**, **Component Status**, **Consumables Status**, **License Status**, and **HelpDesk Ticket Status**.
4. Scroll down to the **Recent Activity** table to view the latest checkins, checkouts, and system audits.

### Rules, Permissions, and Limitations
* **Super Admin / Master Tenant (Firm 1)**: If a super administrator logs in and has no specific organization selected, they see the **Organization Overview** dashboard instead. This view aggregates metrics across all tenants, displaying cards for **Total Organizations**, **Active Orgs**, **Inactive Orgs**, **Total Users**, and **Total Assets**, as well as a list of registered Organizations.
* The Dashboard relies on permissions such as `reports.view` and `assets.view`. If these permissions are missing, some summary statistics and charts may be hidden.

---

## Organizations (Firms)

Organizations (internally referred to as Firms) represent separate business tenants within the multi-tenant system. Managing organizations allows super administrators to set up client boundaries, control tenant-specific configurations, and manage client-level data isolation.

### Step-by-Step Instructions
1. Navigate to `/organizations` from the sidebar.
2. **To Create a New Organization**: Click the **Create Organization** button, fill in the **Organization Name** field, select the subscription settings, and click **Submit**.
3. **To Search**: Type the organization name in the **Search** input box and click the search button.
4. **To View Details**: Click on the Organization's row or ID in the table. This opens the detail view, which displays lists of **Users**, **Groups**, and **Assets** linked to that organization.
5. **To Edit**: Click the edit button on the organization's details page, modify the values, and click **Save**.

### Rules, Permissions, and Limitations
* Only users belonging to the master firm (`firm_id = 1`) with `superuser` permissions can view, create, edit, or delete organizations.
* Deleting an organization requires all nested entities (users, assets, locations) to be re-assigned or deleted first to prevent orphaned records.

---

## Permissions & Groups

Permissions & Groups allow administrators to define functional roles (such as IT Support, Inventory Manager, or Auditor) and assign granular permissions to users. This controls what pages, buttons, and actions users can access in the portal.

### Step-by-Step Instructions
1. Navigate to `/groups` from the sidebar under Admin Settings.
2. **To Create a Group**: Click the **Create Group** button (or navigate to `/addEditgroups`).
3. Fill in the **Group Name** field. Under the permissions section, toggle the checkboxes for the specific modules and actions you want to grant (e.g., `assets.view`, `assets.create`, `licenses.checkout`, `users.delete`). Click **Submit**.
4. **To Edit a Group**: Click the edit icon on the group row, modify name or permission toggles, and click **Update**.
5. **To Search**: Enter the group name in the **Search** input box and click the search icon.

### Rules, Permissions, and Limitations
* Only users with `superuser` or `edit_group_permissions` enabled can manage groups and assign permission levels.
* Group names must be unique within the organization.
* The permissions are stored as a JSON object inside `permission_groups.permissions` in the database and validated on the backend before executing any API route.

---

## Users (Peoples)

The Users module (internally referred to as Peoples) manages directory profiles for employees, contractors, and administrators. This module links individuals to checked-out assets, licenses, accessories, and helpdesk tickets.

### Step-by-Step Instructions
1. Navigate to `/peoples` from the sidebar.
2. **To Create a User**: Click the **Create User** button (or navigate to `/addEditPeoples`). Fill in the profile fields: **First Name**, **Last Name**, **Username**, **Email**, **Password**, **Employee Num**, **Job Title**, **Phone**, **Location**, and **Department**. Click **Submit**.
3. **To Edit a User**: Click the edit button on the user row, update profile fields, and click **Save**.
4. **To View User Details**: Click the user's ID or name in the table to view their profile, checked-out **Assets**, **Licenses**, **Accessories**, **Consumables**, and historical checkin/checkout activities.
5. **To Search and Filter**: Use the search input box at the top of the table to find users by username, email, or employee number.

### Rules, Permissions, and Limitations
* Managing users requires the `users.create`, `users.edit`, or `users.delete` permissions.
* The email address and username must be unique within the tenant organization.
* Active checkouts prevent user deletion. All checked-out hardware, licenses, and accessories must be checked back in before a user profile can be deleted.

---

## Locations (Branches)

Locations represent physical offices, branches, warehouses, or geographical sites. They help track where assets are stored, where employees are based, and where consumables are distributed.

### Step-by-Step Instructions
1. Navigate to `/location` from the sidebar under Settings (or click **Locations** in the onboarding setup wizard).
2. **To Create a Location**: Click the **Create Location** button (or navigate to `/addEditlocation`). This opens a 2-step wizard.
   * **Step 1 (Specifications)**: Enter the **Location Name** and select the **Currency** (both required). Optionally, choose a **Parent Location** and a **Manager** from the dropdowns. Click **Next**.
   * **Step 2 (Address & Details)**: Enter the **Address**, **City**, **State**, **Country**, and **Zip** code. Click **Submit**.
3. **To Edit a Location**: Click the edit icon next to a location in the table, update the wizard fields, and click **Save**.
4. **To View Details**: Click the location's name to see lists of all **Assets**, **Accessories**, **Components**, **Consumables**, and **People** currently assigned to that site.
5. **To Delete**: Click the delete icon on the location row. Confirm the action in the validation popup.

### Rules, Permissions, and Limitations
* Managing locations requires `locations.create`, `locations.edit`, or `locations.delete` permissions.
* The **Zip** code field must consist of exactly 6 numeric digits.
* A location cannot be deleted if there are assets, accessories, or users assigned to it.

---

## Departments

Departments help categorize your staff and organize resource allocation. They link users to managers, helping route helpdesk tickets and asset approvals.

### Step-by-Step Instructions
1. Navigate to `/department` from the sidebar under Settings.
2. **To Create a Department**: Click the **Create Department** button (or navigate to `/addEditDepartment`).
3. Fill in the **Department Name** (required). Select a **Manager** from the user directory dropdown. Select a **Location** if the department is based in a specific branch. Click **Submit**.
4. **To Edit a Department**: Click the edit button on the department row, modify the name, manager, or location, and click **Save**.
5. **To Search**: Use the search input box at the top of the list table.

### Rules, Permissions, and Limitations
* Managing departments requires `departments.create`, `departments.edit`, or `departments.delete` permissions.
* Departments must be associated with a valid location if a location restriction is required.

---

## Manufacturers

Manufacturers represent the brands and makers of your assets, software, accessories, and components (e.g., Apple, Dell, Microsoft). Setting up manufacturers is required before creating asset models.

### Step-by-Step Instructions
1. Navigate to `/manufactures` from the sidebar under Settings.
2. **To Create a Manufacturer**: Click the **Create Manufacturer** button (or navigate to `/addEditManufactures`).
3. Enter the **Manufacturer Name** (required), **Support URL**, **Support Phone**, and **Support Email**. Click **Submit**.
4. **To Edit**: Click the edit icon on the manufacturer row, update support details, and click **Save**.
5. **To Delete**: Click the delete icon on the manufacturer row and confirm the action.

### Rules, Permissions, and Limitations
* Managing manufacturers requires `manufacturers.create`, `manufacturers.edit`, or `manufacturers.delete` permissions.
* A manufacturer cannot be deleted if it is linked to any active asset models or licenses.

---

## Categories

Categories classify your inventory into types like Laptops, Keyboards, Office Software, or RAM. This classification defines the behavior of items (such as whether they are requestable or require user signatures).

### Step-by-Step Instructions
1. Navigate to `/categories` from the sidebar under Settings.
2. **To Create a Category**: Click the **Create Category** button (or navigate to `/addEditCategories`).
3. Enter the **Category Name** (required). Select the **Category Type** (Asset, License, Accessory, Consumable, or Component). This type dictates how items in this category behave. Click **Submit**.
4. **To Edit**: Click the edit button on the category row, modify name or type, and click **Save**.
5. **To Filter and View**: Click on the specific category name in the list table to view all items linked to it (e.g., `/categories/asset/:id` or `/categories/accessories/:id`).

### Rules, Permissions, and Limitations
* Managing categories requires `categories.create`, `categories.edit`, or `categories.delete` permissions.
* The **Category Type** cannot be changed once the category is saved and items are linked to it.
* A category cannot be deleted if there are active items associated with it.

---

## Vendors (Suppliers)

Vendors (internally referred to as Suppliers) are the merchants, resellers, or software publishers from whom you purchase assets, licenses, and consumables. Managing vendors helps track order history and warranty channels.

### Step-by-Step Instructions
1. Navigate to `/vendors` from the sidebar under Settings.
2. **To Create a Vendor**: Click the **Create Vendor** button (or navigate to `/addEditVendors`).
3. Fill in the **Vendor Name** (required), **Address**, **City**, **State**, **Country**, **Zip** code, **Contact Name**, **Phone**, **Email**, and **URL** fields. Click **Submit**.
4. **To Edit**: Click the edit button on the vendor row, update vendor contact details, and click **Save**.
5. **To View Details**: Click the vendor name in the table to view their purchase history.

### Rules, Permissions, and Limitations
* Managing vendors requires `suppliers.create`, `suppliers.edit`, or `suppliers.delete` permissions.
* The email field must be in a valid email format, and the URL field must be a valid website link.

---

## Asset Models

Asset Models define the design and specifications of hardware items (e.g., MacBook Pro 16", Dell Latitude 7420). This avoids repetitive data entry when registering multiple identical physical hardware units.

### Step-by-Step Instructions
1. Navigate to `/assetmodels` from the sidebar under Settings.
2. **To Create an Asset Model**: Click the **Create Asset Model** button (or navigate to `/addEditAssetModels`). This opens a 2-step wizard.
   * **Step 1 (Specifications)**: Enter the **Model Name** (required). Select the **Manufacturer** and **Category** from the dropdowns (both required). Enter the **Model Number** (required). Click **Next**.
   * **Step 2 (Lifecycle & Notes)**: Select the **Depreciation** rules dropdown (required). Enter the **EOL** in months (required, numeric). Add **Notes** (required). Toggle the **Requestable** checkbox if users can request this model themselves. Click **Submit**.
3. **To Edit**: Click the edit button on the model row, update specifications, and click **Save**.
4. **To View Details**: Click on the model's name to view lists of all physical hardware assets registered under this specific model.

### Rules, Permissions, and Limitations
* Managing asset models requires `models.create`, `models.edit`, or `models.delete` permissions.
* The **EOL** (End of Life) field must be a positive integer representing the hardware lifecycle duration in months.
* An asset model cannot be deleted if physical hardware assets are still registered under it.

---

## Companies

Companies are administrative structures used to represent subsidiaries, client accounts, or distinct business divisions. They help segment hardware assets and users for reporting purposes.

### Step-by-Step Instructions
1. Navigate to `/company` from the sidebar under Settings.
2. **To Create a Company**: Click the **Create Company** button (or navigate to `/addEditCompany`).
3. Enter the **Company Name** (required). Choose an image file for the **Logo** if desired. Click **Submit**.
4. **To Edit**: Click the edit icon on the company row, update the name or logo, and click **Save**.
5. **To Delete**: Click the delete icon on the company row and confirm.

### Rules, Permissions, and Limitations
* Managing companies requires `companies.create`, `companies.edit`, or `companies.delete` permissions.
* If a company has registered assets or users linked to it, you must re-assign them before deleting the company profile.

---

## Depreciation

Depreciation defines how the value of physical assets decreases over time. It allows financial administrators to calculate book value, salvage values, and write-off intervals.

### Step-by-Step Instructions
1. Navigate to `/depreciation` from the sidebar under Settings.
2. **To Create a Depreciation Profile**: Click the **Create Depreciation** button (or navigate to `/addEditDepreciation`).
3. Enter the **Depreciation Name** (required). Enter the **Months** duration (required, numeric). Enter the **Residual Value** percentage (salvage value) that the asset retains at the end of its lifecycle. Click **Submit**.
4. **To Edit**: Click the edit button on the depreciation row, update months or residual values, and click **Save**.

### Rules, Permissions, and Limitations
* Managing depreciations requires `depreciations.create`, `depreciations.edit`, or `depreciations.delete` permissions.
* The **Months** field must be a positive integer, and the **Residual Value** must be a percentage between 0 and 100.

---

## Status Labels

Status Labels define the current operational status of physical hardware assets (e.g., Deployable, Pending, Archived, Out for Repair). They determine whether an asset can be checked out.

### Step-by-Step Instructions
1. Navigate to `/statusLabels` from the sidebar under Settings.
2. **To Create a Status Label**: Click the **Create Status Label** button (or navigate to `/addEditStatusLabels`).
3. Enter the **Label Name** (required). Select the **Status Type** (Deployable, Pending, Archived, or Undeployable). Enter a **Description** (required). Click **Submit**.
4. **To Edit**: Click the edit button on the label row, update details, and click **Save**.
5. **To View Details**: Click the status label name in the list table to view all assets assigned to that specific status.

### Rules, Permissions, and Limitations
* Managing status labels requires `statuslabels.create`, `statuslabels.edit`, or `statuslabels.delete` permissions.
* **Status Type Rules**: Only assets with a status label set to the **Deployable** type can be checked out to users, locations, or other assets.

---

## Licenses

Licenses manage software titles, seats, and product keys. The module tracks purchase agreements, license key allocations, and seat assignments.

### Step-by-Step Instructions
1. Navigate to `/license` from the sidebar.
2. **To Create a License**: Click the **Create License** button (or navigate to `/addEditLicense`). Enter details: **Software Name** (required), **Category** (required), **Seats** (total number of user allocations - required), **Manufacturer**, **Product Key** (required), **Licensed to Name**, **Licensed to Email**, **Supplier**, **Order Number**, **Purchase Cost**, **Purchase Date**, **Expiration Date**, and **Notes**. Click **Submit**.
3. **To Allocate/Checkout a Seat**: Find the license in the list, click **Checkout** (or navigate to `/checkOutLicense/:id`). Select whether to assign to a **User** or an **Asset**. Choose the target user/asset from the dropdown, specify **Checkout Date**, and click **Submit**.
4. **To Checkin a Seat**: Navigate to the license details page (`/licenseDetails/:id`), find the allocated seat list, click **Checkin** (or navigate to `/checkInLicense/:id`), enter notes, and confirm.

### Rules, Permissions, and Limitations
* Managing software licenses requires `licenses.create`, `licenses.edit`, or `licenses.delete` permissions.
* The **Seats** field must be a positive integer. You cannot check out more seats than the total licensed amount.
* Expiration alert notifications are governed by the threshold set under **License Notification** settings.

---

## Hardware (Assets)

Hardware Assets represent physical items (laptops, servers, monitors, etc.) owned by the organization. This module handles lifecycle tracking, deployment assignments, and inventory control.

### Step-by-Step Instructions
1. Navigate to `/assets` to view all assets, `/rtd` to view Ready to Deploy (Deployable) assets, `/deployed` to view checked-out assets, or `/unDeployable` to view broken/archived assets.
2. **To Register a New Asset**: Click **Create Asset** (or navigate to `/addEditListAllAsset`). This opens a 3-step wizard.
   * **Step 1 (Info)**: Enter the **Asset Name** (required), **Serial Number** (required), **Asset Model** (required dropdown), **Company** (required dropdown), **Status Label** (required dropdown), and default **Location** (required dropdown). Click **Next**.
   * **Step 2 (Financials)**: Select the **Purchase Date** (required, cannot be in the future), **Depreciation** profile, **Supplier**, **Order Number**, **Purchase Cost**, **Warranty (Months)**, and **GST** percentage. Click **Next**.
   * **Step 3 (Notes & Image)**: Upload an image file, enter **Notes**, toggle **Requestable** if desired, and click **Submit**.
3. **To Checkout an Asset**: Find a deployable asset and click the **Checkout** button (or navigate to `/checkOutDeployable/:id`). Select the target assignment type: **User** or **Location**. Choose the user/location, enter the **Checkout Date** and **Expected Checkin Date**, and click **Submit**.
4. **To Checkin an Asset**: Click **Checkin** on an active asset row (or navigate to `/checkInAssets/:id`), enter the checkin location, date, and notes, and click **Submit**.
5. **To Bulk Checkout**: Click the **Bulk Checkout** button, enter the asset tags, select the target user or location, and click **Checkout**.

### Rules, Permissions, and Limitations
* Access requires `assets.create`, `assets.edit`, `assets.delete`, `assets.checkout`, or `assets.checkin` permissions.
* Assets can only be checked out if their status label is of the **Deployable** type.
* The **Purchase Date** must not be in the future.

---

## Accessories

Accessories are peripheral equipment (e.g., keyboards, mice, chargers) tracked in bulk quantity rather than as individual serialized assets.

### Step-by-Step Instructions
1. Navigate to `/accessories` from the sidebar.
2. **To Create an Accessory**: Click the **Create Accessory** button (or navigate to `/addEditAccessories`). Fill in: **Accessory Name** (required), **Category** (required, type must be Accessory), **Quantity** (total inventory count - required), **Manufacturer**, **Supplier**, **Location**, **Model Number**, **Purchase Date**, **Purchase Cost**, and **Notes**. Click **Submit**.
3. **To Checkout an Accessory**: Click **Checkout** (or navigate to `/checkOutAccessories/:id`). Select the **User** from the dropdown, enter the checkout quantity, and click **Submit**.
4. **To Checkin an Accessory**: Go to the accessory details page, locate the checked-out user row, click **Checkin** (or navigate to `/checkInAccessories/:id/:pivotId`), and specify the quantity to return.

### Rules, Permissions, and Limitations
* Managing accessories requires `accessories.create`, `accessories.edit`, or `accessories.delete` permissions.
* Accessories are tracked by quantity. You cannot check out a quantity greater than the remaining available inventory.

---

## Consumables

Consumables are items that are used up over time (e.g., printer ink, paper, pens) and do not get returned. They are tracked by inventory count and checked out directly to users.

### Step-by-Step Instructions
1. Navigate to `/consumables` from the sidebar.
2. **To Create a Consumable**: Click the **Create Consumable** button (or navigate to `/addEditConsumables`). Fill in: **Consumable Name** (required), **Category** (required, type must be Consumable), **Quantity** (total stock count - required), **Manufacturer**, **Supplier**, **Location**, **Purchase Date**, **Purchase Cost**, and **Min. Qty** (threshold for low stock alerts). Click **Submit**.
3. **To Checkout a Consumable**: Click **Checkout** (or navigate to `/checkOutConsumables/:id`). Select the target **User** from the dropdown, enter the checkout quantity, and click **Submit**.
4. **To Search**: Type the consumable name in the search input box at the top of the list.

### Rules, Permissions, and Limitations
* Managing consumables requires `consumables.create`, `consumables.edit`, or `consumables.delete` permissions.
* Consumables are one-way distributions. There is **no checkin feature** because items are consumed.
* You cannot check out more than the available quantity in stock.

---

## Components

Components are internal hardware parts (e.g., RAM modules, hard drives, GPUs) that are installed inside parent hardware assets rather than assigned directly to users.

### Step-by-Step Instructions
1. Navigate to `/components` from the sidebar.
2. **To Create a Component**: Click the **Create Component** button (or navigate to `/addEditComponents`). Fill in: **Component Name** (required), **Category** (required, type must be Component), **Quantity** (total inventory - required), **Manufacturer**, **Supplier**, **Location**, **Serial Number**, **Purchase Date**, and **Purchase Cost**. Click **Submit**.
3. **To Install/Checkout a Component**: Click **Checkout** next to the component (or navigate to `/checkOutComponents/:id`). Select the parent **Asset** from the dropdown, enter the quantity to install, and click **Submit**.
4. **To Uninstall/Checkin a Component**: Go to the component details view (`/ComponentsDetails/:id`), locate the installed asset row, click **Checkin** (or navigate to `/checkInComponents/:id/:assignedPivotId`), specify the quantity to uninstall, and click **Submit**.

### Rules, Permissions, and Limitations
* Managing components requires `components.create`, `components.edit`, or `components.delete` permissions.
* Components can only be checked out/installed to **Hardware Assets**, not to users or locations.

---

## Asset Maintenance

Asset Maintenance tracks repairs, upgrades, calibrations, and warranty services performed on hardware assets. It logs service windows, costs, and details.

### Step-by-Step Instructions
1. Navigate to `/assetMaintenance` from the sidebar.
2. **To Create a Maintenance Record**: Click the **Create Asset Maintenance** button (or navigate to `/addEditAssetMaintenance`).
3. Select the **Asset** (required), **Maintenance Type** (Hardware Support, Software Support, Repair, Upgrade, Testing), **Supplier/Service Vendor** (required), and enter the **Start Date** (required).
4. Enter the maintenance **Title** (required), **Cost** (required), **End Date** (if maintenance is complete), and **Notes**. Click **Submit**.
5. **To Search and Sort**: Use the search input box and table column headers to filter maintenance records.

### Rules, Permissions, and Limitations
* Managing maintenance logs requires `assets.edit` or `assets.create` permissions.
* The maintenance cost must be a numeric value (0 or greater).
* If an asset is currently in maintenance, its status label should be updated to a "Pending/In Repair" type to prevent checkout attempts.

---

## Scrap Sale

The Scrap Sale module manages the disposal, decommissioning, and sale of deprecated, damaged, or end-of-life IT assets. This ensures a clean disposal log and tracks any recovery value.

### Step-by-Step Instructions
1. Navigate to `/scrapsale` from the sidebar.
2. **To Record a Scrap Sale**: Click the **Create Scrap Sale** button (or navigate to `/addEditScrapsale`).
3. Fill in: **Item Name** (required), **Item Type** (required), **Sale Date** (required), **Quantity** (required, minimum 1), **Unit Price** (required, minimum 0.01), **Buyer Name** (required), **Buyer Contact** (required), and **Remarks** (optional). Click **Submit**.
4. **To Edit**: Click the edit button on the scrap sale record row, modify the details, and click **Save**.
5. **To Delete**: Click the delete icon on the row and confirm the deletion.

### Rules, Permissions, and Limitations
* Managing scrap sales requires administrator permissions.
* The **Quantity** must be a positive integer, and the **Unit Price** must be greater than 0.

---

## Audits

Audits are inspections conducted to verify the physical presence, location, and condition of hardware assets. The Web Portal displays the history of these audits.

### Step-by-Step Instructions
1. Navigate to `/audit` from the sidebar.
2. Review the list of audited assets, which displays **Asset Tag**, **Auditor Name** (auditor's email address), **Description**, **Status**, **GPS Coordinates**, and **Present Location**.
3. **To View Audit Image**: If an image was uploaded during the audit, click on the thumbnail in the **Image** column to view the full-size image in a preview modal.
4. **To View GPS Location**: Click on the coordinates link in the **GPS** column. This will open the coordinates in Google Maps in a new tab.

### Rules, Permissions, and Limitations
* **Unclear/External Flow**: The Web Portal only acts as a log viewer and CSV exporter. There is no creation form in the web UI; audits are submitted via external API inputs or mobile client systems.
* Audits automatically set the asset's status to "Audited" on the backend and record the email address of the authenticated auditor.

---

## Ticket Issues

Ticket Issues define standard categories or problem descriptions for helpdesk tickets (e.g., "Software installation", "Hardware repair", "Network issue"). This helps classify support tickets.

### Step-by-Step Instructions
1. Navigate to `/ticketissues` from the sidebar under Admin Settings.
2. **To Create a Ticket Issue Type**: Click the **Create Ticket Issue** button (or navigate to `/addEditTicketissues`).
3. Enter the **Issue Name** (required) and **Description** (required). Click **Submit**.
4. **To Edit**: Click the edit icon next to the ticket issue, modify name or description, and click **Save**.

### Rules, Permissions, and Limitations
* Managing ticket issue types requires administrator permissions.
* These issue types populate the **Ticket Issue** dropdown during support ticket creation.

---

## HelpDesk (Tickets)

The HelpDesk module manages support requests and ticket routing. It allows users to raise technical issues, lets managers assign tickets to support staff, and allows engineers to update the ticket status.

### Step-by-Step Instructions
1. Navigate to `/tickets` from the sidebar.
2. **To Create a Ticket**: Click the **Create Ticket** button (or navigate to `/createTicket`). Fill in: **Asset Tag** (required), **Ticket Issue** (required dropdown), **Description** (required), and **Details** (required). Click **Submit**.
3. **To Assign or Update Ticket Status**: Find the ticket in the list and click the **Update Status** button (or navigate to `/updateTicketStatus/:id`). Select the new **Ticket Status** (e.g., Open, In Progress, Resolved). If setting the status to "Assigned", select an engineer from the **Assigned To** dropdown. Add a **Description** and click **Submit**.
4. **To Create a Sister Ticket**: In the **Update Status** page, if you select the status code `6` (indicating a nested dependency or separate parallel work), a **Create Ticket** modal will open to let you register a related "Sister Ticket" linked to the parent.
5. **To Filter**: Switch between the tabs: **My Tickets**, **Talent Group Tickets**, **Unassigned Tickets**, **All Tickets**, and **Closed Tickets**.
6. **Availability Status**: If you are a support engineer (User Type 1), you can toggle your **Available** status switch at the top of the tickets page to signal whether you can receive auto-assigned tickets.

### Rules, Permissions, and Limitations
* **Assigning Tickets**: Only users with Manager access (User Type 2) can see the engineer assignment fields and review the **Ticket Dashboard / Chart** tab.
* Engineers (User Type 1) can update the ticket status and log descriptions.
* Normal users can only view their own created tickets under the **My Tickets** tab.

---

## Work Status

Work Status records allow administrators to log and track the work availability or status profile of staff members.

### Step-by-Step Instructions
1. Navigate to `/workstatus` from the sidebar.
2. **To Create a Work Status Record**: Click the **Create Work Status** button (or navigate to `/addEditWorkstatus`).
3. Fill in the **Status Name** and any required details, then click **Submit**.
4. **To Edit**: Click the edit button on the work status row, update fields, and click **Save**.

### Rules, Permissions, and Limitations
* Access requires administrative settings permissions.
* Used primarily for tracking staff availability and shift scheduling.

---

## Reports

The Reports module allows administrators to export system inventory and activity history. Reports can be customized, filtered, and downloaded as CSV files.

### Step-by-Step Instructions
1. Navigate to **Reports** in the sidebar. Select the specific report type you need:
   * **Accessory Report** (`/accessoryreports`)
   * **Activity Report** (`/activityreport`)
   * **License Report** (`/licensereport`)
   * **Depreciation Report** (`/depreciationreport`)
   * **Component Report** (`/componentreport`)
   * **Consumable Report** (`/consumablereport`)
   * **Asset Report** (`/assetreport`)
2. Use the search input box at the top of the report table to filter records.
3. Click the **Export CSV** button to download the filtered dataset.

### Rules, Permissions, and Limitations
* Exporting reports requires the `reports.view` permission.
* Reports reflect real-time database values at the time of export.

---

## Branding

Branding settings allow administrators to customize the portal's look and feel, aligning the application with the client's corporate identity.

### Step-by-Step Instructions
1. Navigate to `/branding` from the sidebar under Admin Settings.
2. Enter the **Site Name** (required).
3. Select a **Brand Type** (dropdown specifying premium 3D layout options or basic themes).
4. Select a logo file in the **Upload Logo** field.
5. Click **Submit** to apply the branding parameters.

### Rules, Permissions, and Limitations
* Only users with `superuser` permissions can modify branding settings.
* Uploaded logo files must be in standard image formats (JPEG, PNG).

---

## Label Settings

Label Settings allow administrators to customize the dimensions and layout of printed asset labels and barcodes.

### Step-by-Step Instructions
1. Navigate to `/label` from the sidebar under Admin Settings.
2. Configure settings such as **Labels Per Page**, **Label Width**, **Label Height**, page margins (top, bottom, left, right), and font size.
3. Select checkbox toggles to display the **Asset Name**, **Serial Number**, or **Asset Tag** on the printed label.
4. Click **Submit** to save label templates.

### Rules, Permissions, and Limitations
* Only users with administrative setup permissions can configure label templates.
* Template changes will apply to all barcode layouts generated via `/qrpage` and `/assetQR` routes.

---

## License Notifications

License Notifications define when the system warns administrators about expiring software licenses, helping prevent service disruptions.

### Step-by-Step Instructions
1. Navigate to `/licenseNotification` from the sidebar under Admin Settings.
2. In the **No of Days** field, enter the threshold number of days before a license's expiration date to trigger alerts.
3. Enter an alert email description or warning text in the **Description** field.
4. Click **Submit** to save.

### Rules, Permissions, and Limitations
* Only administrators can edit notification thresholds.
* The system evaluates this threshold daily to send warning emails to registered administrative contacts.

---

## Talent Groups

Talent Groups group support staff based on their technical skills or specialization (e.g., Networks, Database Administrators, Desktop Support). This helps route helpdesk tickets to the correct team.

### Step-by-Step Instructions
1. Navigate to `/talentGroup` from the sidebar under Admin Settings.
2. **To Create a Talent Group**: Click the **Create Talent Group** button (or navigate to `/addEditTalentGroup`).
3. Enter a **Talent Group Name** (required) and a **Description**. Click **Submit**.
4. **To Edit**: Click the edit button next to the group row, modify name or description, and click **Save**.

### Rules, Permissions, and Limitations
* Managing talent groups requires administrative settings permissions.
* Users can be assigned to a talent group in their user profile settings. Helpdesk tickets are routed to talent groups based on the selected ticket issue type.

---

## Kits

*Note: Legacy / API-only feature.*

The Kits module allows administrators to group multiple asset models, licenses, or accessories together into a single package (a "kit"). This allows you to check out multiple items to a user in a single action (e.g., an "Onboarding Kit" containing a laptop, keyboard, mouse, and office software license).

### Step-by-Step Instructions
1. **Unclear/External Flow**: There is currently no user interface page in the web frontend portal to manage kits. 
2. The backend database tables (`kits`, `kit_models`) and REST API routes (`/api/v1/kits`, `/api/v1/kits/models`) support full CRUD operations (creating, updating, deleting kits, and assigning models and quantities to kits) for external integrations.

### Rules, Permissions, and Limitations
* Only accessible via direct API requests by authenticated users with the `kits.view`, `kits.create`, `kits.edit`, or `kits.delete` permissions.

---

## Custom Fields

*Note: Legacy / API-only feature.*

Custom Fields and Fieldsets allow you to add custom database attributes to asset models. This allows you to track additional specifications (e.g., RAM size, CPU speed) that are not included by default.

### Step-by-Step Instructions
1. **Unclear/External Flow**: There is currently no custom fields builder interface in the web frontend portal.
2. The backend database tables (`custom_fields`, `custom_fieldsets`, `custom_field_custom_fieldset`) and REST API routes (`/api/v1/settings/customFields`, `/api/v1/settings/customFieldsets`) support full CRUD operations for database customization by external developers.

### Rules, Permissions, and Limitations
* Direct API actions are restricted to users with `customfields.view`, `customfields.create`, `customfields.edit`, or `customfields.delete` permissions.

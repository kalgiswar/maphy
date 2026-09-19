import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { React, Suspense } from "react";
import Layout from "./Components/Layout";
import Login from "./Components/Login";
// import Registration from "./Components/Registration";
import Dashboard from "./Components/Dashboard";
import QR from "./Common/QR";
import AssetQR from "./Common/QRAsset";
import ForgotPassword from "./Common/changepassword";
import Chatbot from "./Components/Chatbot/Chatbot";
import Manufactures from "./Components/Settings/Manufacturers";
import AddEditManufactures from "./Components/Settings/Manufacturers/addEditManufactures";
import ManufacturersDetails from "./Components/Settings/Manufacturers/manufacturersDetails";

import License from "./Components/License";
import AddEditLicense from "./Components/License/addEditLicense";
import LicenseDetails from "./Components/License/licenseDetails";
import LicenseCheckout from "./Components/License/checkout";
import LicenseCheckin from "./Components/License/checkin";

import Components from "./Components/Components";
import AddEditComponents from "./Components/Components/addEditComponents";
import CheckOutComponents from "./Components/Components/checkOutComponents";
import CheckInComponents from "./Components/Components/checkInComponents";
import ComponentsDetails from "./Components/Components/componentsDetails";
import ComponentsCategory from "./Components/Components/componentsCategory";

import Consumables from "./Components/Consumables";
import AddEditConsumables from "./Components/Consumables/addEditConsumables";
import CheckOutConsumables from "./Components/Consumables/checkOutConsumables";
import ConsumablesDetails from "./Components/Consumables/consumablesDetails";
import ConsumablesCategory from "./Components/Consumables/consumablesCategory";

import Categories from "./Components/Settings/Categories";
import AddEditCategories from "./Components/Settings/Categories/addEditCategories";
import CategoriesAccessories from "./Components/Settings/Categories/categoriesAccessories";
import CategoriesAsset from "./Components/Settings/Categories/categoriesAsset";
import CategoriesLicense from "./Components/Settings/Categories/categoriesLicense";
import CategoriesConsumables from "./Components/Settings/Categories/categoriesConsumables";
import CategoriesComponents from "./Components/Settings/Categories/categoriesComponents";

import Vendors from "./Components/Settings/Vendors";
import AddEditVendors from "./Components/Settings/Vendors/addEditVendors";
import VendorsDetails from "./Components/Settings/Vendors/vendorsdetails";

import Department from "./Components/Settings/Department";
import AddEditDepartment from "./Components/Settings/Department/addEditDepartment";
import DepartmentDetails from "./Components/Settings/Department/Departmentdetails";

import AssetModels from "./Components/Settings/AssetModels";
import AddAssetModels from "./Components/Settings/AssetModels/addEditAssetmodels";
import AssetModalDetails from "./Components/Settings/AssetModels/assetModelDetails";

import Company from "./Components/Settings/Company";
import AddEditCompany from "./Components/Settings/Company/addEditCompany";
import CompanyDetails from "./Components/Settings/Company/companiesDetails";

import Depreciation from "./Components/Settings/Depreciation";
import AddEditDepreciation from "./Components/Settings/Depreciation/addEditDepreciation";

import Location from "./Components/Settings/Location";
import AddEditLocation from "./Components/Settings/Location/addEditLocation";
import LocationDetails from "./Components/Settings/Location/locationDetails";
import AssignedTo from "./Components/Settings/Location/locationAssetsAssignedTo";

import StatusLabels from "./Components/Settings/StatusLabels";
import AddEditStatusLabels from "./Components/Settings/StatusLabels/addEditStatus";
import StatusLabelsDetails from "./Components/Settings/StatusLabels/statusLabelDetails";

import Accessories from "./Components/Accessories";
import AddEditAccessories from "./Components/Accessories/addEditAccessories";
import CategoryAccessory from "./Components/Accessories/categoryaccessory";
import CheckOutAccessories from "./Components/Accessories/checkOutAccessories";
import AccessoriesDetails from "./Components/Accessories/accessoriesdetails";
import CheckInAccessories from "./Components/Accessories/checkInAccessories";

import ListAllAsset from "./Components/Assets/ListAllAssetIndex";
import AddEditListAllAsset from "./Components/Assets/addEditDeployments";
import AddEditDeployments from "./Components/Assets/addEditDeployments";
import Deployable from "./Components/Assets/Deploymentsindex";
import CheckOutDeployable from "./Components/Assets/checkOut";
import Deployed from "./Components/Assets/Deploymentsindex";
import UnDeployable from "./Components/Assets/Deploymentsindex";
import AssetMaintenance from "./Components/Assets/assetMaintenanceIndex";
import AddEditAssetMaintenance from "./Components/Assets/addEditAssetMaintenance";
import BulkCheckout from "./Components/Assets/bulkcheckout";
import Checkin from "./Components/Assets/checkIn";
import AssetDetails from "./Components/Assets/assetDetails";
import PendingAgentAssets from "./Components/Assets/PendingAgentAssets";

import WorkStatus from "./Components/WorkStatus";
import AddEditWorkStatus from "./Components/WorkStatus/addEditWorkstatus";

import Accessoryreports from "./Components/Reports/accessoryreports";
import Activityreports from "./Components/Reports/activityreport";
import Lisencereport from "./Components/Reports/licensereport";
import Depreciationreport from "./Components/Reports/depreciationreport";
import Componentreport from "./Components/Reports/componentreport";
import Consumablereport from "./Components/Reports/consumablereport";
import Assetreport from "./Components/Reports/assetreport";

import Peoples from "./Components/People";
import AddEditPeoples from "./Components/People/addEditpeople";
import PeopleDetails from "./Components/People/peopleDetails";

import Audit from "./Components/Audit";

import AdminSettings from "./Components/AdminSettings/adminsetting";
import Branding from "./Components/AdminSettings/Branding/branding";
import Groups from "./Components/AdminSettings/Groups/index";
import TicketIssues from "./Components/AdminSettings/Ticketissues/index";
import AddEditGroups from "./Components/AdminSettings/Groups/addEditgroups";
import AddEditTicketIssues from "./Components/AdminSettings/Ticketissues/addEditTicketIssues";
import Label from "./Components/AdminSettings/Label/label";
import LicenseNotification from "./Components/AdminSettings/LicenseNotification/licenseNotification";
import TalentGroup from "./Components/AdminSettings/TalentGroup";
import AddEditTalentGroup from "./Components/AdminSettings/TalentGroup/addEditTalentGroup";

import Tickets from "./Components/HelpDesk";
import CreateTickets from "./Components/HelpDesk/createTicket";
import UpdateTickets from "./Components/HelpDesk/updateTickets";
import TicketDetails from "./Components/HelpDesk/ticketDetails";
import UpdateTicketStatus from "./Components/HelpDesk/updateTicketStatus";
import TicketByStatus from "./Components/HelpDesk/ticketByStatus";

import Scrap from "./Components/Scrapsale";
import AddEditScrapsale from "./Components/Scrapsale/addEditScrapsale";

import Organizations from "./Components/Organizations";
import AddEditOrganization from "./Components/Organizations/addEditOrganization";
import OrganizationDetails from "./Components/Organizations/organizationDetails";

// import StartURL from "./Components/StartUrl/starturl";

import "./i18n";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("maphytoken");
  return token ? children : <Navigate to="/Login" />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true, // This will match the path "/"
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: "Dashboard",
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: "organizations",
        element: (
          <PrivateRoute>
            <Organizations />
          </PrivateRoute>
        ),
      },
      {
        path: "organizations/create",
        element: (
          <PrivateRoute>
            <AddEditOrganization />
          </PrivateRoute>
        ),
      },
      {
        path: "organizations/:id",
        element: (
          <PrivateRoute>
            <OrganizationDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "organizations/:orgId/users/create",
        element: (
          <PrivateRoute>
            <AddEditPeoples />
          </PrivateRoute>
        ),
      },
      {
        path: "organizations/:orgId/groups/create",
        element: (
          <PrivateRoute>
            <AddEditGroups />
          </PrivateRoute>
        ),
      },
      {
        path: "organizations/:orgId/groups/edit/:id",
        element: (
          <PrivateRoute>
            <AddEditGroups />
          </PrivateRoute>
        ),
      },
      {
        path: "manufactures",
        element: (
          <PrivateRoute>
            <Manufactures />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditManufactures",
        element: (
          <PrivateRoute>
            <AddEditManufactures />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditManufactures/:id",
        element: (
          <PrivateRoute>
            <AddEditManufactures />
          </PrivateRoute>
        ),
      },
      {
        path: "manufacturersDetails/:id",
        element: (
          <PrivateRoute>
            <ManufacturersDetails />
          </PrivateRoute>
        ),
      },

      {
        path: "categories",
        element: (
          <PrivateRoute>
            <Categories />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditCategories",
        element: (
          <PrivateRoute>
            <AddEditCategories />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditCategories/:id",
        element: (
          <PrivateRoute>
            <AddEditCategories />
          </PrivateRoute>
        ),
      },
      {
        path: "/categories/accessories/:id",
        element: (
          <PrivateRoute>
            <CategoriesAccessories />
          </PrivateRoute>
        ),
      },
      {
        path: "/categories/asset/:id",
        element: (
          <PrivateRoute>
            <CategoriesAsset />
          </PrivateRoute>
        ),
      },
      {
        path: "/categories/licenses/:id",
        element: (
          <PrivateRoute>
            <CategoriesLicense />
          </PrivateRoute>
        ),
      },
      {
        path: "/categories/consumables/:id",
        element: (
          <PrivateRoute>
            <CategoriesConsumables />
          </PrivateRoute>
        ),
      },
      {
        path: "/categories/components/:id",
        element: (
          <PrivateRoute>
            <CategoriesComponents />
          </PrivateRoute>
        ),
      },
      {
        path: "vendors",
        element: (
          <PrivateRoute>
            <Vendors />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditVendors",
        element: (
          <PrivateRoute>
            <AddEditVendors />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditVendors/:id",
        element: (
          <PrivateRoute>
            <AddEditVendors />
          </PrivateRoute>
        ),
      },
      {
        path: "/vendorsdetails/:id",
        element: (
          <PrivateRoute>
            <VendorsDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "department",
        element: (
          <PrivateRoute>
            <Department />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditDepartment/:id",
        element: (
          <PrivateRoute>
            <AddEditDepartment />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditDepartment",
        element: (
          <PrivateRoute>
            <AddEditDepartment />
          </PrivateRoute>
        ),
      },
      {
        path: "/departmentdetails/:id",
        element: (
          <PrivateRoute>
            <DepartmentDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "departmentdetails/:id/:name",
        element: (
          <PrivateRoute>
            <DepartmentDetails />
          </PrivateRoute>
        ),
      },

      {
        path: "location",
        element: (
          <PrivateRoute>
            <Location />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditlocation/:id",
        element: (
          <PrivateRoute>
            <AddEditLocation />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditlocation",
        element: (
          <PrivateRoute>
            <AddEditLocation />
          </PrivateRoute>
        ),
      },
      {
        path: "/locationDetails/:id",
        element: (
          <PrivateRoute>
            <LocationDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "/assignedTo/:id",
        element: (
          <PrivateRoute>
            <AssignedTo />
          </PrivateRoute>
        ),
      },
      {
        path: "assetmodels",
        element: (
          <PrivateRoute>
            <AssetModels />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditAssetModels/:id",
        element: (
          <PrivateRoute>
            <AddAssetModels />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditAssetModels",
        element: (
          <PrivateRoute>
            <AddAssetModels />
          </PrivateRoute>
        ),
      },
      {
        path: "assetmodels/details/:id",
        element: (
          <PrivateRoute>
            <AssetModalDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "company",
        element: (
          <PrivateRoute>
            <Company />
          </PrivateRoute>
        ),
      },
      {
        path: "companiesDetails/:id",
        element: (
          <PrivateRoute>
            <CompanyDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditCompany/:id",
        element: (
          <PrivateRoute>
            <AddEditCompany />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditCompany",
        element: (
          <PrivateRoute>
            <AddEditCompany />
          </PrivateRoute>
        ),
      },

      {
        path: "license",
        element: (
          <PrivateRoute>
            <License />
          </PrivateRoute>
        ),
      },
      {
        path: "License/expired",
        element: (
          <PrivateRoute>
            <License />
          </PrivateRoute>
        ),
      },
      {
        path: "License/goingToExpired",
        element: (
          <PrivateRoute>
            <License />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditLicense",
        element: (
          <PrivateRoute>
            <AddEditLicense />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditLicense/:id",
        element: (
          <PrivateRoute>
            <AddEditLicense />
          </PrivateRoute>
        ),
      },
      {
        path: "licenseDetails/:id",
        element: (
          <PrivateRoute>
            <LicenseDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "checkOutLicense/:id",
        element: (
          <PrivateRoute>
            <LicenseCheckout />
          </PrivateRoute>
        ),
      },
      {
        path: "checkInLicense/:id",
        element: (
          <PrivateRoute>
            <LicenseCheckin />
          </PrivateRoute>
        ),
      },
      {
        path: "depreciation",
        element: (
          <PrivateRoute>
            <Depreciation />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditDepreciation",
        element: (
          <PrivateRoute>
            <AddEditDepreciation />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditDepreciation/:id",
        element: (
          <PrivateRoute>
            <AddEditDepreciation />
          </PrivateRoute>
        ),
      },
      {
        path: "statusLabels",
        element: (
          <PrivateRoute>
            <StatusLabels />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditStatusLabels",
        element: (
          <PrivateRoute>
            <AddEditStatusLabels />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditStatusLabels/:id",
        element: (
          <PrivateRoute>
            <AddEditStatusLabels />
          </PrivateRoute>
        ),
      },
      {
        path: "/statuslabelsdetails/:id",
        element: (
          <PrivateRoute>
            <StatusLabelsDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "components",
        element: (
          <PrivateRoute>
            <Components />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditComponents",
        element: (
          <PrivateRoute>
            <AddEditComponents />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditComponents/:id",
        element: (
          <PrivateRoute>
            <AddEditComponents />
          </PrivateRoute>
        ),
      },
      {
        path: "/checkOutComponents/:id",
        element: (
          <PrivateRoute>
            <CheckOutComponents />
          </PrivateRoute>
        ),
      },
      {
        path: "/checkInComponents/:id/:assignedPivotId",
        element: (
          <PrivateRoute>
            <CheckInComponents />
          </PrivateRoute>
        ),
      },
      {
        path: "/ComponentsDetails/:id",
        element: (
          <PrivateRoute>
            <ComponentsDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "componentsDetails",
        element: (
          <PrivateRoute>
            <ComponentsDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "/componentsCategory/:categoryId",
        element: (
          <PrivateRoute>
            <ComponentsCategory />
          </PrivateRoute>
        ),
      },
      {
        path: "accessories",
        element: (
          <PrivateRoute>
            <Accessories />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditAccessories",
        element: (
          <PrivateRoute>
            <AddEditAccessories />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditAccessories/:id",
        element: (
          <PrivateRoute>
            <AddEditAccessories />
          </PrivateRoute>
        ),
      },
      {
        path: "/categoryaccessory/:categoryId",
        element: (
          <PrivateRoute>
            <CategoryAccessory />
          </PrivateRoute>
        ),
      },
      {
        path: "/checkOutAccessories/:id",
        element: (
          <PrivateRoute>
            <CheckOutAccessories />
          </PrivateRoute>
        ),
      },
      {
        path: "/accessoriesdetails/:id",
        element: (
          <PrivateRoute>
            <AccessoriesDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "accessoriesdetails/:id/:name",
        element: (
          <PrivateRoute>
            <AccessoriesDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "/checkInAccessories/:id/:assigned_pivot_id",
        element: (
          <PrivateRoute>
            <CheckInAccessories />
          </PrivateRoute>
        ),
      },
      {
        path: "assets",
        element: (
          <PrivateRoute>
            <ListAllAsset />
          </PrivateRoute>
        ),
      },
      {
        path: "/assets/pending-agent",
        element: (
          <PrivateRoute>
            <PendingAgentAssets />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditListAllAsset",
        element: (
          <PrivateRoute>
            <AddEditListAllAsset />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditListAllAsset/:id",
        element: (
          <PrivateRoute>
            <AddEditListAllAsset />
          </PrivateRoute>
        ),
      },
      {
        path: "consumables",
        element: (
          <PrivateRoute>
            <Consumables />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditConsumables",
        element: (
          <PrivateRoute>
            <AddEditConsumables />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditConsumables/:id",
        element: (
          <PrivateRoute>
            <AddEditConsumables />
          </PrivateRoute>
        ),
      },
      {
        path: "/checkOutConsumables/:id",
        element: (
          <PrivateRoute>
            <CheckOutConsumables />
          </PrivateRoute>
        ),
      },
      {
        path: "/consumablesDetails/:id",
        element: (
          <PrivateRoute>
            <ConsumablesDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "/consumablesCategory/:categoryId",
        element: (
          <PrivateRoute>
            <ConsumablesCategory />
          </PrivateRoute>
        ),
      },
      {
        path: "rtd",
        element: (
          <PrivateRoute>
            <Deployable />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditDeployments/:id",
        element: (
          <PrivateRoute>
            <AddEditDeployments />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditDeployments",
        element: (
          <PrivateRoute>
            <AddEditDeployments />
          </PrivateRoute>
        ),
      },
      {
        path: "/checkOutDeployable/:id",
        element: (
          <PrivateRoute>
            <CheckOutDeployable />
          </PrivateRoute>
        ),
      },
      {
        path: "deployed",
        element: (
          <PrivateRoute>
            <Deployed />
          </PrivateRoute>
        ),
      },
      {
        path: "/checkInAssets/:id",
        element: (
          <PrivateRoute>
            <Checkin />
          </PrivateRoute>
        ),
      },
      {
        path: "unDeployable",
        element: (
          <PrivateRoute>
            <UnDeployable />
          </PrivateRoute>
        ),
      },
      {
        path: "assetMaintenance",
        element: (
          <PrivateRoute>
            <AssetMaintenance />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditAssetMaintenance",
        element: (
          <PrivateRoute>
            <AddEditAssetMaintenance />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditAssetMaintenance/:id",
        element: (
          <PrivateRoute>
            <AddEditAssetMaintenance />
          </PrivateRoute>
        ),
      },
      {
        path: "bulkcheckout",
        element: (
          <PrivateRoute>
            <BulkCheckout />
          </PrivateRoute>
        ),
      },
      {
        path: "/assetDetails/:id",
        element: (
          <PrivateRoute>
            <AssetDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "workstatus",
        element: (
          <PrivateRoute>
            <WorkStatus />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditPeoples",
        element: (
          <PrivateRoute>
            <AddEditPeoples />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditWorkstatus",
        element: (
          <PrivateRoute>
            <AddEditWorkStatus />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditWorkstatus/:id",
        element: (
          <PrivateRoute>
            <AddEditWorkStatus />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditPeoples/:id",
        element: (
          <PrivateRoute>
            <AddEditPeoples />
          </PrivateRoute>
        ),
      },
      {
        path: "/peopleDetails/:id",
        element: (
          <PrivateRoute>
            <PeopleDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "peoples",
        element: (
          <PrivateRoute>
            <Peoples />
          </PrivateRoute>
        ),
      },
      {
        path: "accessoryreports",
        element: (
          <PrivateRoute>
            <Accessoryreports />
          </PrivateRoute>
        ),
      },
      {
        path: "activityreport",
        element: (
          <PrivateRoute>
            <Activityreports />
          </PrivateRoute>
        ),
      },
      {
        path: "licensereport",
        element: (
          <PrivateRoute>
            <Lisencereport />
          </PrivateRoute>
        ),
      },
      {
        path: "depreciationreport",
        element: (
          <PrivateRoute>
            <Depreciationreport />
          </PrivateRoute>
        ),
      },
      {
        path: "componentreport",
        element: (
          <PrivateRoute>
            <Componentreport />
          </PrivateRoute>
        ),
      },
      {
        path: "consumablereport",
        element: (
          <PrivateRoute>
            <Consumablereport />
          </PrivateRoute>
        ),
      },
      {
        path: "assetreport",
        element: (
          <PrivateRoute>
            <Assetreport />
          </PrivateRoute>
        ),
      },
      {
        path: "audit",
        element: (
          <PrivateRoute>
            <Audit />
          </PrivateRoute>
        ),
      },
      {
        path: "adminsetting",
        element: (
          <PrivateRoute>
            <AdminSettings />
          </PrivateRoute>
        ),
      },
      {
        path: "ticketissues",
        element: (
          <PrivateRoute>
            <TicketIssues />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditTicketissues",
        element: (
          <PrivateRoute>
            <AddEditTicketIssues />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditTicketissues/:id",
        element: (
          <PrivateRoute>
            <AddEditTicketIssues />
          </PrivateRoute>
        ),
      },
      {
        path: "branding",
        element: (
          <PrivateRoute>
            <Branding />
          </PrivateRoute>
        ),
      },

      {
        path: "groups",
        element: (
          <PrivateRoute>
            <Groups />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditgroups",
        element: (
          <PrivateRoute>
            <AddEditGroups />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditgroups/:id",
        element: (
          <PrivateRoute>
            <AddEditGroups />
          </PrivateRoute>
        ),
      },

      {
        path: "label",
        element: (
          <PrivateRoute>
            <Label />
          </PrivateRoute>
        ),
      },
      {
        path: "licenseNotification",
        element: (
          <PrivateRoute>
            <LicenseNotification />
          </PrivateRoute>
        ),
      },
      {
        path: "talentGroup",
        element: (
          <PrivateRoute>
            <TalentGroup />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditTalentGroup/:id",
        element: (
          <PrivateRoute>
            <AddEditTalentGroup />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditTalentGroup",
        element: (
          <PrivateRoute>
            <AddEditTalentGroup />
          </PrivateRoute>
        ),
      },
      {
        path: "tickets",
        element: (
          <PrivateRoute>
            <Tickets />
          </PrivateRoute>
        ),
      },
      {
        path: "createTicket",
        element: (
          <PrivateRoute>
            <CreateTickets />
          </PrivateRoute>
        ),
      },
      {
        path: "/updateTicket/:id",
        element: (
          <PrivateRoute>
            <UpdateTickets />
          </PrivateRoute>
        ),
      },
      {
        path: "/ticketDetails/:id",
        element: (
          <PrivateRoute>
            <TicketDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "/updateTicketStatus/:id",
        element: (
          <PrivateRoute>
            <UpdateTicketStatus />
          </PrivateRoute>
        ),
      },
      {
        path: "ticketByStatus",
        element: (
          <PrivateRoute>
            <TicketByStatus />
          </PrivateRoute>
        ),
      },
      {
        path: "forgotPassword",
        element: (
          <PrivateRoute>
            <ForgotPassword />
          </PrivateRoute>
        ),
      },
      {
        path: "scrapsale",
        element: (
          <PrivateRoute>
            <Scrap />
          </PrivateRoute>
        ),
      },
      {
        path: "addEditScrapsale",
        element: (
          <PrivateRoute>
            <AddEditScrapsale />
          </PrivateRoute>
        ),
      },
      {
        path: "/addEditScrapsale/:id",
        element: (
          <PrivateRoute>
            <AddEditScrapsale />
          </PrivateRoute>
        ),
      },
      // {
      //   path: "starturl",
      //   element: (
      //     <PrivateRoute>
      //       <StartURL />
      //     </PrivateRoute>
      //   ),
      // },
    ],
  },

  {
    path: "/login",
    element: <Login />,
  },
  // {
  //   path: "/registration",
  //   element: <Registration />,
  // },
  // {
  //   path: "*",
  //   element: <Navigate to="/registration" />,
  // },
  {
    path: "/qrpage",
    element: <QR />,
  },
  {
    path: "/assetQR",
    element: <AssetQR />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default function WrappedApp() {
  return (
    <Suspense fallback="...loading">
      <App />
    </Suspense>
  );
}

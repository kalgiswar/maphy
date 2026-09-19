import React, { useEffect, useState } from "react";
import { Tab, Tabs, Table, Button } from "react-bootstrap";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { common } from "../../Common/common";
import { useTranslation } from "react-i18next";
import CustomPagination from "../../Common/pagination";
import AlertModal from "../../Common/NotificationModal";
import Dropdown from "react-bootstrap/Dropdown";

const TabsComponent = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const Domain = process.env.REACT_APP_API_URL;
  const [licenseDetails, setLicenseDetails] = useState([]);
  const { rowData, activeTab } = location.state || {};

  useEffect(() => {
    if (rowData) setLicenseDetails(rowData);
    else {
      const url = `${Domain}/licenses/${id}`;
      axios
        .get(url)
        .then((response) => {
          setLicenseDetails(response?.data);
        })
        .catch((error) => {
          common.notify("E", error);
        });
    }
  }, []);

  return (
    <>
      <div className="title d-flex justify-content-between">
        <div>
          <h1>
            {t("license.License")} - {rowData?.name}
          </h1>
        </div>
        <div className="d-flex align-items-center">
          <Dropdown className="mr-1 small-btn">
            <Dropdown.Toggle variant="outline-primary" id="location">
              {t("button.actions")}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => navigate("/addEditLicense")}
                >
                  {t("license.createlicense")}
                </button>
              </Dropdown.Item>
              <Dropdown.Item>
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => navigate(`/addEditLicense/${id}`)}
                >
                  {t("license.updatelicense")}
                </button>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button
            className="primary px-4"
            type="button"
            onClick={() => navigate("/license")}
          >
            {t("button.back")}
          </Button>
        </div>
      </div>
      <Tabs
        defaultActiveKey={activeTab ? activeTab : "details"}
        id="uncontrolled-tab-example"
        className="tab mb-12"
      >
        <Tab eventKey="details" title="Details">
          <Details licenseDetails={licenseDetails} id={id} />
        </Tab>
        <Tab eventKey="seats" title="Seats">
          <Seats licenseDetails={licenseDetails} id={id} />
        </Tab>
      </Tabs>
    </>
  );
};

const Seats = ({ licenseDetails, id }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [sizePerPage, setSizePerPage] = useState(10);
  const [offset, setOffset] = useState("0");
  const searchText = "";
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("id");
  const [currentPage, setCurrentPage] = useState(1);
  const [checkoutId, setCheckoutId] = useState();
  const [checkinId, setCheckinId] = useState();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const Domain = process.env.REACT_APP_API_URL;

  useEffect(() => {
    getDetails();
  }, [currentPage, sizePerPage, sortField, sortOrder]);

  const handlePageChange = (page) => {
    const offset = (page - 1) * sizePerPage;
    setOffset(offset);
    setCurrentPage(page);
  };

  const handlePageSizeChange = (pageSize) => {
    setSizePerPage(pageSize);
  };

  const getDetails = async () => {
    var url =
      Domain +
      `/licenses/${id}/seats?limit=${
        sizePerPage ? sizePerPage : 10
      }&offset=${offset}&search=${
        searchText ? searchText : ""
      }&sort=${sortField}&order=${sortOrder}&type=all`;
    await axios
      .get(url)
      .then((response) => {
        setData(response?.data?.rows);
        const totalPages = Math.ceil(response?.data?.total / sizePerPage);
        setTotalPages(totalPages);
      })
      .catch(function (response) {
        //handle error
        common.notify("E", response);
      });
  };

  const onTableChange = (filedname) => {
    setSortField(filedname);
    setSortOrder(setSortOrder === "asc" ? "desc" : "asc");
  };

  const handleCheckOut = (items) => {
    setCheckoutId(items?.id);
    setShowCheckoutModal(true);
  };
  const handleCheckIn = (id) => {
    setCheckinId(id);
    setShowCheckinModal(true);
  };

  const confirmCheckOut = () => {
    setShowCheckoutModal(false);
    navigate(`/checkOutLicense/${checkoutId}`, {
      state: { rowData: licenseDetails },
    });
  };

  const confirmCheckIn = () => {
    setShowCheckinModal(false);
    navigate(`/checkInLicense/${checkinId}`, {
      state: { rowData: licenseDetails },
    });
  };
  const handleCloseCheckoutModal = (e) => {
    e.preventDefault();
    setShowCheckoutModal(false);
  };

  const handleCloseCheckinModal = (e) => {
    e.preventDefault();
    setShowCheckinModal(false);
  };

  return (
    <div className="dataTable wrapper">
      <div className="d-flex justify-content-between">
        <div className="my-3"></div>
      </div>
      <Table>
        <thead>
          <tr>
            <th onClick={() => onTableChange("license")}>
              {t("license.seat")}
            </th>
            <th> {t("license.user")}</th>
            <th> {t("license.asset")} </th>
            <th> {t("license.checkinout")} </th>
          </tr>
        </thead>
        <tbody>
          {data?.length > 0 ? (
            data.map((items, index) => (
              <tr key={index}>
                <td>{items?.name}</td>
                <td>{items?.assigned_user?.name}</td>
                <td>{items?.assigned_asset?.name}</td>

                <td>
                  {Object.keys(items.assigned_user).length === 0 &&
                  Object.keys(items.assigned_asset).length === 0 ? (
                    <div>
                      <Button onClick={() => handleCheckOut(items)}>
                        {t("button.checkout")}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Button
                        onClick={() => handleCheckIn(items?.id)}
                        disabled={items.reassignable == 0}
                      >
                        {t("button.checkin")}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" align="center">
                {t("alert.nodatafound")}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {totalPages > 0 && (
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={sizePerPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <AlertModal
        onClick={confirmCheckIn}
        show={showCheckinModal}
        handleClose={handleCloseCheckinModal}
        modalType="checkin"
      ></AlertModal>
      <AlertModal
        onClick={confirmCheckOut}
        show={showCheckoutModal}
        handleClose={handleCloseCheckoutModal}
        modalType="checkout"
      ></AlertModal>
    </div>
  );
};

const Details = ({ licenseDetails }) => {
  const { t } = useTranslation();
  return (
    <div className="dataTable wrapper">
      <table className="medium-table">
        <tbody>
          <tr className="border-para">
            <td className="right-cell">{t("license.manufacturer")}</td>
            <td className="right-cell">{licenseDetails?.manufacturer?.name}</td>
          </tr>
          <tr>
            <td className="right-cell">{t("license.serial")}</td>
            <td className="right-cell">{licenseDetails?.product_key}</td>
          </tr>
          <tr className="border-para">
            <td className="right-cell">{t("license.category_id")}</td>
            <td className="right-cell">{licenseDetails?.category?.name}</td>
          </tr>
          <tr>
            <td className="right-cell">{t("license.license_name")}</td>
            <td className="right-cell">{licenseDetails?.license_name}</td>
          </tr>
          <tr className="border-para">
            <td className="right-cell">{t("license.license_email")}</td>
            <td className="right-cell">{licenseDetails?.license_email}</td>
          </tr>
          <tr>
            <td className="right-cell">{t("license.supplier")}</td>
            <td className="right-cell">{licenseDetails?.supplier?.name}</td>
          </tr>
          <tr className="border-para">
            <td className="right-cell">{t("license.expiration_date")}</td>
            <td className="right-cell">
              {licenseDetails?.expiration_date?.formatted}
            </td>
          </tr>
          <tr>
            <td className="right-cell">{t("license.termination_date")}</td>
            <td className="right-cell">
              {licenseDetails?.termination_date?.formatted}
            </td>
          </tr>
          <tr className="border-para">
            <td className="right-cell">{t("license.purchase_date")}</td>
            <td className="right-cell">
              {licenseDetails?.purchase_date?.formatted}
            </td>
          </tr>
          <tr>
            <td className="right-cell">{t("license.purchase_cost")}</td>
            <td className="right-cell">{licenseDetails?.purchase_cost}</td>
          </tr>
          <tr className="border-para">
            <td className="right-cell">{t("license.order_number")}</td>
            <td className="right-cell">{licenseDetails?.order_number}</td>
          </tr>
          <tr>
            <td className="right-cell">{t("license.seats")}</td>
            <td className="right-cell">{licenseDetails?.seats}</td>
          </tr>
          <tr className="border-para">
            <td className="right-cell">{t("license.reassignable")}</td>
            <td className="right-cell">{licenseDetails?.reassignable}</td>
          </tr>
          <tr>
            <td className="right-cell">{t("license.notes")}</td>
            <td className="right-cell">{licenseDetails?.notes}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
export default TabsComponent;

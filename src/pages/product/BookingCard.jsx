import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { 
  Input, InputNumber, Button, Radio, Checkbox, Divider, 
  message, Row, Col, DatePicker, Select, Upload, Collapse 
} from "antd";
import { UploadOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import API from "../../api/api";
import "../product/componenets/TripDetails.css";
import Navbar from "../../components/common/Navbar";

const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

const BookingCard = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [countryCodes, setCountryCodes] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,cca2');
        const data = await response.json();
        const processedCountries = data
          .map(country => ({
            name: country.name.common,
            code: country.cca2,
            dialCode: country.idd?.root + (country.idd?.suffixes?.[0] || '')
          }))
          .filter(country => country.name && country.dialCode)
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(processedCountries);
        const codes = processedCountries
          .map(country => ({ value: country.dialCode, label: `${country.dialCode} (${country.name})` }))
          .sort((a, b) => a.value.localeCompare(b.value));
        setCountryCodes(codes);
      } catch (error) {
        console.error('Error fetching countries:', error);
        message.error('Failed to load country data. Using default list.');
        const fallbackCountries = [
          { name: "India", code: "IN", dialCode: "+91" },
          { name: "United States", code: "US", dialCode: "+1" },
          { name: "United Kingdom", code: "GB", dialCode: "+44" },
          { name: "Australia", code: "AU", dialCode: "+61" },
          { name: "Canada", code: "CA", dialCode: "+1" },
          { name: "UAE", code: "AE", dialCode: "+971" },
          { name: "Singapore", code: "SG", dialCode: "+65" },
          { name: "Malaysia", code: "MY", dialCode: "+60" },
          { name: "Thailand", code: "TH", dialCode: "+66" },
          { name: "Sri Lanka", code: "LK", dialCode: "+94" },
          { name: "Nepal", code: "NP", dialCode: "+977" },
          { name: "Bangladesh", code: "BD", dialCode: "+880" },
          { name: "Pakistan", code: "PK", dialCode: "+92" },
          { name: "Germany", code: "DE", dialCode: "+49" },
          { name: "France", code: "FR", dialCode: "+33" },
          { name: "Japan", code: "JP", dialCode: "+81" },
          { name: "China", code: "CN", dialCode: "+86" },
          { name: "South Korea", code: "KR", dialCode: "+82" },
          { name: "New Zealand", code: "NZ", dialCode: "+64" },
          { name: "Saudi Arabia", code: "SA", dialCode: "+966" },
        ].sort((a, b) => a.name.localeCompare(b.name));
        setCountries(fallbackCountries);
        const fallbackCodes = fallbackCountries
          .map(c => ({ value: c.dialCode, label: `${c.dialCode} (${c.name})` }))
          .filter((c, i, self) => i === self.findIndex(x => x.value === c.value))
          .sort((a, b) => a.value.localeCompare(b.value));
        setCountryCodes(fallbackCodes);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 992);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const adultCount = location.state?.adultCount ?? 1;
  const childCount = location.state?.childCount ?? 0;
  const totalPrice = location.state?.totalPrice ?? 0;
  const tourTitle = location.state?.tourTitle ?? "";
  const checkInDate = location.state?.checkInDate ?? "";
  const checkOutDate = location.state?.checkOutDate ?? "";
  const selectedLocation = location.state?.location ?? "";
  const selectedLocationData = location.state?.selectedLocationData ?? null;
  const tourData = location.state?.tourData ?? null;
  const searchResults = location.state?.searchResults ?? null;
  const fromSearch = location.state?.fromSearch ?? false;

  useEffect(() => {
    if (!location.state) {
      message.warning("Please search for a tour first.");
      navigate(`/product/${id}`);
    }
  }, [location.state, navigate, id]);

  const [primaryTraveler, setPrimaryTraveler] = useState({
    fullName: "",
    email: "",
    mobile: "",
    countryCode: "+91",
    nationality: "",
    countryOfResidence: ""
  });

  const [identityType, setIdentityType] = useState("");

  const [internationalIdentity, setInternationalIdentity] = useState({
    passportNumber: "",
    passportIssuingCountry: "",
    passportExpiryDate: null,
    passportCopy: null,
    visaType: "",
    visaNumber: "",
    visaExpiryDate: null,
    visaCopy: null
  });

  const [indianIdentity, setIndianIdentity] = useState({
    idNumber: "",
    idCopy: null
  });

  const [travelInfo, setTravelInfo] = useState({
    arrivalDateInIndia: null,
    departureDateFromIndia: null,
    preferredTravelDates: checkInDate && checkOutDate
      ? [dayjs(checkInDate), dayjs(checkOutDate)]
      : null,
    accommodationPreference: "",
    dietaryPreference: "",
    dietaryDetails: "",
    languagePreference: ["English"],
    medicalConditions: "",
    physicalLimitations: ""
  });

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      setTravelInfo(prev => ({
        ...prev,
        preferredTravelDates: [dayjs(checkInDate), dayjs(checkOutDate)]
      }));
    }
  }, [checkInDate, checkOutDate]);

  const [emergencyInfo, setEmergencyInfo] = useState({
    contactName: "",
    relationship: "",
    contactNumber: "",
    contactCountryCode: "+91",
    insuranceProvider: "",
    policyNumber: "",
    insuranceValidUntil: null,
    insuranceDocument: null,
    travellingWithoutInsurance: false
  });

  const [consent, setConsent] = useState({
    infoAccurate: false,
    acknowledgeRuralEnvironment: false,
    agreeFollowGuidelines: false,
    acceptTerms: false,
    consentEmergencyMedical: false,
    consentPhotography: false
  });

  const [adultDetails, setAdultDetails] = useState(
    Array.from({ length: adultCount - 1 }, () => ({ name: "", age: "", aadhaar: "" }))
  );
  const [childDetails, setChildDetails] = useState(
    Array.from({ length: childCount }, () => ({ name: "", age: "", aadhaar: "" }))
  );

  const [paymentType, setPaymentType] = useState("full");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const partialAmount = Math.round(totalPrice * 0.3);
  const finalDisplayAmount = paymentType === "full" ? totalPrice : partialAmount;

  // ── helpers ──
  const handlePrimaryTravelerChange = (field, value) =>
    setPrimaryTraveler(prev => ({ ...prev, [field]: value }));

  const handleInternationalIdentityChange = (field, value) =>
    setInternationalIdentity(prev => ({ ...prev, [field]: value }));

  const handleIndianIdentityChange = (field, value) =>
    setIndianIdentity(prev => ({ ...prev, [field]: value }));

  const handleTravelInfoChange = (field, value) =>
    setTravelInfo(prev => ({ ...prev, [field]: value }));

  const handleEmergencyInfoChange = (field, value) =>
    setEmergencyInfo(prev => ({ ...prev, [field]: value }));

  const handleConsentChange = (field, value) =>
    setConsent(prev => ({ ...prev, [field]: value }));

  const handleUpdate = (type, index, field, value) => {
    if (type === "adult") {
      const updated = [...adultDetails];
      updated[index][field] = value;
      setAdultDetails(updated);
    } else {
      const updated = [...childDetails];
      updated[index][field] = value;
      setChildDetails(updated);
    }
  };

  const handleFileUpload = (type, file) => {
    if (type === 'passport') setInternationalIdentity(prev => ({ ...prev, passportCopy: file }));
    else if (type === 'visa') setInternationalIdentity(prev => ({ ...prev, visaCopy: file }));
    else if (type === 'id') setIndianIdentity(prev => ({ ...prev, idCopy: file }));
    else if (type === 'insurance') setEmergencyInfo(prev => ({ ...prev, insuranceDocument: file }));
    return false;
  };

  // ── select-all logic ──
  const allConsentValues = Object.values(consent);
  const allChecked = allConsentValues.every(Boolean);
  const someChecked = allConsentValues.some(Boolean) && !allChecked;

  const handleSelectAll = (checked) => {
    setConsent({
      infoAccurate: checked,
      acknowledgeRuralEnvironment: checked,
      agreeFollowGuidelines: checked,
      acceptTerms: checked,
      consentEmergencyMedical: checked,
      consentPhotography: checked,
    });
  };

  // ── validation ──
  const validateForm = () => {
    if (!primaryTraveler.fullName || primaryTraveler.fullName.length < 3) {
      message.error("Please enter valid full name (min 3 characters)"); return false;
    }
    if (!primaryTraveler.email || !/^\S+@\S+\.\S+$/.test(primaryTraveler.email)) {
      message.error("Please enter valid email address"); return false;
    }
    if (!primaryTraveler.mobile || !/^\d{10}$/.test(primaryTraveler.mobile)) {
      message.error("Please enter valid 10-digit mobile number"); return false;
    }
    if (!primaryTraveler.nationality) { message.error("Please select nationality"); return false; }
    if (!primaryTraveler.countryOfResidence) { message.error("Please select country of residence"); return false; }
    if (primaryTraveler.nationality === "India") {
      if (!identityType) { message.error("Please select ID type"); return false; }
      if (!indianIdentity.idNumber) { message.error("Please enter ID number"); return false; }
    } else {
      if (!internationalIdentity.passportNumber) { message.error("Please enter passport number"); return false; }
      if (!internationalIdentity.passportExpiryDate) { message.error("Please select passport expiry date"); return false; }
    }
    if (!travelInfo.arrivalDateInIndia) { message.error("Please select arrival date in India"); return false; }
    if (!travelInfo.departureDateFromIndia) { message.error("Please select departure date from India"); return false; }
    if (!travelInfo.accommodationPreference) { message.error("Please select accommodation preference"); return false; }
    if (!emergencyInfo.contactName) { message.error("Please enter emergency contact name"); return false; }
    if (!emergencyInfo.relationship) { message.error("Please enter relationship with emergency contact"); return false; }
    if (!emergencyInfo.contactNumber || !/^\d{10}$/.test(emergencyInfo.contactNumber)) {
      message.error("Please enter valid emergency contact number"); return false;
    }
    if (!emergencyInfo.travellingWithoutInsurance) {
      if (!emergencyInfo.insuranceProvider) { message.error("Please enter insurance provider name"); return false; }
      if (!emergencyInfo.policyNumber) { message.error("Please enter policy number"); return false; }
      if (!emergencyInfo.insuranceValidUntil) { message.error("Please select insurance validity date"); return false; }
    }
    if (!consent.infoAccurate) { message.error("Please confirm that information provided is accurate"); return false; }
    if (!consent.acknowledgeRuralEnvironment) { message.error("Please acknowledge the rural environment"); return false; }
    if (!consent.agreeFollowGuidelines) { message.error("Please agree to follow local guidelines"); return false; }
    if (!consent.acceptTerms) { message.error("Please accept Terms & Conditions"); return false; }
    if (!consent.consentEmergencyMedical) { message.error("Please consent to emergency medical assistance"); return false; }
    return true;
  };

  // ── submit ──
  const submitBooking = async () => {
    if (!validateForm()) return;
    if (!agreed) { message.error("Please agree to the payment terms"); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      const bookingData = {
        tourId: id, tourTitle, primaryTraveler,
        identityVerification: {
          identityType: primaryTraveler.nationality === "India" ? identityType : "passport",
          ...(primaryTraveler.nationality === "India"
            ? { idNumber: indianIdentity.idNumber }
            : {
                passportNumber: internationalIdentity.passportNumber,
                passportIssuingCountry: internationalIdentity.passportIssuingCountry,
                passportExpiryDate: internationalIdentity.passportExpiryDate?.format('YYYY-MM-DD'),
                visaType: internationalIdentity.visaType,
                visaNumber: internationalIdentity.visaNumber,
                visaExpiryDate: internationalIdentity.visaExpiryDate?.format('YYYY-MM-DD')
              })
        },
        travelInfo: {
          ...travelInfo,
          arrivalDateInIndia: travelInfo.arrivalDateInIndia?.format('YYYY-MM-DD'),
          departureDateFromIndia: travelInfo.departureDateFromIndia?.format('YYYY-MM-DD'),
          preferredTravelDates: travelInfo.preferredTravelDates?.map(d => d?.format('YYYY-MM-DD'))
        },
        emergencyInfo: {
          ...emergencyInfo,
          insuranceValidUntil: emergencyInfo.insuranceValidUntil?.format('YYYY-MM-DD')
        },
        consent, adultCount, childCount,
        travelers: { adults: adultDetails, children: childDetails },
        paymentType, paidAmount: finalDisplayAmount, totalAmount: totalPrice,
        check_in_date: travelInfo.preferredTravelDates?.[0]?.format('YYYY-MM-DD'),
        check_out_date: travelInfo.preferredTravelDates?.[1]?.format('YYYY-MM-DD'),
        searchData: { location: selectedLocation, locationData: selectedLocationData, searchResults, fromSearch }
      };
      formData.append('bookingData', JSON.stringify(bookingData));
      if (internationalIdentity.passportCopy instanceof File) formData.append('passportCopy', internationalIdentity.passportCopy);
      if (internationalIdentity.visaCopy instanceof File) formData.append('visaCopy', internationalIdentity.visaCopy);
      if (indianIdentity.idCopy instanceof File) formData.append('idCopy', indianIdentity.idCopy);
      if (emergencyInfo.insuranceDocument instanceof File) formData.append('insuranceDocument', emergencyInfo.insuranceDocument);

      const response = await API.post("/api/bookings", formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      if (response.data?.success || response.data?.bookingId) {
        message.success("Booking created successfully!");
        navigate("/booking-success", {
          state: {
            bookingId: response.data.bookingId, tourTitle,
            totalAmount: totalPrice, paidAmount: finalDisplayAmount,
            checkInDate: travelInfo.preferredTravelDates?.[0]?.format('YYYY-MM-DD'),
            checkOutDate: travelInfo.preferredTravelDates?.[1]?.format('YYYY-MM-DD'),
            location: selectedLocation, adultCount, childCount
          }
        });
      }
    } catch (err) {
      console.error("Booking error:", err);
      message.error(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="trip-page" style={{
        maxWidth: 1400, margin: "auto", marginTop: 80,
        padding: isMobile ? "12px" : "20px",
        paddingBottom: isMobile ? "80px" : "20px"
      }}>

        {fromSearch && selectedLocation && (
          <div style={{
            background: "#f8f9fa", padding: "15px 20px", borderRadius: 12,
            marginBottom: 20, border: "1px solid #e9ecef"
          }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: 16, color: "#495057" }}>Search Summary</h3>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div>
                <span style={{ color: "#6c757d", fontSize: 14 }}>Location:</span>
                <strong style={{ marginLeft: 8, color: "#212529" }}>{selectedLocation}</strong>
              </div>
              {checkInDate && checkOutDate && (
                <div>
                  <span style={{ color: "#6c757d", fontSize: 14 }}>Dates:</span>
                  <strong style={{ marginLeft: 8, color: "#212529" }}>
                    {dayjs(checkInDate).format('MMM D, YYYY')} - {dayjs(checkOutDate).format('MMM D, YYYY')}
                  </strong>
                </div>
              )}
              <div>
                <span style={{ color: "#6c757d", fontSize: 14 }}>Guests:</span>
                <strong style={{ marginLeft: 8, color: "#212529" }}>
                  {adultCount} Adult{adultCount !== 1 ? 's' : ''}
                  {childCount > 0 && `, ${childCount} Child${childCount !== 1 ? 'ren' : ''}`}
                </strong>
              </div>
            </div>
          </div>
        )}

        <h1 className="trip-title" style={{ marginBottom: isMobile ? 20 : 30, fontSize: isMobile ? 24 : 28 }}>
          Complete Your Booking: {tourTitle}
        </h1>

        <div className="trip-layout" style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "2.2fr 1fr",
          gap: isMobile ? 20 : 40
        }}>

          {/* ── LEFT: FORM ── */}
          <section className="left-content">
            <Collapse defaultActiveKey={['1']} expandIconPosition="right" bordered={false} ghost>

              {/* SECTION 1: TRAVELER PROFILE */}
              <Panel header={
                <h2 style={{ fontSize: isMobile ? 18 : 20, margin: 0, color: "#333" }}>
                  1. Traveler Profile (Primary Contact)
                </h2>
              } key="1">
                <div style={{ background: "#fff", padding: isMobile ? 16 : 24, borderRadius: 16 }}>
                  <Row gutter={[20, 20]}>
                    <Col span={24}>
                      <label>Full Name (as per Passport)</label>
                      <Input placeholder="Enter full name" size="large"
                        value={primaryTraveler.fullName}
                        onChange={e => handlePrimaryTravelerChange("fullName", e.target.value)} />
                    </Col>
                    <Col xs={24} md={12}>
                      <label>Email Address</label>
                      <Input placeholder="email@example.com" size="large"
                        value={primaryTraveler.email}
                        onChange={e => handlePrimaryTravelerChange("email", e.target.value)} />
                    </Col>
                    <Col xs={24} md={12}>
                      <label>Mobile Number</label>
                      <Input.Group compact>
                        <Select showSearch placeholder="Code" style={{ width: '35%' }}
                          value={primaryTraveler.countryCode}
                          onChange={val => handlePrimaryTravelerChange("countryCode", val)}
                          loading={loadingCountries}
                          filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}>
                          {countryCodes.map(code => (
                            <Option key={code.value} value={code.value} label={code.label}>{code.label}</Option>
                          ))}
                        </Select>
                        <Input style={{ width: '65%' }} placeholder="9876543210" maxLength={10}
                          value={primaryTraveler.mobile}
                          onChange={e => handlePrimaryTravelerChange("mobile", e.target.value)} />
                      </Input.Group>
                    </Col>
                    <Col xs={24} md={12}>
                      <label>Nationality</label>
                      <Select showSearch placeholder="Select nationality" size="large" style={{ width: '100%' }}
                        value={primaryTraveler.nationality}
                        onChange={val => handlePrimaryTravelerChange("nationality", val)}
                        loading={loadingCountries}
                        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                        {countries.map(c => <Option key={c.code} value={c.name}>{c.name}</Option>)}
                      </Select>
                    </Col>
                    <Col xs={24} md={12}>
                      <label>Country of Residence</label>
                      <Select showSearch placeholder="Select country" size="large" style={{ width: '100%' }}
                        value={primaryTraveler.countryOfResidence}
                        onChange={val => handlePrimaryTravelerChange("countryOfResidence", val)}
                        loading={loadingCountries}
                        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                        {countries.map(c => <Option key={c.code} value={c.name}>{c.name}</Option>)}
                      </Select>
                    </Col>
                  </Row>
                </div>
              </Panel>

              {/* SECTION 2: IDENTITY VERIFICATION */}
              <Panel header={
                <h2 style={{ fontSize: isMobile ? 18 : 20, margin: 0, color: "#333" }}>
                  2. Identity Verification
                </h2>
              } key="2">
                <div style={{ background: "#fff", padding: isMobile ? 16 : 24, borderRadius: 16 }}>
                  {primaryTraveler.nationality === "India" ? (
                    <Row gutter={[20, 20]}>
                      <Col span={24}>
                        <label>ID Type</label>
                        <Radio.Group onChange={e => setIdentityType(e.target.value)} value={identityType} size="large">
                          <Radio value="aadhaar">Aadhaar Card</Radio>
                          <Radio value="passport">Passport</Radio>
                          <Radio value="drivingLicense">Driving License</Radio>
                        </Radio.Group>
                      </Col>
                      <Col xs={24} md={12}>
                        <label>ID Number</label>
                        <Input placeholder="Enter ID number" size="large"
                          value={indianIdentity.idNumber}
                          onChange={e => handleIndianIdentityChange("idNumber", e.target.value)} />
                      </Col>
                      <Col xs={24} md={12}>
                        <label>Upload ID Copy</label>
                        <Upload beforeUpload={file => { handleFileUpload('id', file); return false; }} maxCount={1}
                          fileList={indianIdentity.idCopy ? [indianIdentity.idCopy] : []}
                          onRemove={() => handleIndianIdentityChange("idCopy", null)}>
                          <Button icon={<UploadOutlined />}>Upload Document</Button>
                        </Upload>
                      </Col>
                    </Row>
                  ) : (
                    <>
                      <h3 style={{ marginBottom: 20 }}>Passport Details</h3>
                      <Row gutter={[20, 20]}>
                        <Col xs={24} md={12}>
                          <label>Passport Number</label>
                          <Input placeholder="Enter passport number" size="large"
                            value={internationalIdentity.passportNumber}
                            onChange={e => handleInternationalIdentityChange("passportNumber", e.target.value)} />
                        </Col>
                        <Col xs={24} md={12}>
                          <label>Passport Issuing Country</label>
                          <Select showSearch placeholder="Select country" size="large" style={{ width: '100%' }}
                            value={internationalIdentity.passportIssuingCountry}
                            onChange={val => handleInternationalIdentityChange("passportIssuingCountry", val)}
                            loading={loadingCountries}
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                            {countries.map(c => <Option key={c.code} value={c.name}>{c.name}</Option>)}
                          </Select>
                        </Col>
                        <Col xs={24} md={12}>
                          <label>Passport Expiry Date</label>
                          <DatePicker style={{ width: '100%' }} size="large"
                            value={internationalIdentity.passportExpiryDate}
                            onChange={date => handleInternationalIdentityChange("passportExpiryDate", date)}
                            disabledDate={current => current && current < new Date()} />
                        </Col>
                        <Col xs={24} md={12}>
                          <label>Upload Passport Copy</label>
                          <Upload beforeUpload={file => { handleFileUpload('passport', file); return false; }} maxCount={1}
                            fileList={internationalIdentity.passportCopy ? [internationalIdentity.passportCopy] : []}
                            onRemove={() => handleInternationalIdentityChange("passportCopy", null)}>
                            <Button icon={<UploadOutlined />}>Upload Passport</Button>
                          </Upload>
                        </Col>
                      </Row>
                    </>
                  )}
                </div>
              </Panel>

              {/* SECTION 3: TRAVEL INFORMATION */}
              <Panel header={
                <h2 style={{ fontSize: isMobile ? 18 : 20, margin: 0, color: "#333" }}>
                  3. Travel Information
                </h2>
              } key="3">
                <div style={{ background: "#fff", padding: isMobile ? 16 : 24, borderRadius: 16 }}>
                  <Row gutter={[20, 20]}>
                    <Col xs={24} md={12}>
                      <label>Planned Arrival Date in India</label>
                      <DatePicker style={{ width: '100%' }} size="large"
                        value={travelInfo.arrivalDateInIndia}
                        onChange={date => handleTravelInfoChange("arrivalDateInIndia", date)} />
                    </Col>
                    <Col xs={24} md={12}>
                      <label>Planned Departure Date from India</label>
                      <DatePicker style={{ width: '100%' }} size="large"
                        value={travelInfo.departureDateFromIndia}
                        onChange={date => handleTravelInfoChange("departureDateFromIndia", date)}
                        disabledDate={current => {
                          if (!travelInfo.arrivalDateInIndia) return false;
                          return current && current <= travelInfo.arrivalDateInIndia;
                        }} />
                    </Col>
                    <Col span={24}>
                      <label>Preferred Travel Dates for this Tour</label>
                      <DatePicker.RangePicker style={{ width: '100%' }} size="large"
                        value={travelInfo.preferredTravelDates}
                        onChange={dates => handleTravelInfoChange("preferredTravelDates", dates)} />
                      {fromSearch && checkInDate && checkOutDate && (
                        <p style={{ fontSize: 12, color: "#6c757d", marginTop: 5 }}>
                          * Dates from your search ({dayjs(checkInDate).format('MMM D, YYYY')} - {dayjs(checkOutDate).format('MMM D, YYYY')}) have been pre-filled
                        </p>
                      )}
                    </Col>
                    <Col xs={24} md={12}>
                      <label>Accommodation Preference</label>
                      <Select placeholder="Select preference" size="large" style={{ width: '100%' }}
                        value={travelInfo.accommodationPreference}
                        onChange={val => handleTravelInfoChange("accommodationPreference", val)}>
                        <Option value="standard">Standard Stay</Option>
                        <Option value="eco">Eco Stay</Option>
                        <Option value="premium">Premium Rural Stay</Option>
                      </Select>
                    </Col>
                    <Col xs={24} md={12}>
                      <label>Dietary Preference</label>
                      <Select placeholder="Select dietary preference" size="large" style={{ width: '100%' }}
                        value={travelInfo.dietaryPreference}
                        onChange={val => handleTravelInfoChange("dietaryPreference", val)}>
                        <Option value="veg">Vegetarian</Option>
                        <Option value="non-veg">Non-Vegetarian</Option>
                        <Option value="vegan">Vegan</Option>
                        <Option value="allergies">Food Allergies</Option>
                      </Select>
                    </Col>
                    {travelInfo.dietaryPreference === "allergies" && (
                      <Col span={24}>
                        <label>Please specify allergies</label>
                        <TextArea rows={2} placeholder="Describe any food allergies"
                          value={travelInfo.dietaryDetails}
                          onChange={e => handleTravelInfoChange("dietaryDetails", e.target.value)} />
                      </Col>
                    )}
                    <Col xs={24} md={12}>
                      <label>Language Preference</label>
                      <Select mode="multiple" placeholder="Select languages" size="large" style={{ width: '100%' }}
                        value={travelInfo.languagePreference}
                        onChange={val => handleTravelInfoChange("languagePreference", val)}>
                        <Option value="English">English</Option>
                        <Option value="Hindi">Hindi</Option>
                        <Option value="Malayalam">Malayalam</Option>
                        <Option value="Tamil">Tamil</Option>
                        <Option value="Kannada">Kannada</Option>
                        <Option value="Telugu">Telugu</Option>
                      </Select>
                    </Col>
                    <Col xs={24} md={12}>
                      <label>Medical Conditions (Optional)</label>
                      <Input placeholder="Any medical conditions we should know" size="large"
                        value={travelInfo.medicalConditions}
                        onChange={e => handleTravelInfoChange("medicalConditions", e.target.value)} />
                    </Col>
                    <Col span={24}>
                      <label>Physical Limitations (Optional)</label>
                      <TextArea rows={2} placeholder="Any physical limitations or accessibility requirements"
                        value={travelInfo.physicalLimitations}
                        onChange={e => handleTravelInfoChange("physicalLimitations", e.target.value)} />
                    </Col>
                  </Row>
                </div>
              </Panel>

              {/* SECTION 4: SAFETY & EMERGENCY */}
              <Panel header={
                <h2 style={{ fontSize: isMobile ? 18 : 20, margin: 0, color: "#333" }}>
                  4. Safety & Emergency Information
                </h2>
              } key="4">
                <div style={{ background: "#fff", padding: isMobile ? 16 : 24, borderRadius: 16 }}>
                  <h3>Emergency Contact</h3>
                  <Row gutter={[20, 20]}>
                    <Col xs={24} md={8}>
                      <label>Emergency Contact Name</label>
                      <Input placeholder="Full name" size="large"
                        value={emergencyInfo.contactName}
                        onChange={e => handleEmergencyInfoChange("contactName", e.target.value)} />
                    </Col>
                    <Col xs={24} md={8}>
                      <label>Relationship</label>
                      <Input placeholder="e.g., Spouse, Parent" size="large"
                        value={emergencyInfo.relationship}
                        onChange={e => handleEmergencyInfoChange("relationship", e.target.value)} />
                    </Col>
                  </Row>
                  <Col xs={24} md={12} style={{ marginTop: 20 }}>
                    <label>Emergency Contact Number</label>
                    <Input.Group compact>
                      <Select showSearch placeholder="Code" style={{ width: '35%' }}
                        value={emergencyInfo.contactCountryCode}
                        onChange={val => handleEmergencyInfoChange("contactCountryCode", val)}
                        loading={loadingCountries}
                        filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}>
                        {countryCodes.map(code => (
                          <Option key={code.value} value={code.value} label={code.label}>{code.label}</Option>
                        ))}
                      </Select>
                      <Input style={{ width: '65%' }} placeholder="9876543210" maxLength={10}
                        value={emergencyInfo.contactNumber}
                        onChange={e => handleEmergencyInfoChange("contactNumber", e.target.value)} />
                    </Input.Group>
                  </Col>

                  <Divider />
                  <h3>Travel Insurance</h3>
                  <Row gutter={[20, 20]}>
                    <Col span={24}>
                      <Checkbox checked={emergencyInfo.travellingWithoutInsurance}
                        onChange={e => handleEmergencyInfoChange("travellingWithoutInsurance", e.target.checked)}>
                        I am travelling without insurance
                      </Checkbox>
                    </Col>
                    {!emergencyInfo.travellingWithoutInsurance && (
                      <>
                        <Col xs={24} md={8}>
                          <label>Insurance Provider</label>
                          <Input placeholder="Provider name" size="large"
                            value={emergencyInfo.insuranceProvider}
                            onChange={e => handleEmergencyInfoChange("insuranceProvider", e.target.value)} />
                        </Col>
                        <Col xs={24} md={8}>
                          <label>Policy Number</label>
                          <Input placeholder="Policy number" size="large"
                            value={emergencyInfo.policyNumber}
                            onChange={e => handleEmergencyInfoChange("policyNumber", e.target.value)} />
                        </Col>
                        <Col xs={24} md={8}>
                          <label>Valid Until</label>
                          <DatePicker style={{ width: '100%' }} size="large"
                            value={emergencyInfo.insuranceValidUntil}
                            onChange={date => handleEmergencyInfoChange("insuranceValidUntil", date)} />
                        </Col>
                        <Col span={24}>
                          <label>Upload Insurance Document</label>
                          <Upload beforeUpload={file => { handleFileUpload('insurance', file); return false; }} maxCount={1}
                            fileList={emergencyInfo.insuranceDocument ? [emergencyInfo.insuranceDocument] : []}
                            onRemove={() => handleEmergencyInfoChange("insuranceDocument", null)}>
                            <Button icon={<UploadOutlined />}>Upload Insurance</Button>
                          </Upload>
                        </Col>
                      </>
                    )}
                  </Row>
                </div>
              </Panel>

              {/* SECTION 5: DECLARATIONS & CONSENT */}
              <Panel header={
                <h2 style={{ fontSize: isMobile ? 18 : 20, margin: 0, color: "#333" }}>
                  5. Declarations & Consent
                </h2>
              } key="5">
                <div style={{ background: "#fff", padding: isMobile ? 16 : 24, borderRadius: 16 }}>

                  {/* ── SELECT ALL BOX ── */}
                  <div
                    onClick={() => handleSelectAll(!allChecked)}
                    style={{
                      background: allChecked ? "#fff7f6" : someChecked ? "#fffbf0" : "#fafafa",
                      border: `2px solid ${allChecked ? "#654039" : someChecked ? "#d4a843" : "#e5e7eb"}`,
                      borderRadius: 12,
                      padding: "14px 18px",
                      marginBottom: 20,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                      userSelect: "none"
                    }}
                  >
                    <Checkbox
                      checked={allChecked}
                      indeterminate={someChecked}
                      onChange={e => { e.stopPropagation(); handleSelectAll(e.target.checked); }}
                      onClick={e => e.stopPropagation()}
                      style={{ transform: "scale(1.2)" }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: "#654039", fontSize: 15, lineHeight: 1.3 }}>
                        Select All — I agree to all declarations & consent
                      </div>
                      <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                        {allChecked
                          ? "✓ All declarations accepted"
                          : someChecked
                          ? `${allConsentValues.filter(Boolean).length} of ${allConsentValues.length} selected`
                          : "Click to accept all at once"}
                      </div>
                    </div>
                  </div>

                  {/* ── INDIVIDUAL CHECKBOXES ── */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingLeft: 4 }}>
                    <Checkbox checked={consent.infoAccurate}
                      onChange={e => handleConsentChange("infoAccurate", e.target.checked)}>
                      I confirm that all information provided is accurate and complete
                    </Checkbox>

                    <Checkbox checked={consent.acknowledgeRuralEnvironment}
                      onChange={e => handleConsentChange("acknowledgeRuralEnvironment", e.target.checked)}>
                      I acknowledge that agro-tourism involves rural and outdoor environments with varying facilities
                    </Checkbox>

                    <Checkbox checked={consent.agreeFollowGuidelines}
                      onChange={e => handleConsentChange("agreeFollowGuidelines", e.target.checked)}>
                      I agree to follow local cultural and safety guidelines during the tour
                    </Checkbox>

                    <Checkbox checked={consent.acceptTerms}
                      onChange={e => handleConsentChange("acceptTerms", e.target.checked)}>
                      I accept the{" "}
                      <a href="/terms" style={{ color: "#654039" }}>Terms & Conditions</a>{" "}
                      and{" "}
                      <a href="/cancellation" style={{ color: "#654039" }}>Cancellation Policy</a>
                    </Checkbox>

                    <Checkbox checked={consent.consentEmergencyMedical}
                      onChange={e => handleConsentChange("consentEmergencyMedical", e.target.checked)}>
                      I consent to emergency medical assistance if required during the tour
                    </Checkbox>

                    <Checkbox checked={consent.consentPhotography}
                      onChange={e => handleConsentChange("consentPhotography", e.target.checked)}>
                      I consent to photography and media usage for promotional purposes (optional)
                    </Checkbox>
                  </div>
                </div>
              </Panel>

              {/* ADDITIONAL TRAVELERS */}
              {(adultCount > 1 || childCount > 0) && (
                <Panel header={
                  <h2 style={{ fontSize: isMobile ? 18 : 20, margin: 0, color: "#333" }}>
                    Additional Travelers
                  </h2>
                } key="6">
                  <div style={{ background: "#fff", padding: isMobile ? 16 : 24, borderRadius: 16 }}>
                    {adultCount > 1 && (
                      <>
                        <h3>Additional Adults ({adultCount - 1})</h3>
                        {adultDetails.map((adult, i) => (
                          <div key={`a-${i}`} style={{ marginBottom: 25 }}>
                            <p style={{ fontWeight: 600 }}>Adult {i + 2}</p>
                            <Row gutter={[15, 15]}>
                              <Col xs={24} md={8}>
                                <Input placeholder="Full Name" value={adult.name}
                                  onChange={e => handleUpdate("adult", i, "name", e.target.value)} />
                              </Col>
                              <Col xs={24} md={8}>
                                <InputNumber placeholder="Age" min={18} max={100} style={{ width: '100%' }}
                                  value={adult.age}
                                  onChange={val => handleUpdate("adult", i, "age", val)} />
                              </Col>
                              <Col xs={24} md={8}>
                                <Input placeholder="Aadhaar (optional)" maxLength={12} value={adult.aadhaar}
                                  onChange={e => handleUpdate("adult", i, "aadhaar", e.target.value)} />
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </>
                    )}
                    {childCount > 0 && (
                      <>
                        <Divider />
                        <h3>Children ({childCount})</h3>
                        {childDetails.map((child, i) => (
                          <div key={`c-${i}`} style={{ marginBottom: 25 }}>
                            <p style={{ fontWeight: 600 }}>Child {i + 1}</p>
                            <Row gutter={[15, 15]}>
                              <Col xs={24} md={8}>
                                <Input placeholder="Full Name" value={child.name}
                                  onChange={e => handleUpdate("child", i, "name", e.target.value)} />
                              </Col>
                              <Col xs={24} md={8}>
                                <InputNumber placeholder="Age" min={1} max={17} style={{ width: '100%' }}
                                  value={child.age}
                                  onChange={val => handleUpdate("child", i, "age", val)} />
                              </Col>
                              <Col xs={24} md={8}>
                                <Input placeholder="Aadhaar (optional)" maxLength={12} value={child.aadhaar}
                                  onChange={e => handleUpdate("child", i, "aadhaar", e.target.value)} />
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </Panel>
              )}
            </Collapse>
          </section>

          {/* ── RIGHT: PAYMENT CARD (DESKTOP) ── */}
          {!isMobile && (
            <aside className="booking-card desktop-only" style={{ position: "sticky", top: 100, height: "fit-content" }}>
              <h2 style={{ fontSize: 22, marginBottom: 20 }}>Payment Summary</h2>

              <div style={{ marginBottom: 20 }}>
                {[
                  { label: "Total Travelers", value: adultCount + childCount },
                  { label: "Adults", value: adultCount },
                  ...(childCount > 0 ? [{ label: "Children", value: childCount }] : [])
                ].map(item => (
                  <div key={item.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    marginBottom: 12, paddingBottom: 8, borderBottom: "1px dashed #eee"
                  }}>
                    <span style={{ color: "#666", fontSize: 15 }}>{item.label}:</span>
                    <strong style={{ fontSize: 16, color: "#333" }}>{item.value}</strong>
                  </div>
                ))}
              </div>

              <Divider />

              <div style={{
                marginBottom: 20, background: "#fafafa",
                padding: "15px", borderRadius: 12, border: "1px solid #f0f0f0"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 16, fontWeight: 500, color: "#333" }}>Gross Amount:</span>
                  <strong style={{ fontSize: 24, color: "#654039", fontWeight: 700 }}>
                    ₹ {totalPrice.toLocaleString()}
                  </strong>
                </div>
              </div>

              <Divider />

              <label style={{ marginBottom: 10, display: "block", fontWeight: 500 }}>Payment Option</label>
              <Radio.Group onChange={e => setPaymentType(e.target.value)} value={paymentType}
                style={{ width: "100%", marginBottom: 20 }}>
                <Radio value="full" style={{
                  display: "block", marginBottom: 12, padding: "12px 15px",
                  background: paymentType === "full" ? "#fff7ed" : "#fafafa",
                  borderRadius: 10,
                  border: paymentType === "full" ? "1px solid #654039" : "1px solid transparent",
                  transition: "all 0.3s"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 500 }}>Pay Full Amount</span>
                    <strong style={{ color: "#654039", fontSize: 16 }}>₹{totalPrice.toLocaleString()}</strong>
                  </div>
                </Radio>
              </Radio.Group>

              <Divider />

              <Checkbox checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginBottom: 20 }}>
                I agree to the payment terms and cancellation policy.
              </Checkbox>

              <div className="total-row" style={{
                marginTop: 10, background: "#654039",
                padding: "15px 20px", borderRadius: 12, marginBottom: 15
              }}>
                <h3 style={{ color: "white", margin: 0, fontSize: 18 }}>Pay Amount</h3>
                <div className="total-price" style={{ color: "white", fontSize: 24 }}>
                  ₹ {finalDisplayAmount.toLocaleString()}
                </div>
              </div>

              <Button size="large" block className="book-btn" onClick={submitBooking}
                loading={loading} disabled={loading || !agreed}
                style={{
                  marginTop: 10, height: 50, fontSize: 16, fontWeight: 600,
                  background: "#654039", border: "none", color: "white"
                }}>
                {loading ? "PROCESSING..." : "CONFIRM & PAY"}
              </Button>

              <p style={{ fontSize: "11px", color: "#888", marginTop: 15, textAlign: "center" }}>
                * Advance payments are non-refundable and non-transferable.
              </p>
            </aside>
          )}
        </div>

        {/* ── MOBILE BOTTOM BAR ── */}
        {isMobile && (
          <>
            <div className="mobile-booking-bar" style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              background: "rgba(255,255,255,0.98)", padding: "12px 20px",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.1)", zIndex: 1000,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 15, backdropFilter: "blur(10px)", borderTop: "1px solid #eee"
            }}>
              <div>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 2 }}>Total Amount</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: "#654039" }}>
                  ₹ {finalDisplayAmount.toLocaleString()}
                </div>
              </div>
              <Button onClick={submitBooking} loading={loading} disabled={loading || !agreed}
                style={{
                  background: "#654039", border: "none", color: "white",
                  height: 48, fontWeight: 600, fontSize: 15, padding: "0 25px",
                  borderRadius: 30, boxShadow: "0 5px 15px rgba(101,64,57,0.3)"
                }}>
                {loading ? "PROCESSING..." : "PAY NOW"}
              </Button>
            </div>

            {/* Mobile Payment Section */}
            <div style={{ marginTop: 20, padding: "0 12px" }}>
              <div style={{
                background: "#fff", padding: 20, borderRadius: 16,
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)", marginBottom: 20
              }}>
                <h3 style={{ fontSize: 18, marginBottom: 20, color: "#333" }}>Payment Summary</h3>

                {[
                  { label: "Total Travelers", value: adultCount + childCount },
                  { label: "Adults", value: adultCount },
                  ...(childCount > 0 ? [{ label: "Children", value: childCount }] : [])
                ].map(item => (
                  <div key={item.label} style={{
                    display: "flex", justifyContent: "space-between",
                    marginBottom: 12, paddingBottom: 8, borderBottom: "1px dashed #eee"
                  }}>
                    <span style={{ color: "#666" }}>{item.label}:</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}

                <div style={{ background: "#fafafa", padding: "15px", borderRadius: 12, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 16, fontWeight: 500 }}>Gross Amount:</span>
                    <strong style={{ fontSize: 20, color: "#654039" }}>₹ {totalPrice.toLocaleString()}</strong>
                  </div>
                </div>

                <Divider style={{ margin: "20px 0" }} />

                <label style={{ marginBottom: 12, display: "block", fontWeight: 500 }}>Payment Option</label>
                <Radio.Group onChange={e => setPaymentType(e.target.value)} value={paymentType}
                  style={{ width: "100%", marginBottom: 20 }}>
                  <Radio value="full" style={{
                    display: "block", marginBottom: 12, padding: "12px 15px",
                    background: paymentType === "full" ? "#fff7ed" : "#fafafa",
                    borderRadius: 10,
                    border: paymentType === "full" ? "1px solid #654039" : "1px solid transparent"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Full Amount</span>
                      <strong style={{ color: "#654039" }}>₹{totalPrice.toLocaleString()}</strong>
                    </div>
                  </Radio>
                  <Radio value="partial" style={{
                    display: "block", padding: "12px 15px",
                    background: paymentType === "partial" ? "#fff7ed" : "#fafafa",
                    borderRadius: 10,
                    border: paymentType === "partial" ? "1px solid #654039" : "1px solid transparent"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>30% Advance</span>
                      <strong style={{ color: "#654039" }}>₹{partialAmount.toLocaleString()}</strong>
                    </div>
                  </Radio>
                </Radio.Group>

                <Divider style={{ margin: "20px 0" }} />

                <Checkbox checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginBottom: 20 }}>
                  I agree to the payment terms
                </Checkbox>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BookingCard;
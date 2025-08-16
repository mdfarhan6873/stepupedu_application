"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeftIcon, MapPinIcon, ClockIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface Subject {
  class: string;
  section: string;
  subjectName: string;
  status: "Present" | "Absent" | "Leave";
}

interface AttendanceRecord {
  _id: string;
  isFullDay: boolean;
  date: string;
  subjects: Subject[];
  location: {
    latitude: number;
    longitude: number;
  };
  remarks?: string;
  createdAt: string;
}

export default function TeacherAttendance() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"daywise" | "subjectwise">("daywise");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [alreadyMarked, setAlreadyMarked] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [canAddSubject, setCanAddSubject] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [locationVerified, setLocationVerified] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [instituteLocations, setInstituteLocations] = useState<any[]>([]);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showLocationErrorModal, setShowLocationErrorModal] = useState(false);
  
  // Filter states
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filteredHistory, setFilteredHistory] = useState<AttendanceRecord[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({ days: 0, classes: 0 });
  
  // Form states
  const [remarks, setRemarks] = useState("");
  const [subject, setSubject] = useState<Subject>({ class: "", section: "", subjectName: "", status: "Present" });

  // Auth check
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "teacher") {
      router.push("/login");
    }
  }, [session, status, router]);

  // Check if attendance already marked
  useEffect(() => {
    if (session?.user?.role === "teacher") {
      checkTodayAttendance();
      fetchAttendanceHistory();
      fetchInstituteLocations();
    }
  }, [session]);

  // Set active tab based on existing attendance
  useEffect(() => {
    if (todayAttendance && !todayAttendance.isFullDay) {
      setActiveTab("subjectwise");
    }
  }, [todayAttendance]);

  // Refetch when month/year changes
  useEffect(() => {
    if (session?.user?.role === "teacher") {
      fetchAttendanceHistory();
    }
  }, [selectedMonth, selectedYear, session]);

  // Helper function to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const fetchInstituteLocations = async () => {
    try {
      const res = await fetch("/api/institute-location");
      const data = await res.json();
      if (data.success) {
        setInstituteLocations(data.data);
      }
    } catch (error) {
      console.error("Error fetching institute locations:", error);
    }
  };

  const verifyLocationWithInstitute = (teacherLocation: {latitude: number; longitude: number}) => {
    if (instituteLocations.length === 0) {
      setLocationError("No institute locations configured. Please contact administration.");
      setLocationVerified(false);
      return false;
    }

    let isWithinRadius = false;
    let matchedLocation = null;
    let closestDistance = Infinity;
    let closestLocation = null;

    for (const instituteLocation of instituteLocations) {
      const distance = calculateDistance(
        teacherLocation.latitude,
        teacherLocation.longitude,
        instituteLocation.latitude,
        instituteLocation.longitude
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestLocation = instituteLocation;
      }

      if (distance <= instituteLocation.radius) {
        isWithinRadius = true;
        matchedLocation = instituteLocation;
        break;
      }
    }

    if (isWithinRadius && matchedLocation) {
      setLocationVerified(true);
      setLocationError(null);
      return true;
    } else {
      setLocationVerified(false);
      const distanceInKm = (closestDistance / 1000).toFixed(2);
      const radiusInKm = closestLocation ? (closestLocation.radius / 1000).toFixed(2) : 'N/A';
      setLocationError(
        `You are not within the institute location radius. You are ${distanceInKm}km away from the nearest institute location "${closestLocation?.name || 'Unknown'}" (allowed radius: ${radiusInKm}km). Please reach the institute location to mark attendance. Thank you!`
      );
      setShowLocationErrorModal(true);
      return false;
    }
  };

  const checkTodayAttendance = async () => {
    try {
      const res = await fetch("/api/teacher/attendance/check");
      const data = await res.json();
      if (data.success) {
        setAlreadyMarked(data.alreadyMarked);
        setTodayAttendance(data.attendance);
        setCanAddSubject(data.canAddSubject || false);
        setRemainingMinutes(data.remainingMinutes || 0);
      }
    } catch (error) {
      console.error("Error checking attendance:", error);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const res = await fetch(`/api/teacher/attendance?month=${selectedMonth}&year=${selectedYear}`);
      const data = await res.json();
      if (data.success) {
        setAttendanceHistory(data.data);
        filterAttendanceHistory(data.data);
      }
    } catch (error) {
      console.error("Error fetching attendance history:", error);
    }
  };

  const filterAttendanceHistory = (history: AttendanceRecord[]) => {
    const filtered = history.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() + 1 === selectedMonth && recordDate.getFullYear() === selectedYear;
    });
    
    setFilteredHistory(filtered);
    
    // Calculate monthly stats
    const dayWiseRecords = filtered.filter(record => record.isFullDay);
    const subjectWiseRecords = filtered.filter(record => !record.isFullDay);
    const totalClasses = subjectWiseRecords.reduce((total, record) => total + (record.subjects?.length || 0), 0);
    
    setMonthlyStats({
      days: dayWiseRecords.length,
      classes: totalClasses
    });
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    setLocationVerified(false);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setCurrentLocation(location);
          
          // Verify location against institute locations
          verifyLocationWithInstitute(location);
          setLocationLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Failed to get location. Please enable location services and try again.");
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setLocationLoading(false);
    }
  };

  const updateSubject = (field: keyof Subject, value: string) => {
    setSubject(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSubject = async () => {
    if (!currentLocation) {
      alert("Please get your current location first.");
      return;
    }

    if (!locationVerified) {
      setShowLocationErrorModal(true);
      return;
    }

    if (!subject.class || !subject.section || !subject.subjectName) {
      alert("Please fill in all subject details.");
      return;
    }

    setLoading(true);

    try {
      const attendanceData = {
        isFullDay: false,
        location: currentLocation,
        subjects: [subject],
        addToExisting: true // Flag to indicate adding to existing attendance
      };

      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceData)
      });

      const data = await res.json();
      
      if (data.success) {
        alert(data.message || "Subject added successfully!");
        setTodayAttendance(data.data);
        setSubject({ class: "", section: "", subjectName: "", status: "Present" });
        checkTodayAttendance();
        fetchAttendanceHistory();
      } else {
        // Show specific error message from backend
        if (data.message && data.message.includes("not within the allowed institute radius")) {
          setShowLocationErrorModal(true);
          // Re-verify location to update UI
          if (currentLocation) {
            verifyLocationWithInstitute(currentLocation);
          }
        } else {
          alert(data.message || "Failed to add subject");
        }
      }
    } catch (error) {
      console.error("Error adding subject:", error);
      alert("Failed to add subject. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentLocation) {
      alert("Please get your current location first.");
      return;
    }

    if (!locationVerified) {
      setShowLocationErrorModal(true);
      return;
    }

    setLoading(true);

    try {
      const attendanceData = {
        isFullDay: activeTab === "daywise",
        location: currentLocation,
        remarks,
        ...(activeTab === "subjectwise" && { subjects: [subject] })
      };

      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceData)
      });

      const data = await res.json();
      
      if (data.success) {
        alert(data.message || "Attendance marked successfully!");
        if (activeTab === "daywise") {
          setAlreadyMarked(true);
        }
        setTodayAttendance(data.data);
        setSubject({ class: "", section: "", subjectName: "", status: "Present" });
        setRemarks("");
        checkTodayAttendance();
        fetchAttendanceHistory();
      } else {
        // Show specific error message from backend
        if (data.message && data.message.includes("not within the allowed institute radius")) {
          setShowLocationErrorModal(true);
          // Re-verify location to update UI
          if (currentLocation) {
            verifyLocationWithInstitute(currentLocation);
          }
        } else {
          alert(data.message || "Failed to mark attendance");
        }
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      alert("Failed to mark attendance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-all duration-200 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-2xl hover:bg-white/80 shadow-sm hover:shadow-md"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                My Attendance
              </h1>
              <p className="text-sm text-gray-500">Mark your daily attendance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6">
        {/* Today's Status */}
        {alreadyMarked && todayAttendance && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-3xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-800">Attendance Marked</h3>
                  <p className="text-sm text-green-600">Today's attendance has been recorded</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-green-600" />
                  <span className="text-green-700">{formatDate(todayAttendance.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-green-600" />
                  <span className="text-green-700">{formatTime(todayAttendance.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Form */}
        {(!alreadyMarked || (activeTab === "subjectwise" && todayAttendance && !todayAttendance.isFullDay)) && (
          <div className="mb-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex bg-gradient-to-r from-indigo-500 to-purple-600">
                <button
                  onClick={() => setActiveTab("daywise")}
                  disabled={alreadyMarked && todayAttendance?.isFullDay}
                  className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${
                    activeTab === "daywise"
                      ? "bg-white text-indigo-600 shadow-lg"
                      : "text-white hover:bg-white/10"
                  } ${alreadyMarked && todayAttendance?.isFullDay ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Day-wise
                </button>
                <button
                  onClick={() => setActiveTab("subjectwise")}
                  disabled={alreadyMarked && todayAttendance?.isFullDay}
                  className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${
                    activeTab === "subjectwise"
                      ? "bg-white text-indigo-600 shadow-lg"
                      : "text-white hover:bg-white/10"
                  } ${alreadyMarked && todayAttendance?.isFullDay ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Subject-wise
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6">
                {/* Location Section */}
                <div className="mb-6">
                  <div className={`rounded-2xl p-4 mb-4 ${
                    locationVerified 
                      ? "bg-gradient-to-r from-green-50 to-green-100 border border-green-200" 
                      : locationError 
                        ? "bg-gradient-to-r from-red-50 to-red-100 border border-red-200"
                        : "bg-gradient-to-r from-blue-50 to-indigo-50"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 ${
                          locationVerified 
                            ? "text-green-600" 
                            : locationError 
                              ? "text-red-600" 
                              : "text-indigo-600"
                        }`}>
                          {locationVerified ? (
                            <CheckCircleIcon className="w-6 h-6" />
                          ) : locationError ? (
                            <XCircleIcon className="w-6 h-6" />
                          ) : (
                            <MapPinIcon className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${
                            locationVerified 
                              ? "text-green-800" 
                              : locationError 
                                ? "text-red-800" 
                                : "text-gray-800"
                          }`}>
                            Location Verification
                            {locationVerified && (
                              <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                                Verified ✓
                              </span>
                            )}
                          </h3>
                          <p className={`text-sm ${
                            locationVerified 
                              ? "text-green-600" 
                              : locationError 
                                ? "text-red-600" 
                                : "text-gray-600"
                          }`}>
                            {locationError ? (
                              locationError
                            ) : currentLocation ? (
                              locationVerified 
                                ? `Location verified within institute radius: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
                                : `Location captured: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
                            ) : (
                              "Click to get your current location and verify with institute locations"
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className={`px-4 py-2 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 ${
                          locationVerified
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-500"
                            : locationError
                              ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500"
                              : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 focus:ring-indigo-500"
                        }`}
                      >
                        {locationLoading ? "Verifying..." : locationVerified ? "Re-verify" : "Get & Verify Location"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subject-wise Form */}
                {activeTab === "subjectwise" && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Subject Details</h3>
                      {todayAttendance && !todayAttendance.isFullDay && !canAddSubject && (
                        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                          Next subject in {remainingMinutes} minutes
                        </div>
                      )}
                    </div>
                    
                    {todayAttendance && !todayAttendance.isFullDay && (
                      <div className="bg-blue-50 rounded-2xl p-4 mb-4">
                        <h4 className="font-medium text-blue-800 mb-2">Today's Subjects:</h4>
                        <div className="space-y-2">
                          {todayAttendance.subjects?.map((subj, index) => (
                            <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2">
                              <span className="text-sm font-medium">
                                {subj.subjectName} - Class {subj.class}{subj.section}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                subj.status === "Present" 
                                  ? "bg-green-100 text-green-700"
                                  : subj.status === "Leave"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {subj.status}
                              </span>
                            </div>
                          ))}
                        </div>
                        {canAddSubject && (
                          <button
                            type="button"
                            onClick={() => setShowAddSubjectModal(true)}
                            className="w-full mt-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            Add Another Subject
                          </button>
                        )}
                        {!canAddSubject && remainingMinutes > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowAddSubjectModal(true)}
                            className="w-full mt-3 bg-gray-400 text-white py-2 px-4 rounded-xl font-medium cursor-not-allowed opacity-60"
                            disabled
                          >
                            Wait {remainingMinutes} minutes to add subject
                          </button>
                        )}
                      </div>
                    )}

                    {(!todayAttendance || todayAttendance.isFullDay || canAddSubject) && (
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <h4 className="font-medium text-gray-700 mb-3">
                          {todayAttendance && !todayAttendance.isFullDay ? "Add New Subject" : "Mark Subject Attendance"}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                            <select
                              value={subject.class}
                              onChange={(e) => updateSubject("class", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              required
                            >
                              <option value="">Select Class</option>
                              {Array.from({length: 12}, (_, i) => (
                                <option key={i + 1} value={`${i + 1}`}>Class {i + 1}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                            <select
                              value={subject.section}
                              onChange={(e) => updateSubject("section", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              required
                            >
                              <option value="">Select Section</option>
                              {["A", "B", "C", "D", "E"].map(section => (
                                <option key={section} value={section}>Section {section}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                              type="text"
                              value={subject.subjectName}
                              onChange={(e) => updateSubject("subjectName", e.target.value)}
                              placeholder="Subject Name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                              value={subject.status}
                              onChange={(e) => updateSubject("status", e.target.value as "Present" | "Absent" | "Leave")}
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              <option value="Present">Present</option>
                              {/* <option value="Absent">Absent</option>
                              <option value="Leave">Leave</option> */}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Remarks and Submit Button - Only show when teacher can add subjects */}
                {(!todayAttendance || todayAttendance.isFullDay || canAddSubject) && (
                  <>
                    {/* Remarks */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Remarks (Optional)</label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add any additional notes..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="button"
                      onClick={todayAttendance && !todayAttendance.isFullDay && canAddSubject ? handleAddSubject : (e) => handleSubmit(e as any)}
                      disabled={loading || !currentLocation || !locationVerified || (activeTab === "subjectwise" && !!todayAttendance && !todayAttendance.isFullDay && !canAddSubject)}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading 
                        ? (todayAttendance && !todayAttendance.isFullDay && canAddSubject ? "Adding Subject..." : "Marking Attendance...")
                        : !currentLocation
                          ? "Get Location First"
                          : !locationVerified
                            ? "Verify Location First"
                            : activeTab === "daywise" 
                              ? "Mark Day Attendance"
                              : todayAttendance && !todayAttendance.isFullDay && canAddSubject
                                ? "Add Subject"
                                : todayAttendance && !todayAttendance.isFullDay
                                  ? `Wait ${remainingMinutes} minutes`
                                  : "Mark Subject Attendance"
                      }
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Filters and Stats */}
        <div className="mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-800">Attendance History</h2>
              
              {/* Month/Year Filter */}
              <div className="flex items-center gap-3">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {Array.from({length: 5}, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CalendarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800">Days Present</h3>
                    <p className="text-2xl font-bold text-green-700">{monthlyStats.days}</p>
                    <p className="text-sm text-green-600">This month</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-800">Classes Taken</h3>
                    <p className="text-2xl font-bold text-blue-700">{monthlyStats.classes}</p>
                    <p className="text-sm text-blue-600">This month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 px-2">
            {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Records
          </h3>
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-12 h-12 text-indigo-400" />
              </div>
              <p className="text-gray-600 text-lg font-medium">No attendance records found</p>
              <p className="text-gray-500 text-sm mt-1">Your attendance history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((record) => (
                <div key={record._id} className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <CalendarIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{formatDate(record.date)}</h3>
                        <p className="text-sm text-gray-600">
                          {record.isFullDay ? "Day-wise" : "Subject-wise"} • {formatTime(record.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Marked
                    </span>
                  </div>
                  
                  {!record.isFullDay && record.subjects && record.subjects.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Subjects:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {record.subjects.map((subject, index) => (
                          <div key={index} className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-800">
                                {subject.subjectName} - Class {subject.class}{subject.section}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                subject.status === "Present" 
                                  ? "bg-green-100 text-green-700"
                                  : subject.status === "Leave"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {subject.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {record.remarks && (
                    <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Remarks:</span> {record.remarks}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Add Subject</h3>
                <button
                  onClick={() => setShowAddSubjectModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              {!canAddSubject && remainingMinutes > 0 ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClockIcon className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Please Wait</h4>
                  <p className="text-gray-600 mb-4">
                    You need to wait <span className="font-bold text-orange-600">{remainingMinutes} minutes</span> before adding another subject.
                  </p>
                  <p className="text-sm text-gray-500">
                    Minimum 25 minutes gap is required between subject additions.
                  </p>
                  <button
                    onClick={() => setShowAddSubjectModal(false)}
                    className="mt-6 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-xl font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                  >
                    Okay
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Ready to Add Subject</h4>
                  <p className="text-gray-600 mb-6">
                    You can now add another subject to your attendance.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAddSubjectModal(false)}
                      className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowAddSubjectModal(false);
                        // Focus on the first form field (class select)
                        setTimeout(() => {
                          const classSelect = document.querySelector('select[required]') as HTMLSelectElement;
                          classSelect?.focus();
                        }, 100);
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Location Error Modal */}
      {showLocationErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-red-800">Location Verification Failed</h3>
                <button
                  onClick={() => setShowLocationErrorModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="text-center py-4">
                <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircleIcon className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-red-800 mb-4">Cannot Mark Attendance</h4>
                <div className="bg-red-50 rounded-2xl p-4 mb-6">
                  <p className="text-red-700 text-sm leading-relaxed">
                    {locationError}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLocationErrorModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200"
                  >
                    Okay
                  </button>
                  <button
                    onClick={() => {
                      setShowLocationErrorModal(false);
                      getCurrentLocation();
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
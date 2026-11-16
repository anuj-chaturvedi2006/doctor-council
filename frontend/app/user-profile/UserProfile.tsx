"use client";

import { useEffect, useRef, useState, useCallback } from "react";

import type { ReactNode, ElementType } from "react";

import { useRouter } from "next/navigation";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  BookOpen,
  Loader2,
  Camera,
  Pencil,
  Save,
  Award,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  Plus,
  Trash2,
  ClipboardList,
  School,
  Hash,
  ChevronRight,
  Upload,
  ShieldCheck,
  CalendarDays,
  ClipboardCheck,
  NotebookPen,
  BellRing,
  Star,
  Video,
} from "lucide-react";
// ================= TYPES =================

type Tab =
  | "profile"
  | "personal"
  | "academic"
  | "entrance"
  | "counselling"
  | "appointments"
  | "requests"
  | "counselling-notes"
  | "follow-up"
  | "feedback"
  | "sessions";
type StreamOption = {
  _id: string;
  name: string;
};

type CourseOption = {
  _id: string;
  name: string;
};

type CounsellingForm = {
  academicYear: string;
  admissionLevel: string;
  preferredStreams: string[];
  preferredCourses: string[];
  city: string;
  state: string;
  country: string;
  minBudget: string;
  maxBudget: string;
  examName: string;
  score: string;
  percentile: string;
  rank: string;
  examYear: string;
  counsellingMode: string;
  preferredDate: string;
};

interface MyCounsellingRequest {
  _id: string;
  requestNumber: string;
  academicYear: string;
  admissionLevel: string;
  status: string;
  createdAt: string;

  preferredStreams: { _id: string; name: string }[];
  preferredCourses: { _id: string; name: string; code?: string }[];

  preferredLocations: {
    city: string;
    state: string;
    country: string;
  }[];

  budget: {
    min: number;
    max: number;
    currency: string;
  };

  assignedCounsellor?: {
    _id: string;
    name: string;
    email: string;
  } | null;

  recommendations?: {
    colleges: { _id: string; name: string }[];
    courses: { _id: string; name: string; code?: string }[];
    counsellorNote: string;
    sharedAt: string | null;
    sharedBy?: {
      name: string;
      email: string;
    } | null;
  };
}

interface MySessionFeedback {
  _id: string;
  session: {
    _id: string;
    sessionNumber: string;
  };
  rating: number;
  feedback: string;
  suggestions: string;
  createdAt: string;
}

interface MyAppointment {
  _id: string;
  appointmentNumber: string;
  counsellingRequest: {
    _id: string;
    requestNumber: string;
    status: string;
  };
  counsellor: {
    _id: string;
    name: string;
    email: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  timezone: string;
  meetingMode: "online" | "offline";
  meetingLink: string;
  location: string;
  purpose: string;
  notes: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  createdAt: string;
}

interface MyCounsellingSession {
  _id: string;
  sessionNumber: string;

  appointment?: {
    appointmentNumber: string;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
  };

  counsellingRequest?: {
    requestNumber: string;
    status: string;
  };

  counsellor?: {
    name: string;
    email: string;
  };

  sessionDate: string;
  startTime: string;
  endTime: string;

  meetingMode: "online" | "offline";
  meetingLink: string;
  location: string;

  agenda: string;
  discussion: string;
  outcome: string;
  nextSteps: string;

  status: "scheduled" | "in_progress" | "completed" | "cancelled";

  startedAt: string | null;
  completedAt: string | null;
  durationMinutes: number;
  createdAt: string;
}

interface RescheduleHistory {
  _id?: string;
  oldAppointmentDate: string;
  oldAppointmentTime: string;
  oldMeetingMode: "online" | "offline";
  oldMeetingLink?: string;
  oldLocation?: string;
  rescheduledAt: string;
  rescheduledBy?: {
    name?: string;
    email?: string;
  };
}

const emptyCounsellingForm: CounsellingForm = {
  academicYear: "2026-2027",
  admissionLevel: "UG",
  preferredStreams: [],
  preferredCourses: [],
  city: "",
  state: "",
  country: "India",
  minBudget: "",
  maxBudget: "",
  examName: "",
  score: "",
  percentile: "",
  rank: "",
  examYear: "",
  counsellingMode: "phone",
  preferredDate: "",
};

type EntranceExam = {
  examName?: string;
  examYear?: string;
  applicationNumber?: string;
  rollNumber?: string;
  obtainedMarks?: string;
  percentile?: string;
  allIndiaRank?: string;
  resultStatus?: string;
};

type StudentProfileData = {
  gender?: string;
  dateOfBirth?: string;
  profileImage?: string;

  address?: {
    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };

  academicDetails?: {
    course?: string;
    college?: string;
    university?: string;
    stream?: string;
    admissionYear?: string;
    semester?: string;
    enrollmentNumber?: string;
    qualification?: string;
    board?: string;
    passingYear?: string;
    percentage?: string;
  };

  entranceExams?: EntranceExam[];
};

type UserData = {
  name?: string;
  email?: string;
  contact?: string;
  phone?: string;
};

const emptyAcademic = {
  course: "",
  college: "",
  university: "",
  stream: "",
  admissionYear: "",
  semester: "",
  enrollmentNumber: "",
  qualification: "",
  board: "",
  passingYear: "",
  percentage: "",
};

const emptyPersonal = {
  gender: "",
  dateOfBirth: "",
  addressLine: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
};

const emptyExam: EntranceExam = {
  examName: "",
  examYear: "",
  applicationNumber: "",
  rollNumber: "",
  obtainedMarks: "",
  percentile: "",
  allIndiaRank: "",
  resultStatus: "",
};

// ================= REUSABLE COMPONENTS =================

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">{icon}</div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-800">
            {value || (
              <span className="font-normal italic text-slate-400">
                Not added yet
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `Enter ${label}`}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function SectionHeader({
  title,
  description,
  icon,
  editing,
  onEdit,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  editing?: boolean;
  onEdit?: () => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">{icon}</div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>

      {!editing && onEdit && (
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-600"
        >
          <Pencil size={14} />
          Edit Details
        </button>
      )}
    </div>
  );
}

// ================= MAIN COMPONENT =================

export default function UserProfile() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2002";
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);

  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [editingPersonal, setEditingPersonal] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);

  const [personalForm, setPersonalForm] = useState(emptyPersonal);

  const [editingAcademic, setEditingAcademic] = useState(false);
  const [savingAcademic, setSavingAcademic] = useState(false);

  const [academicForm, setAcademicForm] = useState(emptyAcademic);

  const [editingExamIndex, setEditingExamIndex] = useState<number | null>(null);
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [savingExam, setSavingExam] = useState(false);
  const [examForm, setExamForm] = useState<EntranceExam>(emptyExam);

  const [counsellingModalOpen, setCounsellingModalOpen] = useState(false);
  const [savingCounselling, setSavingCounselling] = useState(false);

  const [streams, setStreams] = useState<StreamOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(false);

  const [myRequests, setMyRequests] = useState<MyCounsellingRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");

  const [counsellingForm, setCounsellingForm] =
    useState<CounsellingForm>(emptyCounsellingForm);

  const [appointments, setAppointments] = useState<MyAppointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");

  const [sessions, setSessions] = useState<MyCounsellingSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");

  const [sessionFeedbacks, setSessionFeedbacks] = useState<MySessionFeedback[]>(
    [],
  );

  const [feedbackOpenSessionId, setFeedbackOpenSessionId] = useState("");

  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSuggestions, setFeedbackSuggestions] = useState("");

  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const [rescheduleHistory, setRescheduleHistory] = useState<
    RescheduleHistory[]
  >([]);

  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [selectedHistoryId, setSelectedHistoryId] = useState("");
  // ================= SIDEBAR LINKS =================

  const sidebarLinks: {
    id: Tab;
    label: string;
    icon: ElementType;
  }[] = [
    {
      id: "profile",
      label: "My Profile",
      icon: LayoutDashboard,
    },
    {
      id: "personal",
      label: "Personal Details",
      icon: User,
    },
    {
      id: "academic",
      label: "Academic Details",
      icon: GraduationCap,
    },
    {
      id: "entrance",
      label: "Entrance Exam",
      icon: Award,
    },
    {
      id: "counselling",
      label: "Counselling Request",
      icon: ClipboardList,
    },
    {
      id: "appointments",
      label: "My Appointments",
      icon: CalendarDays,
    },
    {
      id: "requests",
      label: "My Requests",
      icon: ClipboardCheck,
    },
    {
      id: "counselling-notes",
      label: "My Counselling Notes",
      icon: NotebookPen,
    },
    {
      id: "follow-up",
      label: "Follow Up",
      icon: BellRing,
    },
    {
      id: "feedback",
      label: "Feedback & Ratings",
      icon: Star,
    },
    {
      id: "sessions",
      label: "Counselling Sessions",
      icon: Video,
    },
  ];

  // ================= FETCH PROFILE =================

  const getProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/student-login");
      return;
    }

    try {
      // const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("API URL is not configured");
      }

      const response = await axios.get(`${apiUrl}/student-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedUser = response.data.user || null;
      const fetchedProfile = response.data.profile || null;

      setUser(fetchedUser);
      setProfile(fetchedProfile);

      const academic = fetchedProfile?.academicDetails;
      const address = fetchedProfile?.address;

      setAcademicForm({
        course: academic?.course || "",
        college: academic?.college || "",
        university: academic?.university || "",
        stream: academic?.stream || "",
        admissionYear: academic?.admissionYear || "",
        semester: academic?.semester || "",
        enrollmentNumber: academic?.enrollmentNumber || "",
        qualification: academic?.qualification || "",
        board: academic?.board || "",
        passingYear: academic?.passingYear || "",
        percentage: academic?.percentage || "",
      });

      setPersonalForm({
        gender: fetchedProfile?.gender || "",
        dateOfBirth: fetchedProfile?.dateOfBirth
          ? fetchedProfile.dateOfBirth.slice(0, 10)
          : "",
        addressLine: address?.addressLine || "",
        city: address?.city || "",
        state: address?.state || "",
        country: address?.country || "India",
        pincode: address?.pincode || "",
      });
    } catch (error) {
      console.error("Profile fetching error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/student-login");
        } else {
          alert(error.response?.data?.message || "Unable to fetch profile");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setRequestsError("Please login again.");
      return;
    }

    try {
      setRequestsLoading(true);
      setRequestsError("");

      const response = await axios.get(
        `${apiUrl}/student/my-counselling-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setMyRequests(response.data.data || []);
      } else {
        setMyRequests([]);
        setRequestsError(response.data.message || "Unable to fetch requests");
      }
    } catch (error: unknown) {
      console.error("My Requests Error:", error);

      if (axios.isAxiosError(error)) {
        setRequestsError(
          error.response?.data?.message ||
            "Unable to fetch counselling requests",
        );
      } else {
        setRequestsError("Something went wrong");
      }
    } finally {
      setRequestsLoading(false);
    }
  }, [apiUrl]);

  const fetchRescheduleHistory = async (appointmentId: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setHistoryError("Please login again.");
      return;
    }

    try {
      setHistoryLoading(true);
      setHistoryError("");
      setRescheduleHistory([]);
      setSelectedHistoryId(appointmentId);

      const response = await axios.get(
        `${apiUrl}/appointment-reschedule-history/${appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setRescheduleHistory(response.data.data || []);
      } else {
        setHistoryError(response.data.message || "Unable to fetch history");
      }
    } catch (error: unknown) {
      console.error("Reschedule History Error:", error);

      if (axios.isAxiosError(error)) {
        setHistoryError(
          error.response?.data?.message || "Unable to fetch history",
        );
      } else {
        setHistoryError("Something went wrong");
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchMyAppointments = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAppointmentsError("Please login again.");
      return;
    }

    try {
      setAppointmentsLoading(true);
      setAppointmentsError("");

      const response = await axios.get(`${apiUrl}/student/my-appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setAppointments(response.data.data || []);
      } else {
        setAppointments([]);
        setAppointmentsError(
          response.data.message || "Unable to fetch appointments",
        );
      }
    } catch (error: unknown) {
      console.error("My Appointments Error:", error);

      if (axios.isAxiosError(error)) {
        setAppointmentsError(
          error.response?.data?.message || "Unable to fetch appointments",
        );
      } else {
        setAppointmentsError("Something went wrong");
      }
    } finally {
      setAppointmentsLoading(false);
    }
  }, [apiUrl]);

  const fetchMySessions = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setSessionsError("Please login again.");
      return;
    }

    try {
      setSessionsLoading(true);
      setSessionsError("");

      const response = await axios.get(`${apiUrl}/get-counselling-sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setSessions(response.data.data || []);
      } else {
        setSessions([]);
        setSessionsError(response.data.message || "Unable to fetch sessions");
      }
    } catch (error: unknown) {
      console.error("My Sessions Error:", error);

      if (axios.isAxiosError(error)) {
        setSessionsError(
          error.response?.data?.message ||
            "Unable to fetch counselling sessions",
        );
      } else {
        setSessionsError("Something went wrong");
      }
    } finally {
      setSessionsLoading(false);
    }
  }, [apiUrl]);

  const fetchMySessionFeedbacks = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      setFeedbackLoading(true);

      const response = await axios.get(
        `${apiUrl}/student/my-session-feedbacks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setSessionFeedbacks(response.data.data || []);
      }
    } catch (error) {
      console.error("Session Feedback Error:", error);
    } finally {
      setFeedbackLoading(false);
    }
  }, [apiUrl]);

  const handleSessionFeedbackSubmit = async (sessionId: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again");
      return;
    }

    if (feedbackRating < 1 || feedbackRating > 5) {
      alert("Please select a rating");
      return;
    }

    try {
      setFeedbackSubmitting(true);

      const response = await axios.post(
        `${apiUrl}/student/session-feedback/${sessionId}`,
        {
          rating: feedbackRating,
          feedback: feedbackText,
          suggestions: feedbackSuggestions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        alert("Feedback submitted successfully!");

        setFeedbackOpenSessionId("");
        setFeedbackRating(5);
        setFeedbackText("");
        setFeedbackSuggestions("");

        await fetchMySessionFeedbacks();
      }
    } catch (error) {
      console.error("Submit Feedback Error:", error);

      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Unable to submit feedback");
      }
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  useEffect(() => {
    if (activeTab === "appointments") {
      fetchMyAppointments();
    }
  }, [activeTab, fetchMyAppointments]);

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "requests") {
      fetchMyRequests();
    }
  }, [activeTab, fetchMyRequests]);

  useEffect(() => {
    if (activeTab === "sessions") {
      fetchMySessions();
    }
  }, [activeTab, fetchMySessions]);

  useEffect(() => {
  if (activeTab === "feedback") {
    fetchMySessionFeedbacks();
  }
}, [activeTab, fetchMySessionFeedbacks]);



  // ================= IMAGE URL =================

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "";

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    return `${apiUrl.replace(/\/$/, "")}/${imagePath.replace(/^\//, "")}`;
  };

  // ================= IMAGE CHANGE =================

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG and WEBP images are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2 MB");
      e.target.value = "";
      return;
    }

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  // ================= IMAGE UPLOAD =================

  const handleImageUpload = async () => {
    if (!selectedImage) {
      alert("Please select an image first");
      return;
    }

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!token || !apiUrl) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("profileImage", selectedImage);

      const response = await axios.put(
        `${apiUrl}/student-profile/upload-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProfile((prev) => ({
        ...(prev || {}),
        ...(response.data.profile || {}),
      }));

      setSelectedImage(null);
      setPreviewImage(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert("Profile image uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);

      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Image upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  // ================= PERSONAL UPDATE =================

  const handlePersonalUpdate = async () => {
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!token || !apiUrl) return;

    try {
      setSavingPersonal(true);

      const response = await axios.put(
        `${apiUrl}/student-profile/personal`,
        {
          gender: personalForm.gender,
          dateOfBirth: personalForm.dateOfBirth || null,
          address: {
            addressLine: personalForm.addressLine,
            city: personalForm.city,
            state: personalForm.state,
            country: personalForm.country,
            pincode: personalForm.pincode,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProfile((prev) => ({
        ...(prev || {}),
        ...(response.data.profile || {}),
      }));

      setEditingPersonal(false);

      alert("Personal details updated successfully!");
    } catch (error) {
      console.error("Personal update error:", error);

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message || "Failed to update personal details",
        );
      }
    } finally {
      setSavingPersonal(false);
    }
  };

  // ================= ACADEMIC UPDATE =================

  const handleAcademicUpdate = async () => {
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!token || !apiUrl) return;

    try {
      setSavingAcademic(true);

      const response = await axios.put(
        `${apiUrl}/student-profile/academic`,
        academicForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProfile((prev) => ({
        ...(prev || {}),
        ...(response.data.profile || {}),
      }));

      setEditingAcademic(false);

      alert("Academic details updated successfully!");
    } catch (error) {
      console.error("Academic update error:", error);

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message || "Failed to update academic details",
        );
      }
    } finally {
      setSavingAcademic(false);
    }
  };

  // ================= ENTRANCE EXAM =================

  const openAddExam = () => {
    setEditingExamIndex(null);
    setExamForm({ ...emptyExam });
    setExamModalOpen(true);
  };

  const openEditExam = (index: number) => {
    setEditingExamIndex(index);
    setExamForm({
      ...emptyExam,
      ...profile?.entranceExams?.[index],
    });
    setExamModalOpen(true);
  };

  const handleExamSave = async () => {
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!token || !apiUrl) return;

    if (!examForm.examName?.trim()) {
      alert("Please enter exam name");
      return;
    }

    try {
      setSavingExam(true);

      const exams = [...(profile?.entranceExams || [])];

      if (editingExamIndex !== null) {
        exams[editingExamIndex] = examForm;
      } else {
        exams.push(examForm);
      }

      // This endpoint must be available in your backend.
      const response = await axios.put(
        `${apiUrl}/student-profile/entrance-exams`,
        {
          entranceExams: exams,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProfile((prev) => ({
        ...(prev || {}),
        ...(response.data.profile || {}),
        entranceExams: response.data.profile?.entranceExams || exams,
      }));

      setExamModalOpen(false);
      setExamForm({ ...emptyExam });
      setEditingExamIndex(null);

      alert(
        editingExamIndex !== null
          ? "Entrance exam updated successfully!"
          : "Entrance exam added successfully!",
      );
    } catch (error) {
      console.error("Entrance exam save error:", error);

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Failed to save entrance exam. Please check the backend API.",
        );
      }
    } finally {
      setSavingExam(false);
    }
  };

  const handleExamDelete = async (index: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this entrance exam?",
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!token || !apiUrl) return;

    try {
      const exams = [...(profile?.entranceExams || [])];

      exams.splice(index, 1);

      const response = await axios.put(
        `${apiUrl}/student-profile/entrance-exams`,
        {
          entranceExams: exams,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProfile((prev) => ({
        ...(prev || {}),
        ...(response.data.profile || {}),
        entranceExams: response.data.profile?.entranceExams || exams,
      }));

      alert("Entrance exam deleted successfully!");
    } catch (error) {
      console.error("Exam delete error:", error);

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message || "Failed to delete entrance exam",
        );
      }
    }
  };

  // ================= LOGOUT =================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/student-login");
  };

  // ================= CANCEL FUNCTIONS =================

  const cancelPersonal = () => {
    const address = profile?.address;

    setPersonalForm({
      gender: profile?.gender || "",
      dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
      addressLine: address?.addressLine || "",
      city: address?.city || "",
      state: address?.state || "",
      country: address?.country || "India",
      pincode: address?.pincode || "",
    });

    setEditingPersonal(false);
  };

  const cancelAcademic = () => {
    setAcademicForm({
      ...emptyAcademic,
      ...profile?.academicDetails,
    });

    setEditingAcademic(false);
  };

  const openCounsellingModal = async () => {
    setCounsellingModalOpen(true);

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!token || !apiUrl) return;

    try {
      setLoadingOptions(true);

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [streamResponse, courseResponse] = await Promise.all([
        axios.get(`${apiUrl}/student/get-streams`, { headers }),
        axios.get(`${apiUrl}/student/get-courses`, { headers }),
      ]);

      setStreams(streamResponse.data.streams || []);
      setCourses(courseResponse.data.courses || []);
    } catch (error) {
      console.error("Counselling options error:", error);

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message || "Unable to load streams and courses",
        );
      }
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleCounsellingSubmit = async () => {
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const minBudget = Number(counsellingForm.minBudget) || 0;
    const maxBudget = Number(counsellingForm.maxBudget) || 0;

    if (maxBudget > 0 && minBudget > maxBudget) {
      alert("Minimum budget cannot be greater than maximum budget");
      return;
    }

    if (!token || !apiUrl) return;

    if (!counsellingForm.academicYear || !counsellingForm.preferredDate) {
      alert("Please fill Academic Year and Preferred Date");
      return;
    }

    try {
      setSavingCounselling(true);

      const payload = {
        academicYear: counsellingForm.academicYear,
        admissionLevel: counsellingForm.admissionLevel,

        preferredStreams: counsellingForm.preferredStreams,
        preferredCourses: counsellingForm.preferredCourses,

        preferredLocations: counsellingForm.city
          ? [
              {
                city: counsellingForm.city,
                state: counsellingForm.state,
                country: counsellingForm.country,
              },
            ]
          : [],

        budget: {
          min: Number(counsellingForm.minBudget) || 0,
          max: Number(counsellingForm.maxBudget) || 0,
          currency: "INR",
        },

        entranceExams: counsellingForm.examName.trim()
          ? [
              {
                examName: counsellingForm.examName,
                score: counsellingForm.score,
                percentile: counsellingForm.percentile,
                rank: counsellingForm.rank,
                year: Number(counsellingForm.examYear) || undefined,
              },
            ]
          : [],

        counsellingMode: counsellingForm.counsellingMode,

        preferredTime: {
          date: counsellingForm.preferredDate,
          timezone: "Asia/Kolkata",
        },
      };

      const response = await axios.post(
        `${apiUrl}/student/counselling-request`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert(
        response.data.message || "Counselling request submitted successfully!",
      );

      setCounsellingModalOpen(false);
      setCounsellingForm({ ...emptyCounsellingForm });
    } catch (error) {
      console.error("Counselling request error:", error);

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Failed to submit counselling request",
        );
      }
    } finally {
      setSavingCounselling(false);
    }
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-sm font-medium text-slate-600">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // ================= MAIN UI =================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* MOBILE HEADER */}

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 lg:hidden">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-blue-600" size={27} />
          <span className="text-lg font-bold text-slate-900">
            Student Portal
          </span>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg border border-slate-200 p-2 text-slate-700"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <div className="flex min-h-screen">
        {/* MOBILE OVERLAY */}

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          />
        )}

        {/* SIDEBAR */}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* LOGO */}

          <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white">
              <GraduationCap size={25} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Student Portal
              </h1>
              <p className="text-xs text-slate-400">Dashboard</p>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto rounded-lg p-2 text-slate-500 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* USER INFO */}

          <div className="border-b border-slate-100 px-5 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-blue-600">
                {profile?.profileImage ? (
                  <img
                    src={getImageUrl(profile.profileImage)}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={25} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-bold text-slate-900">
                  {user?.name || "Student"}
                </h2>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* NAVIGATION */}

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Main Menu
            </p>

            <nav className="space-y-2">
              {sidebarLinks.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.id !== "counselling" && activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSidebarOpen(false);

                      if (item.id === "counselling") {
                        openCounsellingModal();
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                        : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    <Icon size={19} />

                    <span>{item.label}</span>

                    {isActive && <ChevronRight size={17} className="ml-auto" />}
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Account
              </p>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
              >
                <LogOut size={19} />
                Logout
              </button>
            </div>
          </div>

          {/* SIDEBAR FOOTER */}

          <div className="border-t border-slate-100 p-5">
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 p-3">
              <ShieldCheck className="text-blue-600" size={20} />
              <div>
                <p className="text-xs font-bold text-blue-900">
                  Student Account
                </p>
                <p className="text-[10px] text-blue-600">
                  Manage your information
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN BODY */}

        <main className="min-w-0 flex-1">
          {/* TOP HEADER */}

          <div className="hidden items-center justify-between border-b border-slate-200 bg-white px-8 py-5 lg:flex">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {sidebarLinks.find((item) => item.id === activeTab)?.label}
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Manage your student account and information
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500">Student</p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-blue-600">
                {profile?.profileImage ? (
                  <img
                    src={getImageUrl(profile.profileImage)}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={22} />
                )}
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
            {/* ================= MY PROFILE ================= */}

            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="h-36 bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500" />

                  <div className="px-5 pb-7 sm:px-8">
                    <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end">
                      {/* PROFILE IMAGE */}

                      <div className="relative h-28 w-28 shrink-0">
                        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-slate-100 text-slate-400 shadow-lg">
                          {previewImage || profile?.profileImage ? (
                            <img
                              src={
                                previewImage ||
                                getImageUrl(profile?.profileImage)
                              }
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User size={55} />
                          )}
                        </div>

                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg hover:bg-blue-700"
                        >
                          <Camera size={17} />
                        </button>

                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>

                      <div className="flex-1 pb-1">
                        <h2 className="text-2xl font-bold text-slate-900">
                          {user?.name || "Student"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {user?.email}
                        </p>

                        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          <GraduationCap size={14} />
                          Student Account
                        </span>
                      </div>

                      {previewImage && (
                        <div className="flex flex-wrap gap-2 pb-1">
                          <button
                            onClick={handleImageUpload}
                            disabled={uploading}
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {uploading ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Upload size={16} />
                            )}
                            {uploading ? "Uploading..." : "Upload Photo"}
                          </button>

                          <button
                            onClick={() => {
                              setSelectedImage(null);
                              setPreviewImage(null);

                              if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                              }
                            }}
                            disabled={uploading}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* QUICK INFORMATION */}

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoCard
                    label="Full Name"
                    value={user?.name}
                    icon={<User size={19} />}
                  />

                  <InfoCard
                    label="Email Address"
                    value={user?.email}
                    icon={<Mail size={19} />}
                  />

                  <InfoCard
                    label="Contact Number"
                    value={user?.contact || user?.phone}
                    icon={<Phone size={19} />}
                  />

                  <InfoCard
                    label="Gender"
                    value={profile?.gender}
                    icon={<User size={19} />}
                  />

                  <InfoCard
                    label="Date of Birth"
                    value={
                      profile?.dateOfBirth
                        ? new Date(profile.dateOfBirth).toLocaleDateString(
                            "en-IN",
                          )
                        : ""
                    }
                    icon={<Calendar size={19} />}
                  />

                  <InfoCard
                    label="Course"
                    value={profile?.academicDetails?.course}
                    icon={<BookOpen size={19} />}
                  />

                  <InfoCard
                    label="College"
                    value={profile?.academicDetails?.college}
                    icon={<School size={19} />}
                  />

                  <InfoCard
                    label="City"
                    value={profile?.address?.city}
                    icon={<MapPin size={19} />}
                  />

                  <InfoCard
                    label="State"
                    value={profile?.address?.state}
                    icon={<MapPin size={19} />}
                  />
                </div>

                {/* PROFILE SHORTCUTS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                  <h3 className="mb-5 text-base font-bold text-slate-900">
                    Manage Your Profile
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <button
                      onClick={() => setActiveTab("personal")}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                        <User size={22} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">
                          Personal Details
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Update your information
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-slate-400" />
                    </button>

                    <button
                      onClick={() => setActiveTab("academic")}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
                        <GraduationCap size={22} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">
                          Academic Details
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Manage education details
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-slate-400" />
                    </button>

                    <button
                      onClick={() => setActiveTab("entrance")}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="rounded-lg bg-amber-100 p-3 text-amber-600">
                        <Award size={22} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">
                          Entrance Exam
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Manage exam information
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= PERSONAL DETAILS ================= */}

            {activeTab === "personal" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <SectionHeader
                  title="Personal Details"
                  description="Manage your personal information and address"
                  icon={<User size={22} />}
                  editing={editingPersonal}
                  onEdit={() => setEditingPersonal(true)}
                />

                {editingPersonal ? (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Gender
                      </label>

                      <select
                        value={personalForm.gender}
                        onChange={(e) =>
                          setPersonalForm({
                            ...personalForm,
                            gender: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <FormInput
                      label="Date of Birth"
                      type="date"
                      value={personalForm.dateOfBirth}
                      onChange={(value) =>
                        setPersonalForm({
                          ...personalForm,
                          dateOfBirth: value,
                        })
                      }
                    />

                    <div className="sm:col-span-2">
                      <FormInput
                        label="Address Line"
                        value={personalForm.addressLine}
                        onChange={(value) =>
                          setPersonalForm({
                            ...personalForm,
                            addressLine: value,
                          })
                        }
                      />
                    </div>

                    <FormInput
                      label="City"
                      value={personalForm.city}
                      onChange={(value) =>
                        setPersonalForm({
                          ...personalForm,
                          city: value,
                        })
                      }
                    />

                    <FormInput
                      label="State"
                      value={personalForm.state}
                      onChange={(value) =>
                        setPersonalForm({
                          ...personalForm,
                          state: value,
                        })
                      }
                    />

                    <FormInput
                      label="Country"
                      value={personalForm.country}
                      onChange={(value) =>
                        setPersonalForm({
                          ...personalForm,
                          country: value,
                        })
                      }
                    />

                    <FormInput
                      label="Pincode"
                      value={personalForm.pincode}
                      onChange={(value) =>
                        setPersonalForm({
                          ...personalForm,
                          pincode: value,
                        })
                      }
                    />

                    <div className="flex flex-wrap gap-3 pt-2 sm:col-span-2">
                      <button
                        onClick={handlePersonalUpdate}
                        disabled={savingPersonal}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {savingPersonal ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <Save size={17} />
                        )}
                        {savingPersonal ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        onClick={cancelPersonal}
                        disabled={savingPersonal}
                        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoCard
                      label="Full Name"
                      value={user?.name}
                      icon={<User size={19} />}
                    />

                    <InfoCard
                      label="Email"
                      value={user?.email}
                      icon={<Mail size={19} />}
                    />

                    <InfoCard
                      label="Contact"
                      value={user?.contact || user?.phone}
                      icon={<Phone size={19} />}
                    />

                    <InfoCard
                      label="Gender"
                      value={profile?.gender}
                      icon={<User size={19} />}
                    />

                    <InfoCard
                      label="Date of Birth"
                      value={
                        profile?.dateOfBirth
                          ? new Date(profile.dateOfBirth).toLocaleDateString(
                              "en-IN",
                            )
                          : ""
                      }
                      icon={<Calendar size={19} />}
                    />

                    <InfoCard
                      label="Address"
                      value={profile?.address?.addressLine}
                      icon={<MapPin size={19} />}
                    />

                    <InfoCard
                      label="City"
                      value={profile?.address?.city}
                      icon={<MapPin size={19} />}
                    />

                    <InfoCard
                      label="State"
                      value={profile?.address?.state}
                      icon={<MapPin size={19} />}
                    />

                    <InfoCard
                      label="Country"
                      value={profile?.address?.country}
                      icon={<MapPin size={19} />}
                    />

                    <InfoCard
                      label="Pincode"
                      value={profile?.address?.pincode}
                      icon={<Hash size={19} />}
                    />
                  </div>
                )}
              </section>
            )}

            {/* ================= ACADEMIC DETAILS ================= */}

            {activeTab === "academic" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <SectionHeader
                  title="Academic Details"
                  description="Manage your educational information"
                  icon={<GraduationCap size={22} />}
                  editing={editingAcademic}
                  onEdit={() => setEditingAcademic(true)}
                />

                {editingAcademic ? (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {(
                      [
                        ["course", "Course"],
                        ["college", "College"],
                        ["university", "University"],
                        ["stream", "Stream"],
                        ["admissionYear", "Admission Year"],
                        ["semester", "Semester"],
                        ["enrollmentNumber", "Enrollment Number"],
                        ["qualification", "Qualification"],
                        ["board", "Board"],
                        ["passingYear", "Passing Year"],
                        ["percentage", "Percentage"],
                      ] as const
                    ).map(([key, label]) => (
                      <FormInput
                        key={key}
                        label={label}
                        value={academicForm[key]}
                        onChange={(value) =>
                          setAcademicForm((prev) => ({
                            ...prev,
                            [key]: value,
                          }))
                        }
                      />
                    ))}

                    <div className="flex flex-wrap gap-3 pt-2 sm:col-span-2">
                      <button
                        onClick={handleAcademicUpdate}
                        disabled={savingAcademic}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {savingAcademic ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <Save size={17} />
                        )}
                        {savingAcademic ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        onClick={cancelAcademic}
                        disabled={savingAcademic}
                        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoCard
                      label="Course"
                      value={profile?.academicDetails?.course}
                      icon={<BookOpen size={19} />}
                    />

                    <InfoCard
                      label="College"
                      value={profile?.academicDetails?.college}
                      icon={<School size={19} />}
                    />

                    <InfoCard
                      label="University"
                      value={profile?.academicDetails?.university}
                      icon={<GraduationCap size={19} />}
                    />

                    <InfoCard
                      label="Stream"
                      value={profile?.academicDetails?.stream}
                      icon={<BookOpen size={19} />}
                    />

                    <InfoCard
                      label="Admission Year"
                      value={profile?.academicDetails?.admissionYear}
                      icon={<Calendar size={19} />}
                    />

                    <InfoCard
                      label="Semester"
                      value={profile?.academicDetails?.semester}
                      icon={<BookOpen size={19} />}
                    />

                    <InfoCard
                      label="Enrollment Number"
                      value={profile?.academicDetails?.enrollmentNumber}
                      icon={<Hash size={19} />}
                    />

                    <InfoCard
                      label="Qualification"
                      value={profile?.academicDetails?.qualification}
                      icon={<GraduationCap size={19} />}
                    />

                    <InfoCard
                      label="Board"
                      value={profile?.academicDetails?.board}
                      icon={<School size={19} />}
                    />

                    <InfoCard
                      label="Passing Year"
                      value={profile?.academicDetails?.passingYear}
                      icon={<Calendar size={19} />}
                    />

                    <InfoCard
                      label="Percentage"
                      value={profile?.academicDetails?.percentage}
                      icon={<Award size={19} />}
                    />
                  </div>
                )}
              </section>
            )}

            {/* ================= ENTRANCE EXAM ================= */}

            {activeTab === "entrance" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                      <Award size={22} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Entrance Exam Details
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Manage your entrance examination records
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={openAddExam}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Plus size={17} />
                    Add Exam
                  </button>
                </div>

                {!profile?.entranceExams?.length ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Award size={30} />
                    </div>

                    <h3 className="text-base font-bold text-slate-800">
                      No Entrance Exam Added
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Add your entrance exam details to your student profile.
                    </p>

                    <button
                      onClick={openAddExam}
                      className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Add Your First Exam
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {profile.entranceExams.map((exam, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200 p-5 transition hover:shadow-sm sm:p-6"
                      >
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                              {index + 1}
                            </div>

                            <div>
                              <h3 className="font-bold text-slate-900">
                                {exam.examName || `Entrance Exam ${index + 1}`}
                              </h3>

                              <p className="text-xs text-slate-500">
                                Exam Year: {exam.examYear || "Not added"}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditExam(index)}
                              className="rounded-lg border border-blue-100 bg-blue-50 p-2.5 text-blue-600 hover:bg-blue-100"
                              title="Edit Exam"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() => handleExamDelete(index)}
                              className="rounded-lg border border-red-100 bg-red-50 p-2.5 text-red-500 hover:bg-red-100"
                              title="Delete Exam"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <InfoCard
                            label="Exam Year"
                            value={exam.examYear}
                            icon={<Calendar size={19} />}
                          />

                          <InfoCard
                            label="Application Number"
                            value={exam.applicationNumber}
                            icon={<Hash size={19} />}
                          />

                          <InfoCard
                            label="Roll Number"
                            value={exam.rollNumber}
                            icon={<ClipboardList size={19} />}
                          />

                          <InfoCard
                            label="Obtained Marks"
                            value={exam.obtainedMarks}
                            icon={<BookOpen size={19} />}
                          />

                          <InfoCard
                            label="Percentile"
                            value={exam.percentile}
                            icon={<Award size={19} />}
                          />

                          <InfoCard
                            label="All India Rank"
                            value={exam.allIndiaRank}
                            icon={<GraduationCap size={19} />}
                          />

                          <InfoCard
                            label="Result Status"
                            value={exam.resultStatus}
                            icon={<ShieldCheck size={19} />}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ================= MY REQUESTS ================= */}

            {activeTab === "requests" && (
              <section className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      My Counselling Requests
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Track your counselling requests and recommendations.
                    </p>
                  </div>

                  <button
                    onClick={fetchMyRequests}
                    disabled={requestsLoading}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {requestsLoading && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    Refresh
                  </button>
                </div>

                {/* Loading */}
                {requestsLoading && (
                  <div className="rounded-2xl border bg-white p-10 text-center">
                    <Loader2
                      className="mx-auto animate-spin text-blue-600"
                      size={32}
                    />
                    <p className="mt-3 text-sm text-slate-500">
                      Loading your requests...
                    </p>
                  </div>
                )}

                {/* Error */}
                {!requestsLoading && requestsError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {requestsError}
                    <button
                      onClick={fetchMyRequests}
                      className="ml-2 font-bold underline"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* Empty */}
                {!requestsLoading &&
                  !requestsError &&
                  myRequests.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                      <ClipboardList
                        size={40}
                        className="mx-auto text-slate-400"
                      />
                      <h3 className="mt-4 font-bold text-slate-800">
                        No Counselling Requests Found
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        You have not submitted any counselling requests yet.
                      </p>
                    </div>
                  )}

                {/* Request Cards */}
                {!requestsLoading &&
                  myRequests.map((request) => {
                    const statusColors: Record<string, string> = {
                      new: "bg-blue-100 text-blue-700",
                      assigned: "bg-purple-100 text-purple-700",
                      contact_pending: "bg-yellow-100 text-yellow-700",
                      in_progress: "bg-orange-100 text-orange-700",
                      recommendations_shared: "bg-green-100 text-green-700",
                      converted: "bg-emerald-100 text-emerald-700",
                      closed: "bg-slate-200 text-slate-700",
                      cancelled: "bg-red-100 text-red-700",
                    };

                    return (
                      <div
                        key={request._id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                      >
                        {/* Request Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                          <div>
                            <h3 className="font-bold text-slate-900">
                              {request.requestNumber}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              Submitted:{" "}
                              {new Date(request.createdAt).toLocaleDateString(
                                "en-IN",
                              )}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                              statusColors[request.status] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {request.status.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </div>

                        {/* Request Information */}
                        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
                          <InfoCard
                            label="Admission Level"
                            value={request.admissionLevel}
                            icon={<GraduationCap size={19} />}
                          />

                          <InfoCard
                            label="Academic Year"
                            value={request.academicYear}
                            icon={<Calendar size={19} />}
                          />

                          <InfoCard
                            label="Counselling Mode"
                            value={request.counsellingMode}
                            icon={<Video size={19} />}
                          />

                          <InfoCard
                            label="Preferred Streams"
                            value={
                              request.preferredStreams
                                ?.map((stream) => stream.name)
                                .join(", ") || ""
                            }
                            icon={<BookOpen size={19} />}
                          />

                          <InfoCard
                            label="Preferred Courses"
                            value={
                              request.preferredCourses
                                ?.map((course) => course.name)
                                .join(", ") || ""
                            }
                            icon={<BookOpen size={19} />}
                          />

                          <InfoCard
                            label="Preferred Location"
                            value={
                              request.preferredLocations
                                ?.map((location) =>
                                  [
                                    location.city,
                                    location.state,
                                    location.country,
                                  ]
                                    .filter(Boolean)
                                    .join(", "),
                                )
                                .join(" | ") || ""
                            }
                            icon={<MapPin size={19} />}
                          />

                          <InfoCard
                            label="Minimum Budget"
                            value={
                              request.budget
                                ? `₹${request.budget.min.toLocaleString("en-IN")}`
                                : ""
                            }
                            icon={<Award size={19} />}
                          />

                          <InfoCard
                            label="Maximum Budget"
                            value={
                              request.budget
                                ? `₹${request.budget.max.toLocaleString("en-IN")}`
                                : ""
                            }
                            icon={<Award size={19} />}
                          />
                        </div>

                        {/* Assigned Counsellor */}
                        <div className="border-t border-slate-100 bg-slate-50 p-5">
                          <h4 className="mb-3 font-bold text-slate-800">
                            Assigned Counsellor
                          </h4>

                          {request.assignedCounsellor ? (
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <User size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {request.assignedCounsellor.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {request.assignedCounsellor.email}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">
                              Counsellor has not been assigned yet.
                            </p>
                          )}
                        </div>

                        {/* Recommendations */}
                        {request.status === "recommendations_shared" &&
                          request.recommendations && (
                            <div className="space-y-5 border-t border-green-200 bg-green-50/50 p-5">
                              <div>
                                <h4 className="text-lg font-bold text-green-800">
                                  <span className="inline-flex items-center gap-2">
                                    <ShieldCheck size={20} />
                                    Counsellor Recommendations
                                  </span>
                                </h4>

                                <p className="mt-1 text-xs text-slate-500">
                                  Shared by:{" "}
                                  {request.recommendations.sharedBy?.name ||
                                    request.assignedCounsellor?.name ||
                                    "Counsellor"}
                                </p>

                                {request.recommendations.sharedAt && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    Shared on:{" "}
                                    {new Date(
                                      request.recommendations.sharedAt,
                                    ).toLocaleString("en-IN")}
                                  </p>
                                )}
                              </div>

                              {/* Recommended Colleges */}
                              <div>
                                <h5 className="mb-3 font-bold text-slate-800">
                                  Recommended Colleges
                                </h5>

                                {request.recommendations.colleges?.length >
                                0 ? (
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    {request.recommendations.colleges.map(
                                      (college) => (
                                        <div
                                          key={college._id}
                                          className="flex items-center gap-3 rounded-xl border border-green-200 bg-white p-4"
                                        >
                                          <div className="rounded-lg bg-green-100 p-2 text-green-700">
                                            <School size={20} />
                                          </div>
                                          <p className="text-sm font-semibold text-slate-800">
                                            {college.name}
                                          </p>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500">
                                    No colleges recommended.
                                  </p>
                                )}
                              </div>

                              {/* Recommended Courses */}
                              <div>
                                <h5 className="mb-3 font-bold text-slate-800">
                                  Recommended Courses
                                </h5>

                                {request.recommendations.courses?.length > 0 ? (
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    {request.recommendations.courses.map(
                                      (course) => (
                                        <div
                                          key={course._id}
                                          className="flex items-center gap-3 rounded-xl border border-blue-200 bg-white p-4"
                                        >
                                          <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                                            <BookOpen size={20} />
                                          </div>
                                          <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                              {course.name}
                                            </p>
                                            {course.code && (
                                              <p className="mt-1 text-xs text-slate-500">
                                                Code: {course.code}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500">
                                    No courses recommended.
                                  </p>
                                )}
                              </div>

                              {/* Counsellor Note */}
                              {request.recommendations.counsellorNote && (
                                <div className="rounded-xl border border-green-200 bg-white p-4">
                                  <h5 className="mb-2 font-bold text-slate-800">
                                    Counsellor Note
                                  </h5>
                                  <p className="text-sm leading-6 text-slate-600">
                                    {request.recommendations.counsellorNote}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    );
                  })}
              </section>
            )}

            {activeTab === "appointments" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      My Appointments
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      View your scheduled counselling appointments.
                    </p>
                  </div>

                  <button
                    onClick={fetchMyAppointments}
                    disabled={appointmentsLoading}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {appointmentsLoading ? "Loading..." : "Refresh"}
                  </button>
                </div>

                {appointmentsLoading ? (
                  <div className="text-center py-12 text-slate-500">
                    Loading appointments...
                  </div>
                ) : appointmentsError ? (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
                    {appointmentsError}
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                    <h3 className="text-lg font-semibold text-slate-700">
                      No Appointments Found
                    </h3>
                    <p className="text-sm text-slate-500 mt-2">
                      Your scheduled appointments will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <p className="text-xs text-slate-500">
                              Appointment Number
                            </p>
                            <h3 className="font-bold text-slate-800 mt-1">
                              {appointment.appointmentNumber}
                            </h3>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                              appointment.status === "scheduled"
                                ? "bg-blue-100 text-blue-700"
                                : appointment.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : appointment.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </div>

                        <div className="border-t border-slate-100 my-4" />

                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-slate-500">Counsellor</p>
                            <p className="font-medium text-slate-800">
                              {appointment.counsellor?.name || "Not available"}
                            </p>
                            <p className="text-slate-500">
                              {appointment.counsellor?.email || ""}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-slate-500">Date</p>
                              <p className="font-medium text-slate-800">
                                {new Date(
                                  appointment.appointmentDate,
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  timeZone: "Asia/Kolkata",
                                })}
                              </p>
                            </div>

                            <div>
                              <p className="text-slate-500">Time</p>
                              <p className="font-medium text-slate-800">
                                {appointment.appointmentTime}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-slate-500">Meeting Mode</p>
                            <p className="font-medium text-slate-800 capitalize">
                              {appointment.meetingMode}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-500">Purpose</p>
                            <p className="font-medium text-slate-800">
                              {appointment.purpose || "Counselling Session"}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-500">Request Number</p>
                            <p className="font-medium text-slate-800">
                              {appointment.counsellingRequest?.requestNumber ||
                                "N/A"}
                            </p>
                          </div>
                        </div>

                        {appointment.meetingMode === "online" &&
                          appointment.status === "scheduled" &&
                          appointment.meetingLink && (
                            <a
                              href={appointment.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-5 block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
                            >
                              Join Meeting
                            </a>
                          )}

                        {appointment.meetingMode === "offline" && (
                          <div className="mt-5 bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500">
                              Meeting Location
                            </p>
                            <p className="font-medium text-slate-800">
                              {appointment.location || "Location not provided"}
                            </p>
                          </div>
                        )}

                        {/* Reschedule History Button */}
                        <button
                          onClick={() => {
                            if (selectedHistoryId === appointment._id) {
                              setSelectedHistoryId("");
                              setRescheduleHistory([]);
                              setHistoryError("");
                            } else {
                              fetchRescheduleHistory(appointment._id);
                            }
                          }}
                          className="mt-4 w-full border border-blue-200 text-blue-600 hover:bg-blue-50 py-2.5 rounded-lg font-semibold text-sm"
                        >
                          {selectedHistoryId === appointment._id
                            ? "Hide Reschedule History"
                            : "View Reschedule History"}
                        </button>

                        {/* Reschedule History Details */}
                        {selectedHistoryId === appointment._id && (
                          <div className="mt-4 border-t pt-4">
                            <h4 className="font-bold text-slate-800 mb-3">
                              Reschedule History
                            </h4>

                            {historyLoading ? (
                              <p className="text-sm text-slate-500">
                                Loading history...
                              </p>
                            ) : historyError ? (
                              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                {historyError}
                              </p>
                            ) : rescheduleHistory.length === 0 ? (
                              <div className="bg-slate-50 rounded-lg p-4 text-center">
                                <p className="text-sm text-slate-600">
                                  No reschedule history found.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {rescheduleHistory.map((history, index) => (
                                  <div
                                    key={history._id || index}
                                    className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                                  >
                                    <div className="flex justify-between items-center mb-3 gap-2">
                                      <p className="font-semibold text-slate-800 text-sm">
                                        Previous Schedule #{index + 1}
                                      </p>

                                      <span className="text-xs text-slate-500">
                                        {history.rescheduledAt
                                          ? new Date(
                                              history.rescheduledAt,
                                            ).toLocaleString("en-IN", {
                                              timeZone: "Asia/Kolkata",
                                            })
                                          : "N/A"}
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <p className="text-xs text-slate-500">
                                          Previous Date
                                        </p>
                                        <p className="font-medium text-slate-800">
                                          {history.oldAppointmentDate
                                            ? new Date(
                                                history.oldAppointmentDate,
                                              ).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                timeZone: "Asia/Kolkata",
                                              })
                                            : "N/A"}
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-xs text-slate-500">
                                          Previous Time
                                        </p>
                                        <p className="font-medium text-slate-800">
                                          {history.oldAppointmentTime || "N/A"}
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-xs text-slate-500">
                                          Previous Meeting Mode
                                        </p>
                                        <p className="font-medium text-slate-800 capitalize">
                                          {history.oldMeetingMode || "N/A"}
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-xs text-slate-500">
                                          Rescheduled By
                                        </p>
                                        <p className="font-medium text-slate-800">
                                          {history.rescheduledBy?.name || "N/A"}
                                        </p>
                                      </div>
                                    </div>

                                    {history.oldMeetingMode === "online" &&
                                      history.oldMeetingLink && (
                                        <div className="mt-3">
                                          <p className="text-xs text-slate-500">
                                            Previous Meeting Link
                                          </p>
                                          <a
                                            href={history.oldMeetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 underline break-all"
                                          >
                                            {history.oldMeetingLink}
                                          </a>
                                        </div>
                                      )}

                                    {history.oldMeetingMode === "offline" &&
                                      history.oldLocation && (
                                        <div className="mt-3">
                                          <p className="text-xs text-slate-500">
                                            Previous Location
                                          </p>
                                          <p className="text-sm text-slate-800">
                                            {history.oldLocation}
                                          </p>
                                        </div>
                                      )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================= MY COUNSELLING SESSIONS ================= */}

            {activeTab === "sessions" && (
              <section className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      My Counselling Sessions
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      View your counselling session details and outcomes.
                    </p>
                  </div>

                  <button
                    onClick={fetchMySessions}
                    disabled={sessionsLoading}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {sessionsLoading ? "Loading..." : "Refresh"}
                  </button>
                </div>

                {/* Loading */}
                {sessionsLoading ? (
                  <div className="py-12 text-center text-slate-500">
                    Loading counselling sessions...
                  </div>
                ) : sessionsError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
                    {sessionsError}
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                    <Video size={40} className="mx-auto text-slate-300" />

                    <h3 className="mt-3 text-lg font-semibold text-slate-700">
                      No Sessions Found
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Your counselling sessions will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {sessions.map((session) => (
                      <div
                        key={session._id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        {/* Session Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs text-slate-500">
                              Session Number
                            </p>

                            <h3 className="mt-1 font-bold text-slate-800">
                              {session.sessionNumber}
                            </h3>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              session.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : session.status === "in_progress"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : session.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {session.status.replace("_", " ")}
                          </span>
                        </div>

                        <div className="my-4 border-t border-slate-100" />

                        {/* Session Details */}
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-slate-500">Counsellor</p>

                            <p className="font-semibold text-slate-800">
                              {session.counsellor?.name || "Not available"}
                            </p>

                            <p className="text-slate-500">
                              {session.counsellor?.email || ""}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-slate-500">Session Date</p>

                              <p className="font-medium text-slate-800">
                                {new Date(
                                  session.sessionDate,
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  timeZone: "Asia/Kolkata",
                                })}
                              </p>
                            </div>

                            <div>
                              <p className="text-slate-500">Duration</p>

                              <p className="font-medium text-slate-800">
                                {session.durationMinutes
                                  ? `${session.durationMinutes} minutes`
                                  : "Not available"}
                              </p>
                            </div>

                            <div>
                              <p className="text-slate-500">Start Time</p>

                              <p className="font-medium text-slate-800">
                                {session.startTime || "Not started"}
                              </p>
                            </div>

                            <div>
                              <p className="text-slate-500">End Time</p>

                              <p className="font-medium text-slate-800">
                                {session.endTime || "Not completed"}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-slate-500">Meeting Mode</p>

                            <p className="font-medium capitalize text-slate-800">
                              {session.meetingMode}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-500">Appointment Number</p>

                            <p className="font-medium text-slate-800">
                              {session.appointment?.appointmentNumber || "N/A"}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-500">Request Number</p>

                            <p className="font-medium text-slate-800">
                              {session.counsellingRequest?.requestNumber ||
                                "N/A"}
                            </p>
                          </div>

                          {session.agenda && (
                            <div>
                              <p className="text-slate-500">Agenda</p>

                              <p className="font-medium text-slate-800">
                                {session.agenda}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Online Meeting */}
                        {session.meetingMode === "online" &&
                          session.meetingLink &&
                          (session.status === "scheduled" ||
                            session.status === "in_progress") && (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-5 block w-full rounded-xl bg-blue-600 py-3 text-center font-semibold text-white hover:bg-blue-700"
                            >
                              <span className="inline-flex items-center gap-2">
                                <Video size={18} />
                                Join Meeting
                              </span>
                            </a>
                          )}

                        {/* Offline Meeting */}
                        {session.meetingMode === "offline" &&
                          session.location && (
                            <div className="mt-4 rounded-lg bg-slate-50 p-3">
                              <p className="text-xs text-slate-500">
                                Meeting Location
                              </p>

                              <p className="font-medium text-slate-800">
                                {session.location}
                              </p>
                            </div>
                          )}

                        {/* Completed Session Details */}
                        {session.status === "completed" && (
                          <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
                            <h4 className="font-bold text-slate-800">
                              Session Summary
                            </h4>

                            {session.discussion && (
                              <div className="rounded-xl bg-blue-50 p-4">
                                <p className="text-xs font-bold uppercase text-blue-600">
                                  Discussion
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-700">
                                  {session.discussion}
                                </p>
                              </div>
                            )}

                            {session.outcome && (
                              <div className="rounded-xl bg-green-50 p-4">
                                <p className="text-xs font-bold uppercase text-green-600">
                                  Outcome
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-700">
                                  {session.outcome}
                                </p>
                              </div>
                            )}

                            {session.nextSteps && (
                              <div className="rounded-xl bg-yellow-50 p-4">
                                <p className="text-xs font-bold uppercase text-yellow-700">
                                  Next Steps
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-700">
                                  {session.nextSteps}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ================= SESSION FEEDBACK ================= */}

                        {session.status === "completed" &&
                          (() => {
                            const submittedFeedback = sessionFeedbacks.find(
                              (item) => item.session?._id === session._id,
                            );

                            return (
                              <div className="mt-5 border-t border-slate-100 pt-5">
                                {submittedFeedback ? (
                                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                                    <div className="flex items-center justify-between gap-2">
                                      <h4 className="font-bold text-green-800">
                                        Feedback Submitted
                                      </h4>

                                      <span className="text-xs font-semibold text-green-700">
                                        Completed
                                      </span>
                                    </div>

                                    <div className="mt-3 flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          size={22}
                                          className={
                                            star <= submittedFeedback.rating
                                              ? "fill-yellow-400 text-yellow-400"
                                              : "text-slate-300"
                                          }
                                        />
                                      ))}

                                      <span className="ml-2 text-sm font-bold text-slate-700">
                                        {submittedFeedback.rating}/5
                                      </span>
                                    </div>

                                    {submittedFeedback.feedback && (
                                      <div className="mt-4">
                                        <p className="text-xs font-bold text-slate-500">
                                          Your Feedback
                                        </p>

                                        <p className="mt-1 text-sm text-slate-700">
                                          {submittedFeedback.feedback}
                                        </p>
                                      </div>
                                    )}

                                    {submittedFeedback.suggestions && (
                                      <div className="mt-3">
                                        <p className="text-xs font-bold text-slate-500">
                                          Your Suggestions
                                        </p>

                                        <p className="mt-1 text-sm text-slate-700">
                                          {submittedFeedback.suggestions}
                                        </p>
                                      </div>
                                    )}

                                    <p className="mt-3 text-xs text-green-700">
                                      Submitted on{" "}
                                      {new Date(
                                        submittedFeedback.createdAt,
                                      ).toLocaleDateString("en-IN")}
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setFeedbackOpenSessionId(
                                          feedbackOpenSessionId === session._id
                                            ? ""
                                            : session._id,
                                        );

                                        setFeedbackRating(5);
                                        setFeedbackText("");
                                        setFeedbackSuggestions("");
                                      }}
                                      disabled={feedbackLoading}
                                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 py-3 font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                                    >
                                      <Star size={18} />
                                      Give Session Feedback
                                    </button>

                                    {feedbackOpenSessionId === session._id && (
                                      <div className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <h4 className="font-bold text-slate-800">
                                          Rate Your Counselling Session
                                        </h4>

                                        {/* Star Rating */}
                                        <div>
                                          <p className="mb-2 text-sm font-medium text-slate-600">
                                            Your Rating
                                          </p>

                                          <div className="flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                              <button
                                                key={star}
                                                type="button"
                                                onClick={() =>
                                                  setFeedbackRating(star)
                                                }
                                                className="transition hover:scale-110"
                                              >
                                                <Star
                                                  size={30}
                                                  className={
                                                    star <= feedbackRating
                                                      ? "fill-yellow-400 text-yellow-400"
                                                      : "text-slate-300"
                                                  }
                                                />
                                              </button>
                                            ))}

                                            <span className="ml-2 text-sm font-semibold text-slate-700">
                                              {feedbackRating}/5
                                            </span>
                                          </div>
                                        </div>

                                        {/* Feedback */}
                                        <div>
                                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Your Experience
                                          </label>

                                          <textarea
                                            rows={3}
                                            value={feedbackText}
                                            onChange={(e) =>
                                              setFeedbackText(e.target.value)
                                            }
                                            placeholder="How was your counselling experience?"
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                                          />
                                        </div>

                                        {/* Suggestions */}
                                        <div>
                                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Suggestions
                                          </label>

                                          <textarea
                                            rows={3}
                                            value={feedbackSuggestions}
                                            onChange={(e) =>
                                              setFeedbackSuggestions(
                                                e.target.value,
                                              )
                                            }
                                            placeholder="Any suggestions for improvement?"
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                                          />
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex flex-wrap gap-3">
                                          <button
                                            onClick={() =>
                                              handleSessionFeedbackSubmit(
                                                session._id,
                                              )
                                            }
                                            disabled={feedbackSubmitting}
                                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                          >
                                            {feedbackSubmitting ? (
                                              <Loader2
                                                size={17}
                                                className="animate-spin"
                                              />
                                            ) : (
                                              <Save size={17} />
                                            )}

                                            {feedbackSubmitting
                                              ? "Submitting..."
                                              : "Submit Feedback"}
                                          </button>

                                          <button
                                            onClick={() => {
                                              setFeedbackOpenSessionId("");
                                              setFeedbackRating(5);
                                              setFeedbackText("");
                                              setFeedbackSuggestions("");
                                            }}
                                            disabled={feedbackSubmitting}
                                            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })()}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ================= OTHER SIDEBAR PAGES ================= */}

           {activeTab === "feedback" ? (
  <div className="space-y-6">
    {/* Feedback Summary */}
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-blue-50 p-5">
        <p className="text-sm font-medium text-slate-500">
          Total Feedbacks
        </p>

        <h3 className="mt-2 text-3xl font-bold text-blue-700">
          {sessionFeedbacks.length}
        </h3>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-yellow-50 p-5">
        <p className="text-sm font-medium text-slate-500">
          Average Rating
        </p>

        <div className="mt-2 flex items-center gap-2">
          <h3 className="text-3xl font-bold text-yellow-700">
            {sessionFeedbacks.length > 0
              ? (
                  sessionFeedbacks.reduce(
                    (total, item) => total + item.rating,
                    0
                  ) / sessionFeedbacks.length
                ).toFixed(1)
              : "0.0"}
          </h3>

          <div className="flex text-yellow-500">
            <Star size={22} fill="currentColor" />
          </div>
        </div>
      </div>
    </div>

    {/* Feedback List Header */}
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="text-lg font-bold text-slate-800">
          My Session Feedbacks
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Feedback submitted for your completed counselling sessions.
        </p>
      </div>

      <button
        onClick={fetchMySessionFeedbacks}
        disabled={feedbackLoading}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {feedbackLoading ? "Loading..." : "Refresh"}
      </button>
    </div>

    {/* Loading */}
    {feedbackLoading ? (
      <div className="py-10 text-center text-slate-500">
        <Loader2 className="mx-auto mb-2 animate-spin" size={28} />
        Loading feedbacks...
      </div>
    ) : sessionFeedbacks.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center">
        <Star size={38} className="mx-auto text-slate-300" />

        <h3 className="mt-3 font-bold text-slate-700">
          No Feedback Found
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Your submitted session feedbacks will appear here.
        </p>
      </div>
    ) : (
      <div className="grid gap-5">
        {sessionFeedbacks.map((item) => (
          <div
            key={item._id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Session Number
                </p>

                <h4 className="mt-1 font-bold text-slate-800">
                  {item.session?.sessionNumber || "Session"}
                </h4>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Submitted
              </span>
            </div>

            {/* Rating */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                Your Rating
              </p>

              <div className="flex items-center gap-2">
                <div className="flex text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={21}
                      fill={
                        star <= item.rating
                          ? "currentColor"
                          : "none"
                      }
                    />
                  ))}
                </div>

                <span className="text-sm font-bold text-slate-700">
                  {item.rating}/5
                </span>
              </div>
            </div>

            {/* Feedback */}
            {item.feedback && (
              <div className="mt-4 rounded-xl bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase text-blue-600">
                  Your Experience
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {item.feedback}
                </p>
              </div>
            )}

            {/* Suggestions */}
            {item.suggestions && (
              <div className="mt-3 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Suggestions
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {item.suggestions}
                </p>
              </div>
            )}

            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-400">
                Submitted on:{" "}
                {new Date(item.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
) : (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center">
    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
      {(() => {
        const Icon =
          sidebarLinks.find((item) => item.id === activeTab)?.icon ||
          BookOpen;

        return <Icon size={30} />;
      })()}
    </div>

    <h3 className="text-lg font-bold text-slate-800">
      {sidebarLinks.find((item) => item.id === activeTab)?.label}
    </h3>

    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      Your information will appear here once this section is connected to the counselling portal.
    </p>

    <button
      onClick={() => setActiveTab("profile")}
      className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
    >
      Back to My Profile
    </button>
  </div>
)}

            {/* ================= ENTRANCE EXAM MODAL ================= */}

            {examModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                  <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white p-5">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {editingExamIndex !== null
                          ? "Edit Entrance Exam"
                          : "Add Entrance Exam"}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Enter your examination details
                      </p>
                    </div>

                    <button
                      onClick={() => setExamModalOpen(false)}
                      className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="grid gap-5 p-5 sm:grid-cols-2">
                    {(
                      [
                        ["examName", "Exam Name"],
                        ["examYear", "Exam Year"],
                        ["applicationNumber", "Application Number"],
                        ["rollNumber", "Roll Number"],
                        ["obtainedMarks", "Obtained Marks"],
                        ["percentile", "Percentile"],
                        ["allIndiaRank", "All India Rank"],
                        ["resultStatus", "Result Status"],
                      ] as const
                    ).map(([key, label]) => (
                      <FormInput
                        key={key}
                        label={label}
                        value={examForm[key] || ""}
                        onChange={(value) =>
                          setExamForm((prev) => ({
                            ...prev,
                            [key]: value,
                          }))
                        }
                      />
                    ))}
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 p-5">
                    <button
                      onClick={() => setExamModalOpen(false)}
                      disabled={savingExam}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleExamSave}
                      disabled={savingExam}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {savingExam ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Save size={17} />
                      )}

                      {savingExam ? "Saving..." : "Save Exam"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= COUNSELLING REQUEST MODAL ================= */}

            {counsellingModalOpen && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                  {/* Modal Header */}
                  <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white p-5">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Counselling Request
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Fill your preferences to get admission guidance
                      </p>
                    </div>

                    <button
                      onClick={() => setCounsellingModalOpen(false)}
                      className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="grid gap-5 p-5 sm:grid-cols-2">
                    {/* Academic Year */}
                    <FormInput
                      label="Academic Year"
                      value={counsellingForm.academicYear}
                      onChange={(value) =>
                        setCounsellingForm((prev) => ({
                          ...prev,
                          academicYear: value,
                        }))
                      }
                      placeholder="2026-2027"
                    />

                    {/* Admission Level */}
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Admission Level
                      </label>

                      <select
                        value={counsellingForm.admissionLevel}
                        onChange={(e) =>
                          setCounsellingForm((prev) => ({
                            ...prev,
                            admissionLevel: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="UG">UG</option>
                        <option value="PG">PG</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Doctorate">Doctorate</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Preferred Streams */}
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Preferred Streams
                      </label>

                      <select
                        multiple
                        value={counsellingForm.preferredStreams}
                        disabled={loadingOptions}
                        onChange={(e) => {
                          const values = Array.from(
                            e.target.selectedOptions,
                            (option) => option.value,
                          );

                          setCounsellingForm((prev) => ({
                            ...prev,
                            preferredStreams: values,
                          }));
                        }}
                        className="h-32 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
                      >
                        {streams.map((stream) => (
                          <option key={stream._id} value={stream._id}>
                            {stream.name}
                          </option>
                        ))}
                      </select>

                      <p className="mt-1 text-xs text-slate-400">
                        Hold Ctrl to select multiple streams.
                      </p>
                    </div>

                    {/* Preferred Courses */}
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Preferred Courses
                      </label>

                      <select
                        multiple
                        value={counsellingForm.preferredCourses}
                        disabled={loadingOptions}
                        onChange={(e) => {
                          const values = Array.from(
                            e.target.selectedOptions,
                            (option) => option.value,
                          );

                          setCounsellingForm((prev) => ({
                            ...prev,
                            preferredCourses: values,
                          }));
                        }}
                        className="h-32 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
                      >
                        {courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name}
                          </option>
                        ))}
                      </select>

                      <p className="mt-1 text-xs text-slate-400">
                        Hold Ctrl to select multiple courses.
                      </p>
                    </div>

                    {/* City */}
                    <FormInput
                      label="Preferred City"
                      value={counsellingForm.city}
                      onChange={(value) =>
                        setCounsellingForm((prev) => ({
                          ...prev,
                          city: value,
                        }))
                      }
                      placeholder="Enter city"
                    />

                    {/* State */}
                    <FormInput
                      label="State"
                      value={counsellingForm.state}
                      onChange={(value) =>
                        setCounsellingForm((prev) => ({
                          ...prev,
                          state: value,
                        }))
                      }
                      placeholder="Enter state"
                    />

                    {/* Country */}
                    <FormInput
                      label="Country"
                      value={counsellingForm.country}
                      onChange={(value) =>
                        setCounsellingForm((prev) => ({
                          ...prev,
                          country: value,
                        }))
                      }
                      placeholder="Enter country"
                    />

                    {/* Budget Min */}
                    <FormInput
                      label="Minimum Budget (INR)"
                      type="number"
                      value={counsellingForm.minBudget}
                      onChange={(value) =>
                        setCounsellingForm((prev) => ({
                          ...prev,
                          minBudget: value,
                        }))
                      }
                      placeholder="50000"
                    />

                    {/* Budget Max */}
                    <FormInput
                      label="Maximum Budget (INR)"
                      type="number"
                      value={counsellingForm.maxBudget}
                      onChange={(value) =>
                        setCounsellingForm((prev) => ({
                          ...prev,
                          maxBudget: value,
                        }))
                      }
                      placeholder="200000"
                    />

                    {/* Entrance Exam */}
                    <FormInput
                      label="Entrance Exam Name"
                      value={counsellingForm.examName}
                      onChange={(value) =>
                        setCounsellingForm((prev) => ({
                          ...prev,
                          examName: value,
                        }))
                      }
                      placeholder="CUET, JEE, NEET..."
                    />

                    <FormInput
                      label="Exam Year"
                      type="number"
                      value={counsellingForm.examYear}
                      onChange={(value) =>
                        setCounsellingForm((prev) => ({
                          ...prev,
                          examYear: value,
                        }))
                      }
                      placeholder="2026"
                    />

                    <FormInput
                      label="Score"
                      value={counsellingForm.score}
                      onChange={(value) =>
                        setCounsellingForm((prev) => ({
                          ...prev,
                          score: value,
                        }))
                      }
                      placeholder="Enter score"
                    />

                    <FormInput
                      label="Percentile"
                      value={counsellingForm.percentile}
                      onChange={(value) =>
                        setCounsellingForm((prev) => ({
                          ...prev,
                          percentile: value,
                        }))
                      }
                      placeholder="Enter percentile"
                    />

                    <FormInput
                      label="Rank"
                      value={counsellingForm.rank}
                      onChange={(value) =>
                        setCounsellingForm((prev) => ({
                          ...prev,
                          rank: value,
                        }))
                      }
                      placeholder="Enter rank"
                    />

                    {/* Counselling Mode */}
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Counselling Mode
                      </label>

                      <select
                        value={counsellingForm.counsellingMode}
                        onChange={(e) =>
                          setCounsellingForm((prev) => ({
                            ...prev,
                            counsellingMode: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="phone">Phone</option>
                        <option value="video">Video</option>
                        <option value="in_person">In Person</option>
                        <option value="chat">Chat</option>
                      </select>
                    </div>

                    {/* Preferred Date */}
                    <FormInput
                      label="Preferred Date & Time"
                      type="datetime-local"
                      value={counsellingForm.preferredDate}
                      onChange={(value) =>
                        setCounsellingForm((prev) => ({
                          ...prev,
                          preferredDate: value,
                        }))
                      }
                    />

                    {loadingOptions && (
                      <div className="flex items-center gap-2 text-sm text-blue-600 sm:col-span-2">
                        <Loader2 size={17} className="animate-spin" />
                        Loading streams and courses...
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 p-5">
                    <button
                      onClick={() => setCounsellingModalOpen(false)}
                      disabled={savingCounselling}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleCounsellingSubmit}
                      disabled={savingCounselling || loadingOptions}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {savingCounselling ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Save size={17} />
                      )}

                      {savingCounselling ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PROFILE NOT AVAILABLE */}

            {!profile && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                Your profile record has not been created yet. Your login is
                successful, but profile details are not available.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

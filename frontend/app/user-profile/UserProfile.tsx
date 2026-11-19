"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";
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
  CreditCard,
  RefreshCw,
  Search,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare,
  IndianRupee,
  ExternalLink,
  Edit3,
  ChevronDown,
  Check,
} from "lucide-react";

type Tab =
  | "profile"
  | "personal"
  | "academic"
  | "entrance"
  | "appointments"
  | "requests"
  | "counselling-notes"
  | "follow-up"
  | "feedback"
  | "sessions";

type UserData = {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  contact?: string;
  role?: { roleName?: string } | string;
};

type StudentProfileData = {
  _id?: string;
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
    admissionYear?: string | number;
    semester?: string;
    enrollmentNumber?: string;
    qualification?: string;
    board?: string;
    passingYear?: string | number;
    percentage?: string | number;
  };
  entranceExams?: EntranceExam[];
  student?: UserData;
};

type EntranceExam = {
  examName?: string;
  year?: string;
  examYear?: string;
  applicationNumber?: string;
  rollNumber?: string;
  obtainedMarks?: string;
  percentile?: string;
  AIR?: string;
  allIndiaRank?: string;
  resultStatus?: string;
};

type StreamOption = { _id: string; name?: string; streamName?: string };
type CourseOption = { _id: string; name?: string; courseName?: string };
type MultiSelectProps = {
  label: string;
  placeholder: string;
  options?: (StreamOption | CourseOption)[];
  value?: string[];
  onChange: (value: string[]) => void;
  icon?: ElementType;
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
  examYear: string;
  score: string;
  percentile: string;
  rank: string;
  counsellingMode: string;
  preferredDate: string;
};

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${
      typeof window !== "undefined"
        ? localStorage.getItem("token") || ""
        : ""
    }`,
  },
});

const API_FALLBACK = "http://localhost:2002";

const emptyCounsellingForm: CounsellingForm = {
  academicYear: "",
  admissionLevel: "UG",
  preferredStreams: [],
  preferredCourses: [],
  city: "",
  state: "",
  country: "India",
  minBudget: "",
  maxBudget: "",
  examName: "",
  examYear: "",
  score: "",
  percentile: "",
  rank: "",
  counsellingMode: "video",
  preferredDate: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const labelClass = "mb-2 block text-sm font-semibold text-slate-600";

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string | number | undefined;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        className={inputClass}
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        disabled={disabled || !onChange}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </label>
  );
}

function InfoCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: ReactNode;
  icon: ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={19} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value || "Not added"}
      </p>
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}





const MultiSelect = ({
  label,
  placeholder,
  options = [],
  value = [],
  onChange,
  icon: Icon,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        event.target instanceof Node &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

const getOptionName = (option: StreamOption | CourseOption): string => {
  return (
    option.name ||
    ("streamName" in option ? option.streamName : "") ||
    ("courseName" in option ? option.courseName : "") ||
    ""
  );
};
  const selectedOptions = options.filter((option) =>
    value.includes(option._id)
  );

  const filteredOptions = options.filter((option) =>
    getOptionName(option)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const toggleOption = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((item) => item !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const removeOption = (id: string) => {
    onChange(value.filter((item) => item !== id));
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left transition ${
          open
            ? "border-blue-500 ring-4 ring-blue-50"
            : "border-slate-200 hover:border-blue-300"
        }`}
      >
        <span className="flex items-center gap-2 text-sm text-slate-500">
          {Icon && <Icon size={17} className="text-blue-600" />}
          {selectedOptions.length > 0
            ? `${selectedOptions.length} selected`
            : placeholder}
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {selectedOptions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <span
              key={option._id}
              className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
            >
              {getOptionName(option)}

              <button
                type="button"
                onClick={() => removeOption(option._id)}
                className="rounded-full transition hover:text-red-600"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
              <Search size={17} className="text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
                placeholder="Search here..."
                className="w-full border-0 bg-transparent py-3 text-sm outline-none focus:ring-0"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                >
                  <X size={15} className="text-slate-400" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto p-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const selected = value.includes(option._id);

                return (
                  <button
                    key={option._id}
                    type="button"
                    onClick={() => toggleOption(option._id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition ${
                      selected
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-medium">
                      {getOptionName(option)}
                    </span>

                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                        selected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {selected && <Check size={13} />}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">
                No options found.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-500">
              {value.length} selected
            </span>

            <button
              type="button"
              onClick={() => {
                onChange([]);
                setSearch("");
              }}
              className="text-xs font-semibold text-red-500 hover:text-red-700"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};



export default function UserProfile() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || API_FALLBACK;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [uploading, setUploading] = useState(false);

  const [editingPersonal, setEditingPersonal] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    gender: "",
    dateOfBirth: "",
    addressLine: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
  });
  const [editingAcademic, setEditingAcademic] = useState(false);
  const [savingAcademic, setSavingAcademic] = useState(false);
  const [academicForm, setAcademicForm] = useState({
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
  });

  const [examModalOpen, setExamModalOpen] = useState(false);
  const [savingExam, setSavingExam] = useState(false);
  const [editingExamIndex, setEditingExamIndex] = useState<number | null>(null);
  const [examForm, setExamForm] = useState<EntranceExam>({
    examName: "",
    year: "",
    applicationNumber: "",
    rollNumber: "",
    obtainedMarks: "",
    percentile: "",
    allIndiaRank: "",
    resultStatus: "",
  });

  const [counsellingModalOpen, setCounsellingModalOpen] = useState(false);
  const [savingCounselling, setSavingCounselling] = useState(false);
  const [streams, setStreams] = useState<StreamOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [counsellingForm, setCounsellingForm] = useState<CounsellingForm>(emptyCounsellingForm);

  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [sessionFeedbacks, setSessionFeedbacks] = useState<any[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackOpenSessionId, setFeedbackOpenSessionId] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSuggestions, setFeedbackSuggestions] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [rescheduleHistory, setRescheduleHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [selectedHistoryId, setSelectedHistoryId] = useState("");

 

  const studentName = user?.name || profile?.student?.name || "Student";
  const studentEmail = user?.email || profile?.student?.email || "";

  const applyProfile = (data: any) => {
    const p = data?.data?.profile || data?.profile || data?.data || data;
    const u = data?.data?.user || data?.user || p?.student || null;
    setProfile(p || null);
    if (u) setUser(u);
    setPersonalForm({
      gender: p?.gender || "",
      dateOfBirth: p?.dateOfBirth ? String(p.dateOfBirth).slice(0, 10) : "",
      addressLine: p?.address?.addressLine || "",
      city: p?.address?.city || "",
      state: p?.address?.state || "",
      country: p?.address?.country || "India",
      pincode: p?.address?.pincode || "",
    });
    const a = p?.academicDetails || {};
   setAcademicForm({
  course: String(a.course ?? ""),
  college: String(a.college ?? ""),
  university: String(a.university ?? ""),
  stream: String(a.stream ?? ""),
  admissionYear: String(a.admissionYear ?? ""),
  semester: String(a.semester ?? ""),
  enrollmentNumber: String(a.enrollmentNumber ?? ""),
  qualification: String(a.qualification ?? ""),
  board: String(a.board ?? ""),
  passingYear: String(a.passingYear ?? ""),
  percentage: String(a.percentage ?? ""),
});
  };

  const getProfile = useCallback(async () => {
    const currentToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!currentToken) {
      router.replace("/student-login");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/student-profile`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      applyProfile(res.data);
    } catch (e: any) {
      if (e?.response?.status === 401) router.replace("/student-login");
      else setError(e?.response?.data?.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, router]);

  const fetchMyRequests = useCallback(async () => {
    try {
      setRequestsLoading(true);
      setRequestsError("");
      const res = await axios.get(
        `${apiUrl}/student/my-counselling-requests`,
        authConfig(),
      );
      setMyRequests(res.data?.data || []);
    } catch (e: any) {
      setRequestsError(
        e?.response?.data?.message || "Unable to load requests.",
      );
    } finally {
      setRequestsLoading(false);
    }
  }, [apiUrl]);

  const fetchMyAppointments = useCallback(async () => {
    try {
      setAppointmentsLoading(true);
      setAppointmentsError("");
      const res = await axios.get(
        `${apiUrl}/student/my-appointments`,
        authConfig(),
      );
      setAppointments(res.data?.data || []);
    } catch (e: any) {
      setAppointmentsError(
        e?.response?.data?.message || "Unable to load appointments.",
      );
    } finally {
      setAppointmentsLoading(false);
    }
  }, [apiUrl]);

  const fetchMySessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      setSessionsError("");
      const res = await axios.get(
        `${apiUrl}/get-counselling-sessions`,
        authConfig(),
      );
      setSessions(res.data?.data || []);
    } catch (e: any) {
      setSessionsError(
        e?.response?.data?.message || "Unable to load sessions.",
      );
    } finally {
      setSessionsLoading(false);
    }
  }, [apiUrl]);

  const fetchMySessionFeedbacks = useCallback(async () => {
    try {
      setFeedbackLoading(true);
      const res = await axios.get(
        `${apiUrl}/student/my-session-feedbacks`,
        authConfig(),
      );
      setSessionFeedbacks(res.data?.data || []);
    } catch (e) {
      console.error("Feedback fetch error", e);
    } finally {
      setFeedbackLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);
  useEffect(() => {
    if (activeTab === "requests") fetchMyRequests();
  }, [activeTab, fetchMyRequests]);
  useEffect(() => {
    if (activeTab === "appointments") fetchMyAppointments();
  }, [activeTab, fetchMyAppointments]);
  useEffect(() => {
    if (activeTab === "sessions") fetchMySessions();
  }, [activeTab, fetchMySessions]);
  useEffect(() => {
    if (activeTab === "feedback") fetchMySessionFeedbacks();
  }, [activeTab, fetchMySessionFeedbacks]);

  const getImageUrl = (path?: string) =>
    !path
      ? ""
      : path.startsWith("http")
        ? path
        : `${apiUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  const handleImageChange = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Only JPG, PNG and WEBP images are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be under 2 MB.");
      return;
    }
    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };
  const handleImageUpload = async () => {
    if (!selectedImage) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("profileImage", selectedImage);
      const res = await axios.put(
        `${apiUrl}/student-profile/upload-image`,
        fd,
        {
          ...authConfig(),
          headers: {
            ...authConfig().headers,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      const p = res.data?.data?.profile || res.data?.data || res.data?.profile;
      if (p) setProfile((prev) => ({ ...(prev || {}), ...p }));
      else await getProfile();
      setSelectedImage(null);
      setPreviewImage("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e: any) {
      alert(e?.response?.data?.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handlePersonalUpdate = async () => {
    try {
      setSavingPersonal(true);
      const payload = {
        gender: personalForm.gender,
        dateOfBirth: personalForm.dateOfBirth,
        address: {
          addressLine: personalForm.addressLine,
          city: personalForm.city,
          state: personalForm.state,
          country: personalForm.country,
          pincode: personalForm.pincode,
        },
      };
      const res = await axios.put(
        `${apiUrl}/student-profile/personal`,
        payload,
        authConfig(),
      );
      if (res.data?.data) applyProfile(res.data);
      else await getProfile();
      setEditingPersonal(false);
    } catch (e: any) {
      alert(
        e?.response?.data?.message || "Personal details could not be saved.",
      );
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleAcademicUpdate = async () => {
    try {
      setSavingAcademic(true);
      const res = await axios.put(
        `${apiUrl}/student-profile/academic`,
        academicForm,
        authConfig(),
      );
      if (res.data?.data) applyProfile(res.data);
      else await getProfile();
      setEditingAcademic(false);
    } catch (e: any) {
      alert(
        e?.response?.data?.message || "Academic details could not be saved.",
      );
    } finally {
      setSavingAcademic(false);
    }
  };

  const openAddExam = () => {
    setEditingExamIndex(null);
    setExamForm({
      examName: "",
      year: "",
      applicationNumber: "",
      rollNumber: "",
      obtainedMarks: "",
      percentile: "",
      allIndiaRank: "",
      resultStatus: "",
    });
    setExamModalOpen(true);
  };
  const openEditExam = (index: number) => {
    const exam = profile?.entranceExams?.[index] || {};
    setEditingExamIndex(index);
    setExamForm({
      ...exam,
      year: exam.year || exam.examYear || "",
      allIndiaRank: exam.allIndiaRank || exam.AIR || "",
    });
    setExamModalOpen(true);
  };
  const handleExamSave = async () => {
    if (!examForm.examName?.trim()) {
      alert("Please enter exam name.");
      return;
    }
    const list = [...(profile?.entranceExams || [])];
    const newExam = { ...examForm, year: examForm.year || examForm.examYear };
    if (editingExamIndex === null) list.push(newExam);
    else list[editingExamIndex] = newExam;
    try {
      setSavingExam(true);
      await axios.put(
        `${apiUrl}/student-profile/entrance-exams`,
        { entranceExams: list },
        authConfig(),
      );
      setProfile((prev) => ({ ...(prev || {}), entranceExams: list }));
      setExamModalOpen(false);
    } catch (e: any) {
      alert(e?.response?.data?.message || "Exam could not be saved.");
    } finally {
      setSavingExam(false);
    }
  };
  const handleExamDelete = async (index: number) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    const list = (profile?.entranceExams || []).filter((_, i) => i !== index);
    try {
      await axios.put(
        `${apiUrl}/student-profile/entrance-exams`,
        { entranceExams: list },
        authConfig(),
      );
      setProfile((prev) => ({ ...(prev || {}), entranceExams: list }));
    } catch (e: any) {
      alert(e?.response?.data?.message || "Exam could not be deleted.");
    }
  };

 
const openCounsellingModal = async () => {
  setCounsellingModalOpen(true);

  try {
    setLoadingOptions(true);

    const [s, c] = await Promise.all([
      axios.get(`${apiUrl}/get-streams`, authConfig()),
      axios.get(`${apiUrl}/get-courses`, authConfig()),
    ]);

    console.log("STREAM API RESPONSE:", s.data);
    console.log("COURSE API RESPONSE:", c.data);

    // API response se array extract karna
    const streamData =
      Array.isArray(s.data) ? s.data :
      Array.isArray(s.data?.data) ? s.data.data :
      Array.isArray(s.data?.streams) ? s.data.streams :
      Array.isArray(s.data?.data?.streams) ? s.data.data.streams : [];

    const courseData =
      Array.isArray(c.data) ? c.data :
      Array.isArray(c.data?.data) ? c.data.data :
      Array.isArray(c.data?.courses) ? c.data.courses :
      Array.isArray(c.data?.data?.courses) ? c.data.data.courses : [];

    setStreams(streamData);
    setCourses(courseData);

  } catch (e: any) {
    console.error("Options fetch error:", e.response?.data || e);

    alert(
      e.response?.data?.message ||
      "Streams and courses could not be loaded."
    );
  } finally {
    setLoadingOptions(false);
  }
};




const handleCounsellingSubmit = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    if (
      !counsellingForm.academicYear.trim() ||
      !counsellingForm.admissionLevel
    ) {
      alert("Academic Year and Admission Level are required");
      return;
    }

    const minBudget = Number(counsellingForm.minBudget || 0);
    const maxBudget = Number(counsellingForm.maxBudget || 0);

    if (
      !Number.isFinite(minBudget) ||
      !Number.isFinite(maxBudget) ||
      minBudget < 0 ||
      maxBudget < 0
    ) {
      alert("Please enter a valid budget");
      return;
    }

    if (maxBudget > 0 && minBudget > maxBudget) {
      alert("Maximum budget must be greater than minimum budget");
      return;
    }

    const entranceExams = counsellingForm.examName.trim()
      ? [
          {
            examName: counsellingForm.examName.trim(),
            year: counsellingForm.examYear
              ? Number(counsellingForm.examYear)
              : null,
            score: counsellingForm.score
              ? Number(counsellingForm.score)
              : null,
            percentile: counsellingForm.percentile
              ? Number(counsellingForm.percentile)
              : null,
            rank: counsellingForm.rank
              ? Number(counsellingForm.rank)
              : null,
          },
        ]
      : [];

let preferredDate: string | null = null;

    if (counsellingForm.preferredDate) {
      const parsedDate = new Date(counsellingForm.preferredDate);

      if (Number.isNaN(parsedDate.getTime())) {
        alert("Please select a valid preferred date");
        return;
      }

      preferredDate = parsedDate.toISOString();
    }

    const payload = {
      academicYear: counsellingForm.academicYear.trim(),
      admissionLevel: counsellingForm.admissionLevel,

      preferredStreams: counsellingForm.preferredStreams,
      preferredCourses: counsellingForm.preferredCourses,

      preferredLocations:
        counsellingForm.city.trim() ||
        counsellingForm.state.trim()
          ? [
              {
                city: counsellingForm.city.trim(),
                state: counsellingForm.state.trim(),
                country: counsellingForm.country.trim() || "India",
              },
            ]
          : [],

      budget: {
        min: minBudget,
        max: maxBudget,
        currency: "INR",
      },

      entranceExams,

      counsellingMode: counsellingForm.counsellingMode,

      preferredTime: {
        date: preferredDate,
        timezone: "Asia/Kolkata",
      },
    };

    setSavingCounselling(true);

    const response = await axios.post(
     `${apiUrl}/student/counselling-request`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      alert("Counselling request submitted successfully!");

      setCounsellingModalOpen(false);
      setCounsellingForm({ ...emptyCounsellingForm });

      // Refresh student requests if this function exists
      if (typeof fetchMyRequests === "function") {
        await fetchMyRequests();
      }
    } else {
      alert(response.data.message || "Failed to submit request");
    }

  } catch (error: any) {
    console.error(
      "Counselling Request Error:",
      error.response?.data || error
    );

    alert(
      error.response?.data?.message ||
      "Something went wrong while submitting request"
    );
  } finally {
    setSavingCounselling(false);
  }
};



  const fetchRescheduleHistory = async (appointmentId: string) => {
    try {
      setHistoryLoading(true);
      setHistoryError("");
      const res = await axios.get(
        `${apiUrl}/appointment-reschedule-history/${appointmentId}`,
        authConfig(),
      );
      setRescheduleHistory(res.data?.data || []);
    } catch (e: any) {
      setHistoryError(
        e?.response?.data?.message || "Unable to load reschedule history.",
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSessionFeedbackSubmit = async (sessionId: string) => {
    try {
      setFeedbackSubmitting(true);
      await axios.post(
        `${apiUrl}/student/session-feedback/${sessionId}`,
        {
          rating: feedbackRating,
          feedback: feedbackText,
          suggestions: feedbackSuggestions,
        },
        authConfig(),
      );
      setFeedbackOpenSessionId("");
      setFeedbackText("");
      setFeedbackSuggestions("");
      await fetchMySessionFeedbacks();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Feedback could not be submitted.");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/student-login");
  };
  const cancelPersonal = () => {
    setPersonalForm({
      gender: profile?.gender || "",
      dateOfBirth: profile?.dateOfBirth
        ? String(profile.dateOfBirth).slice(0, 10)
        : "",
      addressLine: profile?.address?.addressLine || "",
      city: profile?.address?.city || "",
      state: profile?.address?.state || "",
      country: profile?.address?.country || "India",
      pincode: profile?.address?.pincode || "",
    });
    setEditingPersonal(false);
  };
 
  const cancelAcademic = () => {
  const a = profile?.academicDetails || {};

  setAcademicForm({
    course: String(a.course ?? ""),
    college: String(a.college ?? ""),
    university: String(a.university ?? ""),
    stream: String(a.stream ?? ""),
    admissionYear: String(a.admissionYear ?? ""),
    semester: String(a.semester ?? ""),
    enrollmentNumber: String(a.enrollmentNumber ?? ""),
    qualification: String(a.qualification ?? ""),
    board: String(a.board ?? ""),
    passingYear: String(a.passingYear ?? ""),
    percentage: String(a.percentage ?? ""),
  });

  setEditingAcademic(false);
};

  const navItems: {
    id: Tab | "counselling" | "my-package";
    label: string;
    icon: ElementType;
  }[] = [
    { id: "profile", label: "My Profile", icon: LayoutDashboard },
    { id: "personal", label: "Personal Details", icon: User },
    { id: "academic", label: "Academic Details", icon: GraduationCap },
    { id: "entrance", label: "Entrance Exam", icon: Award },
    { id: "counselling", label: "Counselling Request", icon: ClipboardList },
    { id: "appointments", label: "My Appointments", icon: CalendarDays },
    { id: "requests", label: "My Requests", icon: ClipboardCheck },
    {
      id: "counselling-notes",
      label: "My Counselling Notes",
      icon: NotebookPen,
    },
    { id: "follow-up", label: "Follow Up", icon: BellRing },
    { id: "feedback", label: "Feedback & Ratings", icon: Star },
    { id: "sessions", label: "Counselling Sessions", icon: Video },
    { id: "my-package", label: "My Package", icon: CreditCard },
  ];
  const changeTab = (id: string) => {
    setSidebarOpen(false);
    if (id === "counselling") {
      openCounsellingModal();
      return;
    }
    if (id === "my-package") {
      router.push("/my-package");
      return;
    }
    setActiveTab(id as Tab);
  };
  const fmtDate = (v?: string) =>
    v
      ? new Date(v).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Not added";
  const statusClass = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (["approved", "completed", "paid", "active", "confirmed"].includes(s))
      return "bg-emerald-50 text-emerald-700";
    if (["rejected", "cancelled", "failed"].includes(s))
      return "bg-rose-50 text-rose-700";
    return "bg-amber-50 text-amber-700";
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-blue-600" size={38} />
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Loading your profile...
          </p>
        </div>
      </div>
    );

  const academic = profile?.academicDetails || {};
  const exams = profile?.entranceExams || [];
  const profileImage = previewImage || getImageUrl(profile?.profileImage);
  const filled = [
    user?.name,
    user?.email,
    user?.phone || user?.contact,
    profile?.gender,
    profile?.dateOfBirth,
    academic.course,
    academic.college,
    profile?.address?.city,
  ].filter(Boolean).length;
  const completion = Math.round((filled / 8) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-blue-700 p-2 text-white">
            <GraduationCap size={20} />
          </div>
          <span className="font-extrabold text-slate-900">
            DOCTOR <span className="text-blue-700">COUNCIL</span>
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg border p-2"
        >
          <Menu size={20} />
        </button>
      </div>
      {sidebarOpen && (
        <button
          aria-label="Close menu overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#101d38] text-white shadow-2xl transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500 p-2">
              <GraduationCap size={23} />
            </div>
            <div>
              <p className="font-black tracking-wide">DOCTOR COUNCIL</p>
              <p className="text-[10px] tracking-[0.2em] text-blue-200">
                STUDENT PORTAL
              </p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X size={20} />
          </button>
        </div>
        <div className="mx-4 my-5 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/20 text-blue-200">
              <User />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{studentName}</p>
            <p className="truncate text-xs text-slate-400">{studentEmail}</p>
          </div>
        </div>
        <p className="px-6 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Workspace
        </p>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.id === activeTab;
            return (
              <button
                key={item.id}
                onClick={() => changeTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
                <ChevronRight
                  size={15}
                  className={active ? "opacity-100" : "opacity-0"}
                />
              </button>
            );
          })}
        </nav>
        <div className="m-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck size={17} className="text-emerald-400" /> Secure
            Student Account
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Your academic and personal information is protected.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="m-4 mt-0 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/10"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="min-h-screen lg:ml-72">
        {/* Desktop top navigation */}
        <header className="sticky top-0 z-20 hidden h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-8 backdrop-blur lg:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Student Workspace
            </p>
            <h1 className="text-lg font-bold text-slate-900">
              {navItems.find((x) => x.id === activeTab)?.label || "My Profile"}
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                placeholder="Search dashboard..."
                className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-5">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <User size={18} />
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {studentName}
                </p>
                <p className="text-xs text-slate-400">Student</p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {activeTab === "profile" && (
            <>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#12356d] via-[#2459b2] to-[#0d9bb8] p-6 text-white shadow-xl sm:p-8">
                <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
                <div className="absolute -bottom-24 right-1/3 h-52 w-52 rounded-full bg-white/5" />
                <div className="relative max-w-2xl">
                  <p className="text-sm font-semibold text-blue-100">
                    WELCOME BACK
                  </p>
                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                    Hello, {studentName}! 👋
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                    Manage your profile, track counselling requests and stay
                    updated with your admission journey.
                  </p>
                  <button
                    onClick={() => setActiveTab("personal")}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-800 shadow hover:bg-blue-50"
                  >
                    Complete Profile <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center gap-5">
                    <div className="relative">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Student profile"
                          className="h-24 w-24 rounded-2xl object-cover ring-4 ring-blue-50"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                          <User size={42} />
                        </div>
                      )}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 rounded-full bg-blue-700 p-2 text-white shadow-lg"
                      >
                        <Camera size={15} />
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-extrabold text-slate-900">
                        {studentName}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {studentEmail}
                      </p>
                      <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        Student Account
                      </span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => handleImageChange(e.target.files?.[0])}
                    />
                  </div>
                  {selectedImage && (
                    <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-blue-50 p-3">
                      <span className="flex-1 text-xs font-medium text-blue-800">
                        {selectedImage.name}
                      </span>
                      <button
                        onClick={handleImageUpload}
                        disabled={uploading}
                        className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                      >
                        {uploading ? "Uploading..." : "Upload Photo"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setPreviewImage("");
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="text-xs font-semibold text-slate-500"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">
                      Profile Completion
                    </h3>
                    <span className="text-xl font-black text-blue-700">
                      {completion}%
                    </span>
                  </div>
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Complete your personal and academic details to improve your
                    counselling experience.
                  </p>
                  <button
                    onClick={() => setActiveTab("personal")}
                    className="mt-5 text-sm font-bold text-blue-700"
                  >
                    Update profile <span>→</span>
                  </button>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <InfoCard
                  label="Email Address"
                  value={studentEmail}
                  icon={Mail}
                />
                <InfoCard
                  label="Contact Number"
                  value={user?.phone || user?.contact}
                  icon={Phone}
                />
                <InfoCard
                  label="Course"
                  value={academic.course}
                  icon={BookOpen}
                />
                <InfoCard
                  label="College"
                  value={academic.college}
                  icon={School}
                />
                <InfoCard label="Gender" value={profile?.gender} icon={User} />
                <InfoCard
                  label="Date of Birth"
                  value={fmtDate(profile?.dateOfBirth)}
                  icon={Calendar}
                />
                <InfoCard
                  label="City"
                  value={profile?.address?.city}
                  icon={MapPin}
                />
                <InfoCard
                  label="State"
                  value={profile?.address?.state}
                  icon={MapPin}
                />
              </div>
              <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-slate-900">Quick Access</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <button
                    onClick={() => setActiveTab("personal")}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-4 text-sm font-semibold hover:bg-blue-50"
                  >
                    <span className="flex items-center gap-2">
                      <User size={18} className="text-blue-600" /> Personal
                      Details
                    </span>
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => setActiveTab("academic")}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-4 text-sm font-semibold hover:bg-blue-50"
                  >
                    <span className="flex items-center gap-2">
                      <GraduationCap size={18} className="text-blue-600" />{" "}
                      Academic Details
                    </span>
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => setActiveTab("entrance")}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-4 text-sm font-semibold hover:bg-blue-50"
                  >
                    <span className="flex items-center gap-2">
                      <Award size={18} className="text-blue-600" /> Entrance
                      Exams
                    </span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "personal" && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                title="Personal Details"
                subtitle="Manage your personal information and address."
                action={
                  !editingPersonal && (
                    <button
                      onClick={() => setEditingPersonal(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white"
                    >
                      <Pencil size={16} /> Edit Details
                    </button>
                  )
                }
              />
              {editingPersonal ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className={labelClass}>Gender</span>
                    <select
                      className={inputClass}
                      value={personalForm.gender}
                      onChange={(e) =>
                        setPersonalForm({
                          ...personalForm,
                          gender: e.target.value,
                        })
                      }
                    >
                      <option value="">Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <Field
                    label="Date of Birth"
                    type="date"
                    value={personalForm.dateOfBirth}
                    onChange={(v) =>
                      setPersonalForm({ ...personalForm, dateOfBirth: v })
                    }
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label="Address Line"
                      value={personalForm.addressLine}
                      onChange={(v) =>
                        setPersonalForm({ ...personalForm, addressLine: v })
                      }
                    />
                  </div>
                  <Field
                    label="City"
                    value={personalForm.city}
                    onChange={(v) =>
                      setPersonalForm({ ...personalForm, city: v })
                    }
                  />
                  <Field
                    label="State"
                    value={personalForm.state}
                    onChange={(v) =>
                      setPersonalForm({ ...personalForm, state: v })
                    }
                  />
                  <Field
                    label="Country"
                    value={personalForm.country}
                    onChange={(v) =>
                      setPersonalForm({ ...personalForm, country: v })
                    }
                  />
                  <Field
                    label="Pincode"
                    value={personalForm.pincode}
                    onChange={(v) =>
                      setPersonalForm({ ...personalForm, pincode: v })
                    }
                  />
                  <div className="flex gap-3 sm:col-span-2">
                    <button
                      onClick={handlePersonalUpdate}
                      disabled={savingPersonal}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                    >
                      <Save size={16} />
                      {savingPersonal ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={cancelPersonal}
                      className="rounded-xl border px-5 py-3 text-sm font-bold text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoCard label="Full Name" value={studentName} icon={User} />
                  <InfoCard label="Email" value={studentEmail} icon={Mail} />
                  <InfoCard
                    label="Contact"
                    value={user?.phone || user?.contact}
                    icon={Phone}
                  />
                  <InfoCard
                    label="Gender"
                    value={profile?.gender}
                    icon={User}
                  />
                  <InfoCard
                    label="Date of Birth"
                    value={fmtDate(profile?.dateOfBirth)}
                    icon={Calendar}
                  />
                  <InfoCard
                    label="Address"
                    value={profile?.address?.addressLine}
                    icon={MapPin}
                  />
                  <InfoCard
                    label="City"
                    value={profile?.address?.city}
                    icon={MapPin}
                  />
                  <InfoCard
                    label="State"
                    value={profile?.address?.state}
                    icon={MapPin}
                  />
                  <InfoCard
                    label="Country"
                    value={profile?.address?.country}
                    icon={MapPin}
                  />
                  <InfoCard
                    label="Pincode"
                    value={profile?.address?.pincode}
                    icon={Hash}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === "academic" && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                title="Academic Details"
                subtitle="Keep your education and admission information up to date."
                action={
                  !editingAcademic && (
                    <button
                      onClick={() => setEditingAcademic(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white"
                    >
                      <Pencil size={16} /> Edit Details
                    </button>
                  )
                }
              />
              {editingAcademic ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  {Object.keys(academicForm).map((key) => (
                    <Field
                      key={key}
                      label={key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (s) => s.toUpperCase())}
                      value={(academicForm as any)[key]}
                      onChange={(v) =>
                        setAcademicForm((p) => ({ ...p, [key]: v }))
                      }
                    />
                  ))}
                  <div className="flex gap-3 sm:col-span-2">
                    <button
                      onClick={handleAcademicUpdate}
                      disabled={savingAcademic}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white"
                    >
                      <Save size={16} />
                      {savingAcademic ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={cancelAcademic}
                      className="rounded-xl border px-5 py-3 text-sm font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(academic).length ? (
                    Object.entries(academicForm).map(([key]) => (
                      <InfoCard
                        key={key}
                        label={key.replace(/([A-Z])/g, " $1")}
                        value={(academic as any)[key]}
                        icon={GraduationCap}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      Academic details have not been added yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "entrance" && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                title="Entrance Exam Details"
                subtitle="Add and manage your entrance examination records."
                action={
                  <button
                    onClick={openAddExam}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white"
                  >
                    <Plus size={17} /> Add Exam
                  </button>
                }
              />
              {!exams.length ? (
                <div className="rounded-2xl border border-dashed border-slate-300 py-14 text-center">
                  <Award className="mx-auto text-slate-300" size={40} />
                  <p className="mt-3 font-semibold text-slate-700">
                    No entrance exams added
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Add your exam details to keep your profile updated.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {exams.map((exam, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900">
                            {exam.examName}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            Year: {exam.year || exam.examYear || "—"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditExam(i)}
                            className="rounded-lg bg-blue-50 p-2 text-blue-700"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleExamDelete(i)}
                            className="rounded-lg bg-rose-50 p-2 text-rose-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      {(
  [
    ["Application No.", exam.applicationNumber],
    ["Roll Number", exam.rollNumber],
    ["Obtained Marks", exam.obtainedMarks],
    ["Percentile", exam.percentile],
    ["All India Rank", exam.allIndiaRank || exam.AIR],
    ["Result Status", exam.resultStatus],
  ] as [string, string | undefined][]
).map(([k, v]) => (
                          <div key={k}>
                            <p className="text-xs text-slate-400">{k}</p>
                            <p className="mt-1 font-semibold">{v || "—"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                title="My Counselling Requests"
                subtitle="Track the status of your submitted counselling requests."
                action={
                  <button
                    onClick={fetchMyRequests}
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold"
                  >
                    <RefreshCw size={15} /> Refresh
                  </button>
                }
              />
              {requestsLoading ? (
                <Loader2 className="mx-auto animate-spin text-blue-600" />
              ) : requestsError ? (
                <p className="text-sm text-rose-600">{requestsError}</p>
              ) : !myRequests.length ? (
                <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                  You have not submitted any counselling requests yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {myRequests.map((r, i) => (
                    <div
                      key={r._id || i}
                      className="rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="font-bold">
                            {r.requestNumber || `Request #${i + 1}`}
                          </h3>
                          <p className="mt-1 text-xs text-slate-400">
                            Submitted {fmtDate(r.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(r.status)}`}
                        >
                          {r.status || "Pending"}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                        <p>
                          <span className="text-slate-400">Admission:</span>{" "}
                          {r.admissionLevel || "—"}
                        </p>
                        <p>
                          <span className="text-slate-400">Academic Year:</span>{" "}
                          {r.academicYear || "—"}
                        </p>
                        <p>
                          <span className="text-slate-400">Mode:</span>{" "}
                          {r.counsellingMode || "—"}
                        </p>
                        <p>
                          <span className="text-slate-400">Streams:</span>{" "}
                          {r.preferredStreams
                            ?.map((x: any) => x.name || x.streamName || x)
                            .join(", ") || "—"}
                        </p>
                        <p>
                          <span className="text-slate-400">Courses:</span>{" "}
                          {r.preferredCourses
                            ?.map((x: any) => x.name || x.courseName || x)
                            .join(", ") || "—"}
                        </p>
                        <p>
                          <span className="text-slate-400">Budget:</span> ₹
                          {r.budget?.min ?? 0} - ₹{r.budget?.max ?? 0}
                        </p>
                      </div>
                      {r.assignedCounsellor && (
                        <div className="mt-4 rounded-xl bg-blue-50 p-3 text-sm">
                          <b>Assigned Counsellor:</b>{" "}
                          {r.assignedCounsellor.name || r.assignedCounsellor}
                        </div>
                      )}
                      {r.counsellorNote && (
                        <p className="mt-3 text-sm text-slate-600">
                          <b>Note:</b> {r.counsellorNote}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                title="My Appointments"
                subtitle="View your scheduled counselling appointments."
                action={
                  <button
                    onClick={fetchMyAppointments}
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold"
                  >
                    <RefreshCw size={15} /> Refresh
                  </button>
                }
              />
              {appointmentsLoading ? (
                <Loader2 className="mx-auto animate-spin text-blue-600" />
              ) : appointmentsError ? (
                <p className="text-sm text-rose-600">{appointmentsError}</p>
              ) : !appointments.length ? (
                <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                  No appointments found.
                </p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((a, i) => (
                    <div
                      key={a._id || i}
                      className="rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900">
                            {a.appointmentNumber || `Appointment #${i + 1}`}
                          </h3>
                          <p className="mt-1 text-xs text-slate-400">
                            {fmtDate(a.appointmentDate || a.date)} ·{" "}
                            {a.appointmentTime || a.time || "Time not set"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(a.status)}`}
                        >
                          {a.status || "Pending"}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        <p>
                          <b>Counsellor:</b>{" "}
                          {a.counsellor?.name ||
                            a.counsellorName ||
                            "Not assigned"}
                        </p>
                        <p>
                          <b>Meeting Mode:</b> {a.meetingMode || "—"}
                        </p>
                        <p>
                          <b>Purpose:</b> {a.purpose || "Counselling"}
                        </p>
                        <p>
                          <b>Request:</b>{" "}
                          {a.counsellingRequest?.requestNumber || "—"}
                        </p>
                      </div>
                      {a.meetingMode === "online" && a.meetingLink && (
                        <a
                          href={a.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white"
                        >
                          Join Meeting <ExternalLink size={15} />
                        </a>
                      )}
                      {a.meetingMode === "offline" && (
                        <p className="mt-3 text-sm text-slate-600">
                          <MapPin className="mr-1 inline" size={15} />
                          {a.location || "Location will be shared"}
                        </p>
                      )}
                      <button
                        onClick={() => {
                          if (selectedHistoryId === a._id) {
                            setSelectedHistoryId("");
                            setRescheduleHistory([]);
                          } else {
                            setSelectedHistoryId(a._id);
                            fetchRescheduleHistory(a._id);
                          }
                        }}
                        className="mt-4 text-sm font-bold text-blue-700"
                      >
                        {" "}
                        {selectedHistoryId === a._id ? "Hide" : "View"}{" "}
                        Reschedule History
                      </button>
                      {selectedHistoryId === a._id && (
                        <div className="mt-3 rounded-xl bg-slate-50 p-4">
                          {historyLoading ? (
                            "Loading history..."
                          ) : historyError ? (
                            historyError
                          ) : rescheduleHistory.length ? (
                            rescheduleHistory.map((h, j) => (
                              <p
                                key={j}
                                className="border-b py-2 text-xs text-slate-600"
                              >
                                Previous: {fmtDate(h.oldDate)} ·{" "}
                                {h.oldTime || "—"} · {h.oldMeetingMode || "—"}
                              </p>
                            ))
                          ) : (
                            <p className="text-xs text-slate-500">
                              No reschedule history.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                title="Counselling Sessions"
                subtitle="Review your counselling sessions and share feedback."
                action={
                  <button
                    onClick={fetchMySessions}
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold"
                  >
                    <RefreshCw size={15} /> Refresh
                  </button>
                }
              />
              {sessionsLoading ? (
                <Loader2 className="mx-auto animate-spin text-blue-600" />
              ) : sessionsError ? (
                <p className="text-sm text-rose-600">{sessionsError}</p>
              ) : !sessions.length ? (
                <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                  No counselling sessions found.
                </p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((s, i) => {
                    const submitted = sessionFeedbacks.find(
                      (f) =>
                        String(f.session?._id || f.session) === String(s._id),
                    );
                    return (
                      <div
                        key={s._id || i}
                        className="rounded-2xl border border-slate-200 p-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="font-bold">
                              {s.sessionNumber || `Session #${i + 1}`}
                            </h3>
                            <p className="mt-1 text-xs text-slate-400">
                              {fmtDate(s.sessionDate || s.date)} ·{" "}
                              {s.startTime || ""}{" "}
                              {s.duration ? `· ${s.duration} min` : ""}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(s.status)}`}
                          >
                            {s.status || "Scheduled"}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                          <p>
                            <b>Counsellor:</b> {s.counsellor?.name || "—"}
                          </p>
                          <p>
                            <b>Mode:</b> {s.meetingMode || "—"}
                          </p>
                          <p>
                            <b>Agenda:</b> {s.agenda || "—"}
                          </p>
                          <p>
                            <b>Appointment:</b>{" "}
                            {s.appointment?.appointmentNumber || "—"}
                          </p>
                        </div>
                        {s.meetingLink &&
                          ["scheduled", "in_progress"].includes(
                            (s.status || "").toLowerCase(),
                          ) && (
                            <a
                              href={s.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white"
                            >
                              Join Meeting <ExternalLink size={15} />
                            </a>
                          )}
                        {s.summary && (
                          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
                            <p>
                              <b>Discussion:</b>{" "}
                              {s.summary.discussion || s.summary}
                            </p>
                            {s.summary.outcome && (
                              <p className="mt-2">
                                <b>Outcome:</b> {s.summary.outcome}
                              </p>
                            )}
                            {s.summary.nextSteps && (
                              <p className="mt-2">
                                <b>Next Steps:</b> {s.summary.nextSteps}
                              </p>
                            )}
                          </div>
                        )}
                        {(s.status || "").toLowerCase() === "completed" &&
                          (submitted ? (
                            <div className="mt-4 rounded-xl bg-emerald-50 p-4">
                              <p className="font-bold text-emerald-700">
                                Feedback Submitted
                              </p>
                              <p className="mt-1 text-amber-500">
                                {"★".repeat(Number(submitted.rating || 0))}
                              </p>
                              <p className="mt-2 text-sm">
                                {submitted.feedback}
                              </p>
                              {submitted.suggestions && (
                                <p className="mt-1 text-sm text-slate-600">
                                  {submitted.suggestions}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="mt-4">
                              <button
                                onClick={() => {
                                  setFeedbackOpenSessionId(s._id);
                                  setFeedbackRating(5);
                                }}
                                className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-bold text-blue-700"
                              >
                                Give Session Feedback
                              </button>
                              {feedbackOpenSessionId === s._id && (
                                <div className="mt-3 rounded-xl bg-slate-50 p-4">
                                  <p className="text-sm font-bold">
                                    Rate your experience
                                  </p>
                                  <div className="my-2 flex gap-1">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                      <button
                                        key={n}
                                        onClick={() => setFeedbackRating(n)}
                                        className={`text-2xl ${n <= feedbackRating ? "text-amber-400" : "text-slate-300"}`}
                                      >
                                        ★
                                      </button>
                                    ))}
                                  </div>
                                  <textarea
                                    value={feedbackText}
                                    onChange={(e) =>
                                      setFeedbackText(e.target.value)
                                    }
                                    placeholder="Share your experience..."
                                    className={`${inputClass} min-h-24`}
                                  />
                                  <textarea
                                    value={feedbackSuggestions}
                                    onChange={(e) =>
                                      setFeedbackSuggestions(e.target.value)
                                    }
                                    placeholder="Suggestions (optional)"
                                    className={`${inputClass} mt-3 min-h-20`}
                                  />
                                  <div className="mt-3 flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleSessionFeedbackSubmit(s._id)
                                      }
                                      disabled={
                                        feedbackSubmitting ||
                                        !feedbackText.trim()
                                      }
                                      className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                                    >
                                      {feedbackSubmitting
                                        ? "Submitting..."
                                        : "Submit Feedback"}
                                    </button>
                                    <button
                                      onClick={() =>
                                        setFeedbackOpenSessionId("")
                                      }
                                      className="rounded-lg border px-4 py-2 text-sm font-bold"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "feedback" && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                title="Feedback & Ratings"
                subtitle="Your submitted feedback for counselling sessions."
                action={
                  <button
                    onClick={fetchMySessionFeedbacks}
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold"
                  >
                    <RefreshCw size={15} /> Refresh
                  </button>
                }
              />
              {feedbackLoading ? (
                <Loader2 className="mx-auto animate-spin text-blue-600" />
              ) : !sessionFeedbacks.length ? (
                <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                  You have not submitted feedback yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {sessionFeedbacks.map((f, i) => (
                    <div key={f._id || i} className="rounded-2xl border p-5">
                      <div className="flex items-center justify-between">
                        <p className="font-bold">
                          {f.session?.sessionNumber || "Counselling Session"}
                        </p>
                        <span className="text-amber-500">
                          {"★".repeat(Number(f.rating || 0))}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-700">
                        {f.feedback}
                      </p>
                      {f.suggestions && (
                        <p className="mt-2 text-sm text-slate-500">
                          Suggestions: {f.suggestions}
                        </p>
                      )}
                      <p className="mt-3 text-xs text-slate-400">
                        {fmtDate(f.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(activeTab === "counselling-notes" || activeTab === "follow-up") && (
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <div className="mx-auto max-w-lg py-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  {activeTab === "follow-up" ? (
                    <BellRing size={30} />
                  ) : (
                    <NotebookPen size={30} />
                  )}
                </div>
                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  {activeTab === "follow-up"
                    ? "Follow Up"
                    : "My Counselling Notes"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {activeTab === "follow-up"
                    ? "Your counsellor's follow-up information will appear here when it is shared."
                    : "Your counselling notes will appear here after your counsellor adds them."}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Entrance exam modal */}
      {examModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-5">
              <div>
                <h2 className="font-bold text-slate-900">
                  {editingExamIndex === null
                    ? "Add Entrance Exam"
                    : "Edit Entrance Exam"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Enter your examination details
                </p>
              </div>
              <button
                onClick={() => setExamModalOpen(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              {(
                [
                  "examName",
                  "year",
                  "applicationNumber",
                  "rollNumber",
                  "obtainedMarks",
                  "percentile",
                  "allIndiaRank",
                  "resultStatus",
                ] as const
              ).map((k) => (
                <Field
                  key={k}
                  label={k
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (s) => s.toUpperCase())}
                  value={(examForm as any)[k] || ""}
                  onChange={(v) => setExamForm((p) => ({ ...p, [k]: v }))}
                />
              ))}
            </div>
            <div className="flex justify-end gap-3 border-t p-5">
              <button
                onClick={() => setExamModalOpen(false)}
                className="rounded-xl border px-5 py-2.5 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleExamSave}
                disabled={savingExam}
                className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {savingExam ? "Saving..." : "Save Exam"}
              </button>
            </div>
          </div>
        </div>
      )}

     
{/* ================= COUNSELLING REQUEST MODAL ================= */}

{counsellingModalOpen && (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-5">

    <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl">

      {/* HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 px-6 py-7 text-white sm:px-8">

        <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-white/10" />

        <div className="relative flex items-start justify-between gap-4">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Student Admission Portal
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Counselling Request
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-blue-100">
              Share your academic preferences and let our experts
              help you find the right medical college.
            </p>
          </div>

          <button
            onClick={() => setCounsellingModalOpen(false)}
            className="rounded-xl border border-white/20 bg-white/10 p-2.5 transition hover:bg-white/20"
          >
            <X size={21} />
          </button>

        </div>

        <div className="relative mt-6 flex flex-wrap items-center gap-2 text-xs font-medium text-blue-100">
          <span>Academic Details</span>
          <span className="text-blue-300">/</span>
          <span>College Preferences</span>
          <span className="text-blue-300">/</span>
          <span>Exam Details</span>
        </div>

      </div>

      {/* FORM BODY */}
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">

        <div className="space-y-7">

          {/* SECTION 01 */}
          <section>

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <GraduationCap size={21} />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Academic Information
                </h3>
                <p className="text-xs text-slate-500">
                  Tell us about your admission requirements.
                </p>
              </div>

            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              <Field
                label="Academic Year"
                placeholder="2026-27"
                value={counsellingForm.academicYear}
                onChange={(v) =>
                  setCounsellingForm((p) => ({
                    ...p,
                    academicYear: v,
                  }))
                }
              />

              <label>
                <span className={labelClass}>Admission Level</span>
                <select
                  className={inputClass}
                  value={counsellingForm.admissionLevel}
                  onChange={(e) =>
                    setCounsellingForm((p) => ({
                      ...p,
                      admissionLevel: e.target.value,
                    }))
                  }
                >
                  {["UG", "PG", "Diploma", "Doctorate", "Other"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>

             
{/* PREFERRED STREAMS */}
<MultiSelect
  label="Preferred Streams"
  placeholder="Select preferred streams"
  options={streams}
  value={counsellingForm.preferredStreams}
  icon={GraduationCap}
  onChange={(v) =>
    setCounsellingForm((p) => ({
      ...p,
      preferredStreams: v,
    }))
  }
/>

{/* PREFERRED COURSES */}
<MultiSelect
  label="Preferred Courses"
  placeholder="Select preferred courses"
  options={courses}
  value={counsellingForm.preferredCourses}
  icon={BookOpen}
  onChange={(v) =>
    setCounsellingForm((p) => ({
      ...p,
      preferredCourses: v,
    }))
  }
/>


            </div>
          </section>

          <div className="border-t border-slate-200" />

          {/* SECTION 02 */}
          <section>

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <MapPin size={20} />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  College Preferences
                </h3>
                <p className="text-xs text-slate-500">
                  Select your preferred admission location.
                </p>
              </div>

            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              <Field
                label="Preferred City"
                placeholder="Enter city"
                value={counsellingForm.city}
                onChange={(v) =>
                  setCounsellingForm((p) => ({
                    ...p,
                    city: v,
                  }))
                }
              />

              <Field
                label="Preferred State"
                placeholder="Enter state"
                value={counsellingForm.state}
                onChange={(v) =>
                  setCounsellingForm((p) => ({
                    ...p,
                    state: v,
                  }))
                }
              />

            </div>

          </section>

          <div className="border-t border-slate-200" />

          {/* SECTION 03 */}
          <section>

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <BookOpen size={20} />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Budget & Entrance Examination
                </h3>
                <p className="text-xs text-slate-500">
                  Share your budget and entrance exam performance.
                </p>
              </div>

            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              <Field
                label="Minimum Budget (INR)"
                type="number"
                placeholder="e.g. 100000"
                value={counsellingForm.minBudget}
                onChange={(v) =>
                  setCounsellingForm((p) => ({
                    ...p,
                    minBudget: v,
                  }))
                }
              />

              <Field
                label="Maximum Budget (INR)"
                type="number"
                placeholder="e.g. 1000000"
                value={counsellingForm.maxBudget}
                onChange={(v) =>
                  setCounsellingForm((p) => ({
                    ...p,
                    maxBudget: v,
                  }))
                }
              />

              <Field
                label="Entrance Exam Name"
                placeholder="e.g. NEET UG"
                value={counsellingForm.examName}
                onChange={(v) =>
                  setCounsellingForm((p) => ({
                    ...p,
                    examName: v,
                  }))
                }
              />

              <Field
                label="Exam Year"
                placeholder="2026"
                value={counsellingForm.examYear}
                onChange={(v) =>
                  setCounsellingForm((p) => ({
                    ...p,
                    examYear: v,
                  }))
                }
              />

              <Field
                label="Obtained Score"
                type="number"
                placeholder="Enter score"
                value={counsellingForm.score}
                onChange={(v) =>
                  setCounsellingForm((p) => ({
                    ...p,
                    score: v,
                  }))
                }
              />

              <Field
                label="Percentile"
                type="number"
                placeholder="Enter percentile"
                value={counsellingForm.percentile}
                onChange={(v) =>
                  setCounsellingForm((p) => ({
                    ...p,
                    percentile: v,
                  }))
                }
              />

              <div className="sm:col-span-2">
                <Field
                  label="All India Rank (AIR)"
                  type="number"
                  placeholder="Enter your AIR"
                  value={counsellingForm.rank}
                  onChange={(v) =>
                    setCounsellingForm((p) => ({
                      ...p,
                      rank: v,
                    }))
                  }
                />
              </div>

            </div>

          </section>

          <div className="border-t border-slate-200" />

          {/* SECTION 04 */}
          <section>

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <Calendar size={20} />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Counselling Preferences
                </h3>
                <p className="text-xs text-slate-500">
                  Choose how and when you want to connect with us.
                </p>
              </div>

            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              <label>
                <span className={labelClass}>Counselling Mode</span>
                <select
                  className={inputClass}
                  value={counsellingForm.counsellingMode}
                  onChange={(e) =>
                    setCounsellingForm((p) => ({
                      ...p,
                      counsellingMode: e.target.value,
                    }))
                  }
                >
                  {[
                    ["phone", "Phone Consultation"],
                    ["video", "Video Consultation"],
                    ["in_person", "In-Person Meeting"],
                    ["chat", "Online Chat"],
                  ].map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>

              <Field
                label="Preferred Date & Time"
                type="datetime-local"
                value={counsellingForm.preferredDate}
                onChange={(v) =>
                  setCounsellingForm((p) => ({
                    ...p,
                    preferredDate: v,
                  }))
                }
              />

            </div>

          </section>

          {loadingOptions && (
            <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-700">
              Loading streams and courses...
            </div>
          )}

        </div>

      </div>

      {/* FOOTER */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">

        <p className="text-xs text-slate-500">
          <span className="font-semibold text-blue-700">Note:</span>{" "}
          Please verify your information before submitting.
        </p>

        <div className="flex gap-3">

          <button
            onClick={() => setCounsellingModalOpen(false)}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            onClick={handleCounsellingSubmit}
            disabled={savingCounselling}
            className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingCounselling ? "Submitting..." : "Submit Request"}
          </button>

        </div>

      </div>

    </div>
  </div>
)}

    </div>
  );
}

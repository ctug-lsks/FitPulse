'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import {
  Activity, ArrowUpRight, ArrowLeft, BarChart3, CalendarDays, Check, ChevronRight, ChevronLeft, ChevronDown, CircleCheck, Clock3,
  Dumbbell, Flame, Grid2X2, LayoutDashboard, MapPin, Menu, MoreHorizontal, Play, Plus,
  QrCode, Search, Settings2, Sparkles, Sun, Moon, Target, Users, X, Zap,
  LogOut, Lock, Mail, AlertCircle, Info, Trash2, CalendarCheck, ShieldCheck, CreditCard, Award, UserCheck, RefreshCw,
  Edit3, Phone, Star,
} from 'lucide-react'

export type Role = 'member' | 'instructor' | 'admin' | 'simulation'
export type Discipline = 'Gym' | 'Yoga' | 'Pilates'
export type MemberTab = 'schedule' | 'my-schedule' | 'profile'
export type InstructorTab = 'schedule' | 'profile'

export interface User {
  id: string
  email: string
  name: string
  role: 'member' | 'instructor' | 'admin'
  avatar: string
  avatarColor: string
  subtitle: { vi: string; en: string }
  plan: string
  planVi?: string
  phone?: string
  bio?: string
}

export const DEMO_CREDENTIALS: { email: string; pass: string; role: 'member' | 'instructor' | 'admin'; user: User }[] = [
  {
    email: 'jordan@fitpulse.com',
    pass: '123456',
    role: 'member',
    user: {
      id: 'usr_member',
      email: 'jordan@fitpulse.com',
      name: 'Jordan Davis',
      role: 'member',
      avatar: 'JD',
      avatarColor: 'avatar-lime',
      subtitle: { vi: 'Hội viên hoạt động', en: 'Active member' },
      plan: 'Pro · All access (8 credits remaining)',
      planVi: 'Gói Pro · Toàn quyền truy cập (Còn 8 buổi)',
      phone: '0901 829 384',
    },
  },
  {
    email: 'maya@fitpulse.com',
    pass: '123456',
    role: 'instructor',
    user: {
      id: 'usr_coach',
      email: 'maya@fitpulse.com',
      name: 'Maya Chen',
      role: 'instructor',
      avatar: 'MC',
      avatarColor: 'avatar-1',
      subtitle: { vi: 'HLV Pilates & Yoga', en: 'Pilates & Yoga Coach' },
      plan: 'Certified Instructor',
      planVi: 'Huấn luyện viên Quốc tế',
      phone: '0912 345 678',
      bio: 'Hơn 10 năm kinh nghiệm trong ngành chuyển động cơ thể và hồi phục chức năng. Chú trọng tính chính xác của trục cột sống, kiểm soát hơi thở cơ hoành và tối ưu hóa sức mạnh cơ lõi (Core Control). Kết hợp kỷ luật của Pilates Reformer cổ điển và sự dẻo dai của Yoga.',
    },
  },
  {
    email: 'admin@fitpulse.com',
    pass: '123456',
    role: 'admin',
    user: {
      id: 'usr_admin',
      email: 'admin@fitpulse.com',
      name: 'Alex Morgan',
      role: 'admin',
      avatar: 'AM',
      avatarColor: 'avatar-2',
      subtitle: { vi: 'Giám đốc Điều hành Cơ sở', en: 'Studio Operations Director' },
      plan: 'Studio Administrator',
      planVi: 'Quản trị viên Cơ sở',
    },
  },
]

type Session = {
  id: number
  title: string
  titleVi?: string
  discipline: Discipline
  instructor: string
  room: string
  time: string
  duration: string
  booked: number
  capacity: number
  color: string
  day: string
  date?: string
}

export interface BookedSession {
  id: number
  sessionId: number
  title: string
  titleVi?: string
  discipline: Discipline
  instructor: string
  room: string
  time: string
  day: string
  date: string
  color: string
  status: 'confirmed' | 'waitlist' | 'attended' | 'cancelled'
  waitlistPosition?: number
}

export const DAY_LABELS_SHORT: Record<string, string> = {
  Mon: 'T2',
  Tue: 'T3',
  Wed: 'T4',
  Thu: 'T5',
  Fri: 'T6',
  Sat: 'T7',
  Sun: 'CN',
}

export function formatDay(day: string, isVi: boolean): string {
  if (!isVi) return day
  const map: Record<string, string> = {
    Mon: 'Thứ Hai',
    Tue: 'Thứ Ba',
    Wed: 'Thứ Tư',
    Thu: 'Thứ Năm',
    Fri: 'Thứ Sáu',
    Sat: 'Thứ Bảy',
    Sun: 'Chủ Nhật',
  }
  return map[day] || day
}

export function formatDuration(duration: string, isVi: boolean): string {
  if (!isVi) return duration
  if (duration === 'Flexible') return 'Linh hoạt'
  return duration.replace('min', 'phút')
}

export function formatRoom(room: string, isVi: boolean): string {
  if (!isVi) return room
  if (room === 'Reformer Studio') return 'Phòng Reformer'
  if (room === 'Zen Room') return 'Phòng Thảm Zen'
  if (room === 'Main Floor') return 'Sàn Gym Trung tâm'
  return room
}

export function formatInstructor(instructor: string, isVi: boolean): string {
  if (!isVi) return instructor
  if (instructor === 'Open access') return 'Tập tự do'
  return instructor
}

export function getSessionTitle(session: { title: string; titleVi?: string }, isVi: boolean): string {
  if (isVi && session.titleVi) return session.titleVi
  return session.title
}

/* Shared Date & Week Navigation Helpers */
export function getCurrentMonday(): Date {
  const now = new Date()
  const day = now.getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diffToMonday = (day === 0 ? -6 : 1) - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)
  return monday
}

export function getTodayDayKey(): string {
  const day = new Date().getDay()
  const dayKeys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return dayKeys[day]
}

export function getDayDate(offset: number, dayIndex: number): Date {
  const monday = getCurrentMonday()
  const targetDate = new Date(monday)
  targetDate.setDate(monday.getDate() + offset * 7 + dayIndex)
  return targetDate
}

export function getWeekRange(offset: number, isVi: boolean): string {
  const baseMonday = getCurrentMonday()
  const monday = new Date(baseMonday)
  monday.setDate(baseMonday.getDate() + offset * 7)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const mMonth = monday.getMonth() + 1
  const sMonth = sunday.getMonth() + 1
  const sYear = sunday.getFullYear()

  if (isVi) {
    if (mMonth === sMonth) {
      return `Tuần ${monday.getDate()} — ${sunday.getDate()} tháng ${sMonth}, ${sYear}`
    }
    return `Tuần ${monday.getDate()}/${mMonth} — ${sunday.getDate()}/${sMonth}, ${sYear}`
  } else {
    const mStr = monday.toLocaleString('en-US', { month: 'short' })
    const sStr = sunday.toLocaleString('en-US', { month: 'short' })
    if (mMonth === sMonth) {
      return `Week of ${mStr} ${monday.getDate()} — ${sunday.getDate()}, ${sYear}`
    }
    return `Week of ${mStr} ${monday.getDate()} — ${sStr} ${sunday.getDate()}, ${sYear}`
  }
}

export function getFullDayDateLabel(offset: number, dayIndex: number, isVi: boolean): string {
  const targetDate = getDayDate(offset, dayIndex)
  const daysVi = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật']
  const daysEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const dayName = isVi ? daysVi[dayIndex] : daysEn[dayIndex]
  const d = targetDate.getDate()
  const m = targetDate.getMonth() + 1
  const y = targetDate.getFullYear()
  if (isVi) {
    return `${dayName}, ngày ${d} tháng ${m} năm ${y}`
  } else {
    const monthName = targetDate.toLocaleString('en-US', { month: 'long' })
    return `${dayName}, ${monthName} ${d}, ${y}`
  }
}

export function formatSessionDate(day: string, offset: number = 0): string {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const idx = days.indexOf(day)
  const d = getDayDate(offset, idx >= 0 ? idx : 0)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

const initialSessions: Session[] = [
  // MONDAY (Thứ Hai - 14/10)
  { id: 1, title: 'Reformer Foundations', titleVi: 'Pilates Reformer Căn bản', discipline: 'Pilates', instructor: 'Maya Chen', room: 'Reformer Studio', time: '07:00', duration: '50 min', booked: 5, capacity: 6, color: 'violet', day: 'Mon' },
  { id: 2, title: 'Power Flow Yoga', titleVi: 'Yoga Dòng chảy Năng lượng', discipline: 'Yoga', instructor: 'Noah Williams', room: 'Zen Room', time: '08:30', duration: '60 min', booked: 14, capacity: 20, color: 'amber', day: 'Mon' },
  { id: 3, title: 'Open Gym Access', titleVi: 'Tập Gym Tự do', discipline: 'Gym', instructor: 'Open access', room: 'Main Floor', time: '10:00', duration: 'Flexible', booked: 32, capacity: 50, color: 'emerald', day: 'Mon' },
  { id: 4, title: 'Athletic Reformer', titleVi: 'Pilates Reformer Thể lực cao', discipline: 'Pilates', instructor: 'Maya Chen', room: 'Reformer Studio', time: '17:30', duration: '50 min', booked: 6, capacity: 6, color: 'violet', day: 'Mon' },
  { id: 5, title: 'Strength & Conditioning Lab', titleVi: 'Gym Thể lực & Sức mạnh Chuyên sâu', discipline: 'Gym', instructor: 'Alex Morgan', room: 'Main Floor', time: '18:45', duration: '45 min', booked: 41, capacity: 50, color: 'emerald', day: 'Mon' },
  { id: 6, title: 'Evening Yin Yoga', titleVi: 'Yoga Âm Phục hồi Buổi tối', discipline: 'Yoga', instructor: 'Noah Williams', room: 'Zen Room', time: '19:45', duration: '60 min', booked: 16, capacity: 20, color: 'amber', day: 'Mon' },

  // TUESDAY (Thứ Ba - 15/10)
  { id: 7, title: 'Sunrise Vinyasa', titleVi: 'Yoga Vinyasa Bình minh', discipline: 'Yoga', instructor: 'Noah Williams', room: 'Zen Room', time: '06:45', duration: '60 min', booked: 15, capacity: 20, color: 'amber', day: 'Tue' },
  { id: 8, title: 'Open Gym Access', titleVi: 'Tập Gym Tự do', discipline: 'Gym', instructor: 'Open access', room: 'Main Floor', time: '09:00', duration: 'Flexible', booked: 28, capacity: 50, color: 'emerald', day: 'Tue' },
  { id: 9, title: 'Core & Control', titleVi: 'Pilates Cơ lõi & Kiểm soát', discipline: 'Pilates', instructor: 'Maya Chen', room: 'Reformer Studio', time: '12:00', duration: '50 min', booked: 6, capacity: 6, color: 'violet', day: 'Tue' },
  { id: 10, title: 'Functional HIIT Circuit', titleVi: 'Gym Kháng lực & Tim mạch HIIT', discipline: 'Gym', instructor: 'Alex Morgan', room: 'Main Floor', time: '17:00', duration: '45 min', booked: 35, capacity: 50, color: 'emerald', day: 'Tue' },
  { id: 11, title: 'Reformer Jumpboard Burn', titleVi: 'Pilates Bàn nhảy Đốt mỡ', discipline: 'Pilates', instructor: 'Elena Rostova', room: 'Reformer Studio', time: '18:15', duration: '50 min', booked: 4, capacity: 6, color: 'violet', day: 'Tue' },
  { id: 12, title: 'Deep Stretch & Sound Bath', titleVi: 'Yoga Giãn cơ Sâu & Chuông xoay', discipline: 'Yoga', instructor: 'Noah Williams', room: 'Zen Room', time: '19:30', duration: '60 min', booked: 19, capacity: 20, color: 'amber', day: 'Tue' },

  // WEDNESDAY (Thứ Tư - 16/10)
  { id: 13, title: 'Spine Alignment Reformer', titleVi: 'Pilates Nắn chỉnh Cột sống & Tư thế', discipline: 'Pilates', instructor: 'Elena Rostova', room: 'Reformer Studio', time: '07:00', duration: '50 min', booked: 5, capacity: 6, color: 'violet', day: 'Wed' },
  { id: 14, title: 'Upper Body Hypertrophy', titleVi: 'Gym Phát triển Cơ bắp Thân trên', discipline: 'Gym', instructor: 'Alex Morgan', room: 'Main Floor', time: '08:30', duration: '50 min', booked: 30, capacity: 50, color: 'emerald', day: 'Wed' },
  { id: 15, title: 'Open Gym Access', titleVi: 'Tập Gym Tự do', discipline: 'Gym', instructor: 'Open access', room: 'Main Floor', time: '11:00', duration: 'Flexible', booked: 22, capacity: 50, color: 'emerald', day: 'Wed' },
  { id: 16, title: 'Ashtanga Primary Flow', titleVi: 'Yoga Ashtanga Nhịp điệu Cổ điển', discipline: 'Yoga', instructor: 'Noah Williams', room: 'Zen Room', time: '17:30', duration: '60 min', booked: 16, capacity: 20, color: 'amber', day: 'Wed' },
  { id: 17, title: 'Sculpt & Tone Reformer', titleVi: 'Pilates Điêu khắc Hình thể', discipline: 'Pilates', instructor: 'Maya Chen', room: 'Reformer Studio', time: '18:45', duration: '50 min', booked: 5, capacity: 6, color: 'violet', day: 'Wed' },
  { id: 18, title: 'Slow Wednesday Stretch', titleVi: 'Yoga Giãn cơ Thư giãn Giữa tuần', discipline: 'Yoga', instructor: 'Noah Williams', room: 'Zen Room', time: '19:45', duration: '60 min', booked: 18, capacity: 20, color: 'amber', day: 'Wed' },

  // THURSDAY (Thứ Năm - 17/10)
  { id: 19, title: 'Cardio Core Blast', titleVi: 'Gym Kích hoạt Tim mạch & Cơ lõi', discipline: 'Gym', instructor: 'Alex Morgan', room: 'Main Floor', time: '06:30', duration: '45 min', booked: 38, capacity: 50, color: 'emerald', day: 'Thu' },
  { id: 20, title: 'Reformer Foundations', titleVi: 'Pilates Reformer Căn bản', discipline: 'Pilates', instructor: 'Maya Chen', room: 'Reformer Studio', time: '08:00', duration: '50 min', booked: 6, capacity: 6, color: 'violet', day: 'Thu' },
  { id: 21, title: 'Open Gym Access', titleVi: 'Tập Gym Tự do', discipline: 'Gym', instructor: 'Open access', room: 'Main Floor', time: '10:00', duration: 'Flexible', booked: 25, capacity: 50, color: 'emerald', day: 'Thu' },
  { id: 22, title: 'Breathwork & Gentle Hatha', titleVi: 'Yoga Luyện khí Pranayama & Hatha', discipline: 'Yoga', instructor: 'Noah Williams', room: 'Zen Room', time: '17:30', duration: '60 min', booked: 11, capacity: 20, color: 'amber', day: 'Thu' },
  { id: 23, title: 'Lower Body & Glutes Power', titleVi: 'Gym Sức mạnh Thân dưới & Mông đùi', discipline: 'Gym', instructor: 'Alex Morgan', room: 'Main Floor', time: '18:30', duration: '50 min', booked: 44, capacity: 50, color: 'emerald', day: 'Thu' },
  { id: 24, title: 'Athletic Reformer', titleVi: 'Pilates Reformer Thể lực cao', discipline: 'Pilates', instructor: 'Elena Rostova', room: 'Reformer Studio', time: '19:30', duration: '50 min', booked: 5, capacity: 6, color: 'violet', day: 'Thu' },

  // FRIDAY (Thứ Sáu - 18/10)
  { id: 25, title: 'Dynamic Morning Flow', titleVi: 'Yoga Năng động Khởi đầu Ngày mới', discipline: 'Yoga', instructor: 'Noah Williams', room: 'Zen Room', time: '07:00', duration: '60 min', booked: 17, capacity: 20, color: 'amber', day: 'Fri' },
  { id: 26, title: 'Open Gym Access', titleVi: 'Tập Gym Tự do', discipline: 'Gym', instructor: 'Open access', room: 'Main Floor', time: '09:00', duration: 'Flexible', booked: 34, capacity: 50, color: 'emerald', day: 'Fri' },
  { id: 27, title: 'Core Balance Reformer', titleVi: 'Pilates Cân bằng Trọng tâm Reformer', discipline: 'Pilates', instructor: 'Maya Chen', room: 'Reformer Studio', time: '12:00', duration: '50 min', booked: 6, capacity: 6, color: 'violet', day: 'Fri' },
  { id: 28, title: 'Total Body Metabolic Circuit', titleVi: 'Gym Vòng lặp Kháng lực Trao đổi chất', discipline: 'Gym', instructor: 'Alex Morgan', room: 'Main Floor', time: '17:00', duration: '45 min', booked: 40, capacity: 50, color: 'emerald', day: 'Fri' },
  { id: 29, title: 'Reformer Burn & Sculpt', titleVi: 'Pilates Siết cơ & Đốt mỡ Reformer', discipline: 'Pilates', instructor: 'Elena Rostova', room: 'Reformer Studio', time: '18:15', duration: '50 min', booked: 4, capacity: 6, color: 'violet', day: 'Fri' },
  { id: 30, title: 'Evening Vinyasa & Meditation', titleVi: 'Yoga Vinyasa & Thiền định Tĩnh tâm', discipline: 'Yoga', instructor: 'Noah Williams', room: 'Zen Room', time: '19:30', duration: '60 min', booked: 19, capacity: 20, color: 'amber', day: 'Fri' },

  // SATURDAY (Thứ Bảy - 19/10)
  { id: 31, title: 'Weekend Reformer Masterclass', titleVi: 'Pilates Reformer Chuyên sâu Cuối tuần', discipline: 'Pilates', instructor: 'Maya Chen', room: 'Reformer Studio', time: '08:00', duration: '55 min', booked: 6, capacity: 6, color: 'violet', day: 'Sat' },
  { id: 32, title: 'Mobility Reset & Detox Yoga', titleVi: 'Yoga Phục hồi Vận động & Giải độc', discipline: 'Yoga', instructor: 'Alex Morgan', room: 'Zen Room', time: '09:30', duration: '60 min', booked: 15, capacity: 20, color: 'amber', day: 'Sat' },
  { id: 33, title: 'Open Gym Access', titleVi: 'Tập Gym Tự do', discipline: 'Gym', instructor: 'Open access', room: 'Main Floor', time: '10:30', duration: 'Flexible', booked: 45, capacity: 50, color: 'emerald', day: 'Sat' },
  { id: 34, title: 'Intro to Reformer Mechanics', titleVi: 'Nhập môn Cơ chế Máy tập Reformer', discipline: 'Pilates', instructor: 'Elena Rostova', room: 'Reformer Studio', time: '15:30', duration: '50 min', booked: 5, capacity: 6, color: 'violet', day: 'Sat' },
  { id: 35, title: 'Powerlifting & Heavy Compound', titleVi: 'Gym Kỹ thuật Nâng tạ Sức mạnh', discipline: 'Gym', instructor: 'Alex Morgan', room: 'Main Floor', time: '17:00', duration: '60 min', booked: 36, capacity: 50, color: 'emerald', day: 'Sat' },

  // SUNDAY (Chủ Nhật - 20/10)
  { id: 36, title: 'Gentle Sunday Awakening Yoga', titleVi: 'Yoga Đánh thức Thân tâm Chủ nhật', discipline: 'Yoga', instructor: 'Noah Williams', room: 'Zen Room', time: '08:30', duration: '60 min', booked: 18, capacity: 20, color: 'amber', day: 'Sun' },
  { id: 37, title: 'Mindful Reformer Flow', titleVi: 'Pilates Thấu cảm Chuyển động Reformer', discipline: 'Pilates', instructor: 'Maya Chen', room: 'Reformer Studio', time: '10:00', duration: '50 min', booked: 6, capacity: 6, color: 'violet', day: 'Sun' },
  { id: 38, title: 'Open Gym Access', titleVi: 'Tập Gym Tự do', discipline: 'Gym', instructor: 'Open access', room: 'Main Floor', time: '11:00', duration: 'Flexible', booked: 27, capacity: 50, color: 'emerald', day: 'Sun' },
  { id: 39, title: 'Tibetan Sound Bath & Deep Rest', titleVi: 'Chuông xoay Tây Tạng & Nghỉ ngơi Sâu', discipline: 'Yoga', instructor: 'Noah Williams', room: 'Zen Room', time: '16:00', duration: '60 min', booked: 20, capacity: 20, color: 'amber', day: 'Sun' },
  { id: 40, title: 'Functional Endurance Lab', titleVi: 'Gym Sức bền Thể lực & Chức năng', discipline: 'Gym', instructor: 'Alex Morgan', room: 'Main Floor', time: '17:30', duration: '50 min', booked: 33, capacity: 50, color: 'emerald', day: 'Sun' },
]

const initialBookedSessions: BookedSession[] = [
  {
    id: 101,
    sessionId: 1,
    title: 'Reformer Foundations',
    titleVi: 'Pilates Reformer Căn bản',
    discipline: 'Pilates',
    instructor: 'Maya Chen',
    room: 'Reformer Studio',
    time: '07:00',
    day: 'Mon',
    date: formatSessionDate('Mon', 0),
    color: 'violet',
    status: 'confirmed',
  },
  {
    id: 102,
    sessionId: 18,
    title: 'Slow Wednesday Stretch',
    titleVi: 'Yoga Giãn cơ Thư giãn Giữa tuần',
    discipline: 'Yoga',
    instructor: 'Noah Williams',
    room: 'Zen Room',
    time: '19:45',
    day: 'Wed',
    date: formatSessionDate('Wed', 0),
    color: 'amber',
    status: 'confirmed',
  },
]

function Chip({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'green' | 'violet' | 'amber' | 'red' }) {
  return <span className={`chip chip-${tone}`}>{children}</span>
}

function Logo() {
  return (
    <div className="logo">
      <div className="logo-mark"><Activity /></div>
      <span>fit<span>pulse</span></span>
    </div>
  )
}

export default function FitPulseApp() {
  const [isMounted, setIsMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role>('member')
  const [memberTab, setMemberTab] = useState<MemberTab>('schedule')
  const [instructorTab, setInstructorTab] = useState<InstructorTab>('schedule')
  const [sessions, setSessions] = useState(initialSessions)
  const [bookedSessions, setBookedSessions] = useState<BookedSession[]>(initialBookedSessions)
  const [creditsLeft, setCreditsLeft] = useState(8)
  const [filter, setFilter] = useState<'All' | Discipline>('All')
  const [selected, setSelected] = useState<Session | null>(null)
  const [selectedClassDetail, setSelectedClassDetail] = useState<Session | null>(null)
  const [toast, setToast] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [activeDay, setActiveDay] = useState(getTodayDayKey)
  const [lightTheme, setLightTheme] = useState(true)
  const [language, setLanguage] = useState<'vi' | 'en'>('vi')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const isVi = language === 'vi'
  const t = (vi: string, en: string) => isVi ? vi : en

  // 1. Restore all saved state from localStorage on client mount
  useEffect(() => {
    setIsMounted(true)
    try {
      const saved = localStorage.getItem('fitpulse_session')
      if (saved) {
        const parsed: User = JSON.parse(saved)
        setCurrentUser(parsed)
        setRole(parsed.role === 'admin' ? 'admin' : parsed.role === 'instructor' ? 'instructor' : 'member')
      }
      const savedSessions = localStorage.getItem('fitpulse_sessions')
      if (savedSessions) {
        setSessions(JSON.parse(savedSessions))
      }
      const savedBooked = localStorage.getItem('fitpulse_booked_sessions')
      if (savedBooked) {
        setBookedSessions(JSON.parse(savedBooked))
      }
      const savedCredits = localStorage.getItem('fitpulse_credits_left')
      if (savedCredits !== null) {
        setCreditsLeft(Number(savedCredits))
      }
      const savedTheme = localStorage.getItem('fitpulse_theme')
      if (savedTheme !== null) {
        setLightTheme(savedTheme === 'light')
      }
      const savedLang = localStorage.getItem('fitpulse_lang')
      if (savedLang === 'vi' || savedLang === 'en') {
        setLanguage(savedLang)
      }
      const savedTab = localStorage.getItem('fitpulse_member_tab')
      if (savedTab === 'schedule' || savedTab === 'my-schedule' || savedTab === 'profile') {
        setMemberTab(savedTab as MemberTab)
      }
      const savedInstTab = localStorage.getItem('fitpulse_instructor_tab')
      if (savedInstTab === 'schedule' || savedInstTab === 'profile') {
        setInstructorTab(savedInstTab as InstructorTab)
      }
    } catch (e) {
      console.error('Failed to load local storage state', e)
    }
  }, [])

  // 2. Synchronize state changes to localStorage
  useEffect(() => {
    if (!isMounted) return
    localStorage.setItem('fitpulse_sessions', JSON.stringify(sessions))
  }, [sessions, isMounted])

  useEffect(() => {
    if (!isMounted) return
    localStorage.setItem('fitpulse_booked_sessions', JSON.stringify(bookedSessions))
  }, [bookedSessions, isMounted])

  useEffect(() => {
    if (!isMounted) return
    localStorage.setItem('fitpulse_credits_left', String(creditsLeft))
  }, [creditsLeft, isMounted])

  useEffect(() => {
    if (!isMounted) return
    localStorage.setItem('fitpulse_theme', lightTheme ? 'light' : 'dark')
  }, [lightTheme, isMounted])

  useEffect(() => {
    if (!isMounted) return
    localStorage.setItem('fitpulse_lang', language)
  }, [language, isMounted])

  useEffect(() => {
    if (!isMounted) return
    localStorage.setItem('fitpulse_member_tab', memberTab)
  }, [memberTab, isMounted])

  useEffect(() => {
    if (!isMounted) return
    localStorage.setItem('fitpulse_instructor_tab', instructorTab)
  }, [instructorTab, isMounted])

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    localStorage.setItem('fitpulse_session', JSON.stringify(user))
    setRole(user.role === 'admin' ? 'admin' : user.role === 'instructor' ? 'instructor' : 'member')
    setMemberTab('schedule')
    setInstructorTab('schedule')
    showToast(isVi ? `Chào mừng trở lại, ${user.name}` : `Welcome back, ${user.name}`)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('fitpulse_session')
    setUserMenuOpen(false)
    setRole('member')
    setMemberTab('schedule')
    setInstructorTab('schedule')
    setSelectedClassDetail(null)
    showToast(isVi ? 'Đã đăng xuất thành công' : 'Signed out successfully')
  }

  const handleUpdateUser = (updatedData: Partial<User>) => {
    if (!currentUser) return
    let newAvatar = currentUser.avatar
    if (updatedData.name && updatedData.name.trim()) {
      const parts = updatedData.name.trim().split(/\s+/)
      if (parts.length >= 2) {
        newAvatar = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      } else if (parts.length === 1 && parts[0].length > 0) {
        newAvatar = parts[0].slice(0, 2).toUpperCase()
      }
    }
    const updatedUser: User = {
      ...currentUser,
      ...updatedData,
      avatar: newAvatar,
    }
    setCurrentUser(updatedUser)
    localStorage.setItem('fitpulse_session', JSON.stringify(updatedUser))
    showToast(isVi ? 'Đã lưu thay đổi thông tin hồ sơ thành công!' : 'Profile updated successfully!')
  }

  const book = (session: Session) => {
    if (session.booked >= session.capacity) return
    if (creditsLeft <= 0) {
      showToast(isVi ? 'Gói tập đã hết buổi khả dụng. Vui lòng gia hạn!' : 'No credits remaining. Please renew your package!')
      return
    }

    setSessions(items => items.map(item => item.id === session.id ? { ...item, booked: item.booked + 1 } : item))
    const newBooked: BookedSession = {
      id: Date.now(),
      sessionId: session.id,
      title: session.title,
      titleVi: session.titleVi,
      discipline: session.discipline,
      instructor: session.instructor,
      room: session.room,
      time: session.time,
      day: session.day,
      date: session.date || formatSessionDate(session.day, 0),
      color: session.color,
      status: 'confirmed',
    }
    setBookedSessions(prev => [newBooked, ...prev])
    setCreditsLeft(c => c - 1)
    setSelected(null)
    const displayName = isVi ? (session.titleVi || session.title) : session.title
    showToast(isVi ? `Đã đặt ca ${displayName}. Còn lại ${creditsLeft - 1} buổi khả dụng.` : `${session.title} booked. ${creditsLeft - 1} credits remaining.`)
  }

  const joinWaitlist = (session: Session) => {
    const existing = bookedSessions.find(b => b.sessionId === session.id && (b.status === 'waitlist' || b.status === 'confirmed'))
    if (existing) {
      if (existing.status === 'confirmed') {
        showToast(isVi ? 'Bạn đã đặt ca này rồi.' : 'You are already booked for this session.')
      } else {
        showToast(isVi ? 'Bạn đã có trong Hàng chờ của ca này rồi.' : 'You are already in waitlist for this session.')
      }
      return
    }

    const waitlistItem: BookedSession = {
      id: Date.now(),
      sessionId: session.id,
      title: session.title,
      titleVi: session.titleVi,
      discipline: session.discipline,
      instructor: session.instructor,
      room: session.room,
      time: session.time,
      day: session.day,
      date: session.date || formatSessionDate(session.day, 0),
      color: session.color,
      status: 'waitlist',
      waitlistPosition: 1,
    }
    setBookedSessions(prev => [waitlistItem, ...prev])
    const displayName = isVi ? (session.titleVi || session.title) : session.title
    showToast(isVi ? `Đã đăng ký Hàng chờ: ${displayName}! Bạn ở vị trí #1.` : `Joined waitlist: ${session.title}! You are #1 in queue.`)
  }

  const leaveWaitlist = (bookedId: number, sessionTitle: string) => {
    setBookedSessions(prev => prev.filter(b => b.id !== bookedId))
    showToast(isVi ? `Đã rời hàng chờ ca ${sessionTitle}.` : `Left waitlist for ${sessionTitle}.`)
  }

  const cancelBooking = (bookedId: number, sessionId: number, sessionTitle: string) => {
    // 1. Remove the cancelled booking
    setBookedSessions(prev => prev.filter(b => b.id !== bookedId))

    // 2. Automated Waitlist Allocation Algorithm: Check if a candidate is queued in waitlist
    const waitlistCandidate = bookedSessions.find(b => b.sessionId === sessionId && b.status === 'waitlist' && b.id !== bookedId)

    if (waitlistCandidate) {
      // Auto-promote candidate from waitlist to confirmed spot without decrementing session capacity
      setBookedSessions(prev => prev.map(b => b.id === waitlistCandidate.id ? { ...b, status: 'confirmed', waitlistPosition: undefined } : b))
      showToast(isVi
        ? `Đã hủy ca ${sessionTitle}. Thuật toán đã tự động nâng hạng vị trí Hàng chờ lên ca chính thức!`
        : `Cancelled ${sessionTitle}. Waitlist candidate automatically promoted to confirmed spot!`)
    } else {
      // Normal cancellation: restore capacity and credit
      setSessions(items => items.map(item => item.id === sessionId ? { ...item, booked: Math.max(0, item.booked - 1) } : item))
      setCreditsLeft(c => c + 1)
      showToast(isVi ? `Đã hủy ca ${sessionTitle}. Đã hoàn trả 1 buổi tập vào tài khoản.` : `Cancelled ${sessionTitle}. 1 credit restored to your package.`)
    }
  }

  // Filter allowed navigation items based on logged in user's role (Strict RBAC)
  const memberNavItems = useMemo(() => [
    { id: 'schedule', label: isVi ? 'Lịch tập Studio' : 'Studio schedule', icon: CalendarDays },
    { id: 'my-schedule', label: isVi ? 'Lịch của bạn' : 'My schedule', icon: Clock3 },
  ], [isVi])

  const instructorNavItems = useMemo(() => [
    { id: 'schedule', label: isVi ? 'Lịch giảng dạy' : 'Teaching schedule', icon: CalendarDays },
  ], [isVi])

  const adminNavItems = useMemo(() => [
    { id: 'admin', label: isVi ? 'Bảng quản trị' : 'Admin dashboard', icon: BarChart3 },
    { id: 'simulation', label: isVi ? 'Mô phỏng thuật toán' : 'Algorithm demo', icon: Zap },
  ], [isVi])

  // If not logged in, render the clean Login View
  if (!currentUser) {
    return (
      <div className={`login-page-root ${lightTheme ? 'theme-light' : ''}`} style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <LoginView
          onLogin={handleLogin}
          lightTheme={lightTheme}
          setLightTheme={setLightTheme}
          language={language}
          setLanguage={setLanguage}
          isVi={isVi}
          t={t}
        />
        {toast && <div className="toast"><CircleCheck />{toast}</div>}
      </div>
    )
  }

  return (
    <div className={`app-shell ${lightTheme ? 'theme-light' : ''}`}>
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <Logo />
          <button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu">
            <X />
          </button>
        </div>

        <div className="workspace-label">{t('PHÂN HỆ NGHIỆP VỤ', 'WORKSPACE')}</div>

        <nav className="side-nav">
          {currentUser.role === 'member' && memberNavItems.map(item => {
            const Icon = item.icon
            const isActive = memberTab === item.id
            return (
              <button
                key={item.id}
                className={`side-link ${isActive ? 'active' : ''}`}
                onClick={() => { setMemberTab(item.id as MemberTab); setSelectedClassDetail(null); setMobileNav(false) }}
              >
                <Icon />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="nav-arrow" />}
              </button>
            )
          })}

          {currentUser.role === 'instructor' && instructorNavItems.map(item => {
            const Icon = item.icon
            const isActive = instructorTab === item.id
            return (
              <button
                key={item.id}
                className={`side-link ${isActive ? 'active' : ''}`}
                onClick={() => { setInstructorTab(item.id as InstructorTab); setMobileNav(false) }}
              >
                <Icon />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="nav-arrow" />}
              </button>
            )
          })}

          {currentUser.role === 'admin' && adminNavItems.map(item => {
            const Icon = item.icon
            const isActive = role === item.id
            return (
              <button
                key={item.id}
                className={`side-link ${isActive ? 'active' : ''}`}
                onClick={() => { setRole(item.id as Role); setMobileNav(false) }}
              >
                <Icon />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="nav-arrow" />}
              </button>
            )
          })}
        </nav>

        <div className="side-spacer" />
        {/* Notice: Bottom widget (photo 2) is completely removed as requested! */}
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMobileNav(true)} aria-label="Open navigation">
            <Menu />
          </button>

          <div className="topbar-context">
            <span className="eyebrow">
              {currentUser.role === 'member'
                ? selectedClassDetail
                  ? `FITPULSE / ${t('CHI TIẾT LỚP HỌC & HLV', 'CLASS & INSTRUCTOR DETAIL')}`
                  : `FITPULSE / ${memberTab === 'schedule' ? t('LỊCH STUDIO', 'STUDIO SCHEDULE') : memberTab === 'my-schedule' ? t('LỊCH CỦA BẠN', 'MY SCHEDULE') : t('HỒ SƠ HỘI VIÊN', 'MEMBER PROFILE')}`
                : currentUser.role === 'instructor'
                ? `FITPULSE / ${instructorTab === 'schedule' ? t('LỊCH GIẢNG DẠY', 'INSTRUCTOR SCHEDULE') : t('HỒ SƠ CHUYÊN MÔN', 'COACH PROFILE')}`
                : `FITPULSE / ${t('QUẢN TRỊ VIÊN', 'ADMIN')}`}
            </span>
            <span className="live-status">
              <span className="pulse-dot" /> {t('Hệ thống trực tiếp', 'Live system')}
            </span>
          </div>

          <div className="topbar-actions">
            <button
              className="theme-toggle"
              onClick={() => setLightTheme(v => !v)}
              title={lightTheme ? t('Chuyển sang giao diện tối', 'Switch to dark theme') : t('Chuyển sang giao diện sáng', 'Switch to light theme')}
            >
              {lightTheme ? <Moon /> : <Sun />}
              <span>{lightTheme ? t('Sáng', 'Light') : t('Tối', 'Dark')}</span>
            </button>

            <button
              className="language-toggle"
              onClick={() => setLanguage(v => v === 'vi' ? 'en' : 'vi')}
              title={t('Chuyển đổi ngôn ngữ', 'Switch language')}
            >
              <span className={isVi ? 'active' : ''}>VI</span>
              <span className={isVi ? '' : 'active'}>EN</span>
            </button>

            {/* User Profile Dropdown on Top Right (With Logout action inside) */}
            <div className="user-menu-wrap" ref={userMenuRef}>
              <button
                className="user-menu-trigger"
                onClick={() => setUserMenuOpen(v => !v)}
                title={t('Tài khoản người dùng', 'User profile')}
              >
                <div className={`avatar ${currentUser.avatarColor}`}>{currentUser.avatar}</div>
                <span className="user-menu-name">{currentUser.name.split(' ')[0]}</span>
                <ChevronDown style={{ width: 13, height: 13, color: 'var(--muted)' }} />
              </button>

              {userMenuOpen && (
                <div className="user-menu-dropdown">
                  <div className="user-dropdown-header">
                    <div className={`avatar ${currentUser.avatarColor}`}>{currentUser.avatar}</div>
                    <div className="user-dropdown-info">
                      <strong>{currentUser.name}</strong>
                      <span>{currentUser.email}</span>
                      <span className={`role-badge-sidebar ${currentUser.role}`} style={{ marginTop: 4 }}>
                        {currentUser.role === 'member' ? t('Hội viên', 'Member') : currentUser.role === 'instructor' ? t('Huấn luyện viên', 'Instructor') : t('Quản trị viên', 'Admin')}
                      </span>
                    </div>
                  </div>

                  {currentUser.role === 'member' && (
                    <button
                      className="user-dropdown-item"
                      onClick={() => {
                        setSelectedClassDetail(null)
                        setMemberTab('profile')
                        setUserMenuOpen(false)
                      }}
                    >
                      <QrCode style={{ width: 14, height: 14, color: 'var(--teal)' }} />
                      <span>{t('Hồ sơ & Thẻ hội viên', 'Profile & Pass')}</span>
                    </button>
                  )}

                  {currentUser.role === 'instructor' && (
                    <button
                      className="user-dropdown-item"
                      onClick={() => {
                        setInstructorTab('profile')
                        setUserMenuOpen(false)
                      }}
                    >
                      <Award style={{ width: 14, height: 14, color: 'var(--violet)' }} />
                      <span>{t('Hồ sơ chuyên môn & Thẻ HLV', 'Coach Profile & Pass')}</span>
                    </button>
                  )}

                  {currentUser.role === 'admin' && (
                    <>
                      <button
                        className="user-dropdown-item"
                        onClick={() => {
                          setUserMenuOpen(false)
                          showToast(isVi ? 'Đang mở Cài đặt Hệ thống Studio...' : 'Opening Studio Settings...')
                        }}
                      >
                        <Settings2 style={{ width: 14, height: 14, color: 'var(--amber)' }} />
                        <span>{t('Cài đặt hệ thống Studio', 'Studio Settings')}</span>
                      </button>
                      <button
                        className="user-dropdown-item"
                        onClick={() => {
                          setUserMenuOpen(false)
                          showToast(isVi ? 'Bảo mật & Phân quyền: Cấp quyền 3 tầng RBAC hoạt động' : 'Security: 3-tier RBAC active')
                        }}
                      >
                        <ShieldCheck style={{ width: 14, height: 14, color: 'var(--teal)' }} />
                        <span>{t('Quản trị phân quyền & Bảo mật', 'Access Control')}</span>
                      </button>
                    </>
                  )}

                  <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />

                  <button className="user-dropdown-item danger" onClick={handleLogout}>
                    <LogOut style={{ width: 14, height: 14 }} />
                    <span>{t('Đăng xuất tài khoản', 'Sign out')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-wrap">
          {currentUser.role === 'member' && (
            <>
              {selectedClassDetail ? (
                <ClassDetailView
                  session={selectedClassDetail}
                  sessions={sessions}
                  bookedSessions={bookedSessions}
                  creditsLeft={creditsLeft}
                  isVi={isVi}
                  onBack={() => setSelectedClassDetail(null)}
                  onSelect={setSelected}
                  onJoinWaitlist={joinWaitlist}
                  onCancelBooking={cancelBooking}
                  onLeaveWaitlist={leaveWaitlist}
                  showToast={showToast}
                />
              ) : (
                <>
                  {memberTab === 'schedule' && (
                    <MemberView
                      sessions={sessions}
                      filter={filter}
                      setFilter={setFilter}
                      activeDay={activeDay}
                      setActiveDay={setActiveDay}
                      onSelect={setSelected}
                      onJoinWaitlist={joinWaitlist}
                      onCancelBooking={cancelBooking}
                      onLeaveWaitlist={leaveWaitlist}
                      onViewDetail={setSelectedClassDetail}
                      bookedSessions={bookedSessions}
                      isVi={isVi}
                      user={currentUser}
                      creditsLeft={creditsLeft}
                      onGoToProfile={() => setMemberTab('profile')}
                      onGoToMySchedule={() => setMemberTab('my-schedule')}
                    />
                  )}

                  {memberTab === 'my-schedule' && (
                    <MyScheduleView
                      bookedSessions={bookedSessions}
                      sessions={sessions}
                      onCancel={cancelBooking}
                      onLeaveWaitlist={leaveWaitlist}
                      onGoToExplore={() => {
                        setSelectedClassDetail(null)
                        setMemberTab('schedule')
                      }}
                      onViewDetail={setSelectedClassDetail}
                      isVi={isVi}
                      showToast={showToast}
                    />
                  )}

                  {memberTab === 'profile' && (
                    <MemberProfileView
                      user={currentUser}
                      creditsLeft={creditsLeft}
                      bookedSessions={bookedSessions}
                      isVi={isVi}
                      onGoToSchedule={() => {
                        setSelectedClassDetail(null)
                        setMemberTab('schedule')
                      }}
                      showToast={showToast}
                      onUpdateUser={handleUpdateUser}
                    />
                  )}
                </>
              )}
            </>
          )}

          {role === 'instructor' && currentUser.role === 'instructor' && (
            <>
              {instructorTab === 'schedule' && (
                <InstructorView
                  sessions={sessions}
                  bookedSessions={bookedSessions}
                  showToast={showToast}
                  user={currentUser}
                  isVi={isVi}
                  onGoToProfile={() => setInstructorTab('profile')}
                />
              )}
              {instructorTab === 'profile' && (
                <InstructorProfileView
                  user={currentUser}
                  sessions={sessions}
                  isVi={isVi}
                  onGoToSchedule={() => setInstructorTab('schedule')}
                  showToast={showToast}
                  onUpdateUser={handleUpdateUser}
                />
              )}
            </>
          )}

          {role === 'admin' && currentUser.role === 'admin' && (
            <AdminView sessions={sessions} setSessions={setSessions} showToast={showToast} isVi={isVi} />
          )}

          {role === 'simulation' && currentUser.role === 'admin' && (
            <SimulationView showToast={showToast} isVi={isVi} />
          )}
        </div>
      </main>

      {selected && <BookingModal session={selected} onClose={() => setSelected(null)} onBook={book} isVi={isVi} creditsLeft={creditsLeft} />}
      {toast && <div className="toast"><CircleCheck />{toast}</div>}
    </div>
  )
}

/* ==========================================================================
   LOGIN VIEW COMPONENT (SPLIT-SCREEN WITH BACKGROUND & FULL TOGGLES)
   ========================================================================== */
function LoginView({
  onLogin,
  lightTheme,
  setLightTheme,
  language,
  setLanguage,
  isVi,
  t,
}: {
  onLogin: (u: User) => void
  lightTheme: boolean
  setLightTheme: React.Dispatch<React.SetStateAction<boolean>>
  language: 'vi' | 'en'
  setLanguage: React.Dispatch<React.SetStateAction<'vi' | 'en'>>
  isVi: boolean
  t: (vi: string, en: string) => string
}) {
  const [email, setEmail] = useState('jordan@fitpulse.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      const matched = DEMO_CREDENTIALS.find(
        c => c.email.toLowerCase().trim() === email.toLowerCase().trim() && c.pass === password
      )

      if (matched) {
        onLogin(matched.user)
      } else {
        setError(t('Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin bên dưới.', 'Invalid email or password. Please verify the credentials below.'))
      }
    }, 400)
  }

  return (
    <div className="login-shell">
      {/* Floating Controls at Top Right (Z-INDEX 50 so never clipped or hidden) */}
      <div className="login-topbar">
        <button
          className="theme-toggle"
          onClick={() => setLightTheme(v => !v)}
          title={lightTheme ? t('Chuyển giao diện tối', 'Switch dark') : t('Chuyển giao diện sáng', 'Switch light')}
        >
          {lightTheme ? <Moon /> : <Sun />}
          <span>{lightTheme ? t('Sáng', 'Light') : t('Tối', 'Dark')}</span>
        </button>

        <button
          className="language-toggle"
          onClick={() => setLanguage(v => v === 'vi' ? 'en' : 'vi')}
          title="Switch language"
        >
          <span className={isVi ? 'active' : ''}>VI</span>
          <span className={isVi ? '' : 'active'}>EN</span>
        </button>
      </div>

      <div className="login-container">
        {/* Left Side: Hero Brand Showcase */}
        <div className="login-hero">
          <div className="login-hero-eyebrow">
            <Sparkles style={{ width: 14, height: 14 }} />
            <span>FITPULSE STUDIO INTELLIGENCE</span>
          </div>
          <h1>
            {isVi ? (
              <>Tổ hợp thể thao, <em>chuyển động hoàn mỹ.</em></>
            ) : (
              <>Precision wellness, <em>in motion.</em></>
            )}
          </h1>
          <p>
            {isVi
              ? 'Nền tảng quản trị và tự động hóa phân bổ lịch trình cho tổ hợp Gym, Yoga và Pilates Reformer với kiểm soát sức chứa thời gian thực.'
              : 'Intelligent multi-disciplinary studio management platform with automated capacity-constrained scheduling for Gym, Yoga, and Pilates Reformer.'}
          </p>

          <div className="login-hero-features">
            <div className="login-feature-item">
              <div className="login-feature-icon"><Zap /></div>
              <div className="login-feature-text">
                <strong>{isVi ? 'Thuật toán cân bằng sức chứa' : 'Capacity-Constrained Optimizer'}</strong>
                <span>{isVi ? 'Giới hạn nghiêm ngặt 6 máy Reformer & chống trùng lịch HLV' : 'Strict 6 reformer cap & zero instructor double-booking'}</span>
              </div>
            </div>

            <div className="login-feature-item">
              <div className="login-feature-icon"><Users /></div>
              <div className="login-feature-text">
                <strong>{isVi ? 'Phân quyền 3 cấp độ (RBAC)' : '3-Tier Role-Based Access Control'}</strong>
                <span>{isVi ? 'Giao diện chuyên biệt cho Hội viên, Huấn luyện viên & Quản trị viên' : 'Tailored portals for Members, Coaches, and Studio Directors'}</span>
              </div>
            </div>

            <div className="login-feature-item">
              <div className="login-feature-icon"><QrCode /></div>
              <div className="login-feature-text">
                <strong>{isVi ? 'Thẻ hội viên số & Điểm danh 1 chạm' : 'Digital Pass & 1-Click Check-in'}</strong>
                <span>{isVi ? 'Điểm danh tức thì và cập nhật số buổi tập theo thời gian thực' : 'Real-time credit tracking and instant attendance roster'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The Login Card */}
        <div className="login-card">
          <div className="login-header">
            <Logo />
            <h1>{t('Đăng nhập vào FitPulse', 'Sign in to FitPulse')}</h1>
            <p>
              {t(
                'Hệ thống quản lý và điều phối lịch tập tổ hợp Gym, Yoga & Pilates',
                'Multi-disciplinary Fitness & Wellness Management Platform'
              )}
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="login-error">
                <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">{t('Địa chỉ Email', 'Email Address')}</label>
              <div className="input-with-icon">
                <Mail />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@fitpulse.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('Mật khẩu', 'Password')}</label>
              <div className="input-with-icon">
                <Lock />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="button button-primary full-width"
              style={{ padding: '12px', marginTop: '6px' }}
              disabled={loading}
            >
              {loading ? t('Đang xác thực...', 'Authenticating...') : t('Đăng nhập vào hệ thống', 'Sign In to System')}
              {!loading && <ArrowUpRight />}
            </button>
          </form>

          {/* Informational block for testing/grading accounts */}
          <div className="demo-info-card">
            <div className="demo-info-title">
              <Info />
              <span>{t('THÔNG TIN TÀI KHOẢN TRUY CẬP (KIỂM THỬ HỆ THỐNG)', 'ACCESS CREDENTIALS FOR SYSTEM EVALUATION')}</span>
            </div>

            <div className="demo-accounts-table">
              <div
                className="demo-account-row"
                onClick={() => { setEmail('jordan@fitpulse.com'); setPassword('123456') }}
                title={isVi ? 'Bấm để tự động điền tài khoản Hội viên' : 'Click to autofill Member credentials'}
              >
                <div className="demo-role-badge member">
                  <LayoutDashboard style={{ width: 13, height: 13 }} />
                  <span>{t('Hội viên (Member):', 'Member Role:')}</span>
                </div>
                <div className="demo-credentials">
                  <code>jordan@fitpulse.com</code> / <code>123456</code>
                </div>
              </div>

              <div
                className="demo-account-row"
                onClick={() => { setEmail('maya@fitpulse.com'); setPassword('123456') }}
                title={isVi ? 'Bấm để tự động điền tài khoản HLV' : 'Click to autofill Instructor credentials'}
              >
                <div className="demo-role-badge instructor">
                  <Users style={{ width: 13, height: 13 }} />
                  <span>{t('Huấn luyện viên (Coach):', 'Instructor Role:')}</span>
                </div>
                <div className="demo-credentials">
                  <code>maya@fitpulse.com</code> / <code>123456</code>
                </div>
              </div>

              <div
                className="demo-account-row"
                onClick={() => { setEmail('admin@fitpulse.com'); setPassword('123456') }}
                title={isVi ? 'Bấm để tự động điền tài khoản Quản trị viên' : 'Click to autofill Admin credentials'}
              >
                <div className="demo-role-badge admin">
                  <BarChart3 style={{ width: 13, height: 13 }} />
                  <span>{t('Quản trị viên (Admin):', 'Admin Role:')}</span>
                </div>
                <div className="demo-credentials">
                  <code>admin@fitpulse.com</code> / <code>123456</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow accent-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}


/* ==========================================================================
   PAGE 1: MEMBER STUDIO EXPLORE & BOOKING (MEMBER VIEW)
   ========================================================================== */
function MemberView({
  sessions,
  filter,
  setFilter,
  activeDay,
  setActiveDay,
  onSelect,
  onJoinWaitlist,
  onCancelBooking,
  onLeaveWaitlist,
  onViewDetail,
  bookedSessions,
  isVi,
  user,
  creditsLeft,
  onGoToProfile,
  onGoToMySchedule,
}: {
  sessions: Session[]
  filter: 'All' | Discipline
  setFilter: (f: 'All' | Discipline) => void
  activeDay: string
  setActiveDay: (d: string) => void
  onSelect: (s: Session) => void
  onJoinWaitlist: (s: Session) => void
  onCancelBooking?: (bookedId: number, sessionId: number, title: string) => void
  onLeaveWaitlist?: (bookedId: number, title: string) => void
  onViewDetail?: (s: Session) => void
  bookedSessions: BookedSession[]
  isVi: boolean
  user: User
  creditsLeft: number
  onGoToProfile: () => void
  onGoToMySchedule?: () => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDisciplines, setSelectedDisciplines] = useState<Discipline[]>([])
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<('morning' | 'afternoon' | 'evening')[]>([])

  const toggleDiscipline = (d: Discipline) => {
    setSelectedDisciplines(prev => {
      let next: Discipline[]
      if (prev.length === 0) {
        next = [d]
      } else if (prev.includes(d)) {
        next = prev.filter(x => x !== d)
      } else {
        next = [...prev, d]
      }
      if (next.length === 3) next = []
      if (setFilter) setFilter(next.length === 1 ? next[0] : 'All')
      return next
    })
  }

  const selectAllDisciplines = () => {
    setSelectedDisciplines([])
    if (setFilter) setFilter('All')
  }

  const toggleTimeSlot = (slot: 'morning' | 'afternoon' | 'evening') => {
    setSelectedTimeSlots(prev => {
      let next: ('morning' | 'afternoon' | 'evening')[]
      if (prev.length === 0) {
        next = [slot]
      } else if (prev.includes(slot)) {
        next = prev.filter(s => s !== slot)
      } else {
        next = [...prev, slot]
      }
      if (next.length === 3) next = []
      return next
    })
  }

  const [weekOffset, setWeekOffset] = useState(0)

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Multi-dimensional filtering: Day + Multi-choice Disciplines + Multi-choice Time Slots + Search Query
  const filtered = useMemo(() => {
    return sessions.filter(s => {
      // 1. Day filter
      if (s.day !== activeDay) return false

      // 2. Multi-choice Discipline filter
      if (selectedDisciplines.length > 0 && selectedDisciplines.length < 3) {
        if (!selectedDisciplines.includes(s.discipline)) return false
      }

      // 3. Multi-choice Time of Day filter
      if (selectedTimeSlots.length > 0 && selectedTimeSlots.length < 3) {
        const [hStr, mStr] = s.time.split(':')
        const hour = parseInt(hStr, 10) + (parseInt(mStr || '0', 10) / 60)
        const slot = hour < 12 ? 'morning' : (hour < 17.5 ? 'afternoon' : 'evening')
        if (!selectedTimeSlots.includes(slot)) return false
      }

      // 4. Live Search filter (matches class title, coach, room, or discipline)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = s.title.toLowerCase().includes(q)
        const matchTitleVi = s.titleVi ? s.titleVi.toLowerCase().includes(q) : false
        const matchCoach = s.instructor.toLowerCase().includes(q)
        const matchRoom = s.room.toLowerCase().includes(q)
        const matchDiscipline = s.discipline.toLowerCase().includes(q)
        if (!matchTitle && !matchTitleVi && !matchCoach && !matchRoom && !matchDiscipline) return false
      }

      return true
    })
  }, [sessions, activeDay, selectedDisciplines, selectedTimeSlots, searchQuery])
  const copy = isVi ? {
    eyebrow: `Chào buổi sáng, ${user.name.split(' ')[0]}`,
    title: 'Tuần này của bạn, luôn chuyển động.',
    description: 'Tìm buổi tập tiếp theo và duy trì đà tiến bộ.',
    card: 'Thẻ hội viên',
    schedule: 'Lịch studio',
    week: 'Tuần 14 — 20 tháng 10, 2026',
    thisWeek: 'Tuần này',
    empty: 'Không có buổi tập nào phù hợp.',
    streak: 'Bạn đã duy trì chuỗi 4 tuần',
    goal: `Còn ${creditsLeft} buổi tập khả dụng trong tháng này.`,
    monthly: 'Buổi tập khả dụng',
    allDisciplines: 'Tất cả',
  } : {
    eyebrow: `Good morning, ${user.name.split(' ')[0]}`,
    title: 'Your week, in motion.',
    description: 'Find your next session and keep your momentum going.',
    card: 'My membership card',
    schedule: 'Studio schedule',
    week: 'Week of October 14 — 20, 2026',
    thisWeek: 'This week',
    empty: 'No sessions match this filter.',
    streak: "You're on a 4 week streak",
    goal: `${creditsLeft} credits remaining in your active package.`,
    monthly: 'Remaining credits',
    allDisciplines: 'All',
  }

  // Simplified filter tags strictly: Gym / Pilates / Yoga (and All)
  const disciplinePills: { id: 'All' | Discipline; label: string }[] = [
    { id: 'All', label: copy.allDisciplines },
    { id: 'Gym', label: 'Gym' },
    { id: 'Pilates', label: 'Pilates' },
    { id: 'Yoga', label: 'Yoga' },
  ]

  return (
    <>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Chip tone="green">
              <span className="pulse-dot" /> {isVi ? 'Gói Pro khả dụng' : 'Pro Active'}
            </Chip>
          </div>
        }
      />

      <div className="member-grid">
        <section className="schedule-panel">
          <div className="section-heading">
            <div>
              <h2>{copy.schedule}</h2>
              <p>{getWeekRange(weekOffset, isVi)}</p>
            </div>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => { setWeekOffset(0); setActiveDay(getTodayDayKey()); }}
              title={isVi ? 'Trở về tuần hiện tại' : 'Jump to current week'}
            >
              <CalendarDays /> {copy.thisWeek}
            </button>
          </div>

          <div className="day-tabs-row">
            <button
              type="button"
              className="week-nav-arrow-btn"
              onClick={() => setWeekOffset(w => w - 1)}
              title={isVi ? 'Tuần trước' : 'Previous week'}
              aria-label="Previous week"
            >
              <ChevronLeft style={{ width: 16, height: 16 }} />
            </button>

            <div className="day-tabs">
              {days.map((day, idx) => {
                const dateObj = getDayDate(weekOffset, idx)
                return (
                  <button
                    key={day}
                    type="button"
                    className={day === activeDay ? 'selected' : ''}
                    onClick={() => setActiveDay(day)}
                    title={`${isVi ? DAY_LABELS_SHORT[day] : day}, ${dateObj.getDate()}/${dateObj.getMonth() + 1}`}
                  >
                    <span>{isVi ? DAY_LABELS_SHORT[day] : day}</span>
                    <strong>{dateObj.getDate()}</strong>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              className="week-nav-arrow-btn"
              onClick={() => setWeekOffset(w => w + 1)}
              title={isVi ? 'Tuần sau' : 'Next week'}
              aria-label="Next week"
            >
              <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Advanced Search & Filtering Suite */}
          <div className="schedule-filters-stack">
            {/* Search Input Box */}
            <div className="search-bar-wrap">
              <Search className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isVi ? 'Tìm lớp học hoặc huấn luyện viên...' : 'Search class or coach...'}
                className="search-input"
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery('')} aria-label="Clear search">
                  <X style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>

            {/* Minimalist Filter Controls: Sleek Tag Pills */}
            <div className="filter-controls-row">
              {/* Discipline Filters */}
              <div className="filter-group">
                <span className="filter-group-title">
                  {isVi ? 'Bộ môn:' : 'Discipline:'}
                </span>
                <div className="filter-checkbox-group">
                  <button
                    type="button"
                    className={`filter-checkbox-pill ${selectedDisciplines.length === 0 || selectedDisciplines.length === 3 ? 'checked' : ''}`}
                    onClick={selectAllDisciplines}
                  >
                    <span>{copy.allDisciplines}</span>
                  </button>

                  {(['Gym', 'Pilates', 'Yoga'] as Discipline[]).map(d => {
                    const isChecked = selectedDisciplines.length > 0 && selectedDisciplines.includes(d)
                    return (
                      <button
                        key={d}
                        type="button"
                        className={`filter-checkbox-pill ${isChecked ? 'checked' : ''}`}
                        onClick={() => toggleDiscipline(d)}
                      >
                        <span>{d}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time Slot Filters */}
              <div className="filter-group">
                <span className="filter-group-title">
                  {isVi ? 'Khung giờ:' : 'Time:'}
                </span>
                <div className="filter-checkbox-group">
                  <button
                    type="button"
                    className={`filter-checkbox-pill ${selectedTimeSlots.length === 0 || selectedTimeSlots.length === 3 ? 'checked' : ''}`}
                    onClick={() => setSelectedTimeSlots([])}
                  >
                    <span>{isVi ? 'Tất cả giờ' : 'All day'}</span>
                  </button>

                  {([
                    { id: 'morning' as const, label: isVi ? 'Sáng' : 'Morning' },
                    { id: 'afternoon' as const, label: isVi ? 'Chiều' : 'Afternoon' },
                    { id: 'evening' as const, label: isVi ? 'Tối' : 'Evening' },
                  ]).map(item => {
                    const isChecked = selectedTimeSlots.length > 0 && selectedTimeSlots.includes(item.id)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`filter-checkbox-pill ${isChecked ? 'checked' : ''}`}
                        onClick={() => toggleTimeSlot(item.id)}
                      >
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="session-list">
            {filtered.map(session => {
              const dayIdx = days.indexOf(session.day)
              const targetDate = getDayDate(weekOffset, dayIdx)
              const dateFormatted = `${String(targetDate.getDate()).padStart(2, '0')}/${String(targetDate.getMonth() + 1).padStart(2, '0')}/${targetDate.getFullYear()}`
              const sessionWithDate: Session = { ...session, date: dateFormatted }

              const bookedItem = bookedSessions.find(b => b.sessionId === session.id && (b.status === 'confirmed' || b.status === 'waitlist'))
              const isBooked = bookedItem?.status === 'confirmed'
              const isWaitlisted = bookedItem?.status === 'waitlist'

              return (
                <SessionRow
                  key={`${session.id}-${weekOffset}`}
                  session={sessionWithDate}
                  onSelect={onSelect}
                  onJoinWaitlist={onJoinWaitlist}
                  onCancelBooking={onCancelBooking && bookedItem ? () => onCancelBooking(bookedItem.id, session.id, getSessionTitle(session, isVi)) : undefined}
                  onLeaveWaitlist={onLeaveWaitlist && bookedItem ? () => onLeaveWaitlist(bookedItem.id, getSessionTitle(session, isVi)) : undefined}
                  onViewDetail={onViewDetail}
                  isVi={isVi}
                  isBooked={isBooked}
                  isWaitlisted={isWaitlisted}
                />
              )
            })}
            {filtered.length === 0 && (
              <div className="empty-state" style={{ padding: '42px 20px', textAlign: 'center' }}>
                <Search style={{ width: 32, height: 32, color: 'var(--muted)', margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: '0 0 6px' }}>
                  {copy.empty}
                </p>
                <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: 11 }}>
                  {isVi ? 'Không tìm thấy ca tập với bộ lọc hiện tại. Thử xóa tìm kiếm hoặc đổi khung giờ.' : 'No sessions match the current criteria. Try clearing search or changing time filters.'}
                </p>
                <button
                  className="button button-ghost"
                  onClick={() => { setSearchQuery(''); setSelectedDisciplines([]); setSelectedTimeSlots([]) }}
                  style={{ fontSize: 11, padding: '7px 15px' }}
                >
                  <RefreshCw style={{ width: 12, height: 12 }} /> {isVi ? 'Đặt lại bộ lọc' : 'Reset filters'}
                </button>
              </div>
            )}
          </div>
        </section>

        <MembershipCard user={user} isVi={isVi} creditsLeft={creditsLeft} onGoToProfile={onGoToProfile} />
      </div>

      <div className="insight-strip">
        <div className="insight-icon"><Flame /></div>
        <div>
          <strong>{copy.streak}</strong>
          <span>{copy.goal}</span>
        </div>
        <div className="progress-wrap">
          <div className="progress-label">
            <span>{copy.monthly}</span>
            <strong>{creditsLeft} / 10 {isVi ? 'buổi' : 'credits'}</strong>
          </div>
          <div className="progress"><i style={{ width: `${(creditsLeft / 10) * 100}%` }} /></div>
        </div>
        <ArrowUpRight />
      </div>
    </>
  )
}

function SessionRow({
  session,
  onSelect,
  onJoinWaitlist,
  onCancelBooking,
  onLeaveWaitlist,
  onViewDetail,
  isVi,
  isBooked,
  isWaitlisted,
}: {
  session: Session
  onSelect: (s: Session) => void
  onJoinWaitlist: (s: Session) => void
  onCancelBooking?: () => void
  onLeaveWaitlist?: () => void
  onViewDetail?: (s: Session) => void
  isVi: boolean
  isBooked: boolean
  isWaitlisted: boolean
}) {
  const left = session.capacity - session.booked
  const full = left <= 0

  return (
    <div
      className={`session-row ${onViewDetail ? 'session-row-clickable' : ''}`}
      onClick={() => onViewDetail?.(session)}
      title={isVi ? 'Bấm để xem chi tiết lớp học & thông tin giảng viên' : 'Click to view class & instructor details'}
    >
      <div className={`discipline-icon ${session.color}`}>
        {session.discipline === 'Gym' ? <Dumbbell /> : session.discipline === 'Yoga' ? <Activity /> : <Target />}
      </div>
      <div className="session-main">
        <div className="session-title">
          <strong>{getSessionTitle(session, isVi)}</strong>
          {full && <Chip tone="red">{isVi ? 'Hết chỗ' : 'Class full'}</Chip>}
          {!full && left <= 2 && <Chip tone="amber">{left} {isVi ? 'chỗ còn lại' : 'spots left'}</Chip>}
          {isBooked && <Chip tone="green">{isVi ? 'Đã đặt' : 'Booked'}</Chip>}
          {isWaitlisted && <Chip tone="amber">{isVi ? 'Đang chờ #1' : 'Waitlist #1'}</Chip>}
        </div>
        <div className="session-meta">
          <span><Clock3 /> {session.time} · {formatDuration(session.duration, isVi)}</span>
          <span><Users /> {formatInstructor(session.instructor, isVi)}</span>
          <span><MapPin /> {formatRoom(session.room, isVi)}</span>
        </div>
      </div>
      <div className="capacity">
        <div className="capacity-bar">
          <i style={{ width: `${Math.min(100, (session.booked / session.capacity) * 100)}%` }} />
        </div>
        <span>{session.booked}/{session.capacity} {isVi ? 'đã đặt' : 'booked'}</span>
      </div>

      {isBooked ? (
        <button
          type="button"
          className="button button-booked-action"
          onClick={(e) => {
            e.stopPropagation()
            onCancelBooking?.()
          }}
          title={isVi ? 'Bấm để hủy ca tập này' : 'Click to cancel booking'}
        >
          <span className="btn-label-normal">{isVi ? 'Đã đặt' : 'Booked'}</span>
          <span className="btn-label-hover"><X style={{ width: 11, height: 11 }} /> {isVi ? 'Hủy ca' : 'Cancel'}</span>
        </button>
      ) : isWaitlisted ? (
        <button
          type="button"
          className="button button-waitlisted-action"
          onClick={(e) => {
            e.stopPropagation()
            onLeaveWaitlist?.()
          }}
          title={isVi ? 'Bấm để rời danh sách hàng chờ' : 'Click to leave waitlist'}
        >
          <span className="btn-label-normal">{isVi ? 'Hàng chờ #1' : 'Waitlist #1'}</span>
          <span className="btn-label-hover"><X style={{ width: 11, height: 11 }} /> {isVi ? 'Rời chờ' : 'Leave'}</span>
        </button>
      ) : full ? (
        <button
          className="button button-waitlist"
          onClick={(e) => {
            e.stopPropagation()
            onJoinWaitlist(session)
          }}
          title={isVi ? 'Đăng ký vào danh sách chờ' : 'Join waitlist queue'}
        >
          {isVi ? 'Hàng chờ' : 'Waitlist'} <ArrowUpRight />
        </button>
      ) : (
        <button
          className="button button-dark"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(session)
          }}
        >
          {isVi ? 'Đặt ca' : 'Book'} <ArrowUpRight />
        </button>
      )}

      {onViewDetail && (
        <span className="session-hover-hint">
          <ChevronRight style={{ width: 14, height: 14 }} />
        </span>
      )}
    </div>
  )
}

function MembershipCard({ user, isVi, creditsLeft, onGoToProfile }: { user: User; isVi: boolean; creditsLeft: number; onGoToProfile?: () => void }) {
  return (
    <aside className="membership-card">
      <div className="membership-top">
        <span>{isVi ? 'THẺ HỘI VIÊN SỐ' : 'FITPULSE DIGITAL PASS'}</span>
        <QrCode />
      </div>
      <div className="member-name">
        <div className={`avatar avatar-large ${user.avatarColor}`}>{user.avatar}</div>
        <div>
          <strong>{user.name}</strong>
          <span>{isVi ? (user.planVi || user.plan) : user.plan}</span>
        </div>
      </div>
      <div className="qr-box" onClick={onGoToProfile} style={{ cursor: onGoToProfile ? 'pointer' : 'default' }} title={isVi ? 'Nhấn để xem thẻ chi tiết' : 'Click to view full pass'}>
        <div className="qr-pattern"><QrCode /></div>
        <span>{isVi ? 'Quét mã để điểm danh' : 'Scan to check in'}</span>
      </div>
      <div className="membership-footer">
        <div>
          <span>{isVi ? 'Số buổi còn' : 'Sessions left'}</span>
          <strong>{creditsLeft < 10 ? `0${creditsLeft}` : creditsLeft}</strong>
        </div>
        <div>
          <span>{isVi ? 'Hạn gia hạn' : 'Renews in'}</span>
          <strong>12 {isVi ? 'ngày' : 'days'}</strong>
        </div>
        <Chip tone="green">{isVi ? 'Hoạt động' : 'Active'}</Chip>
      </div>
    </aside>
  )
}

function BookingModal({ session, onClose, onBook, isVi, creditsLeft }: { session: Session; onClose: () => void; onBook: (s: Session) => void; isVi: boolean; creditsLeft: number }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className={`modal-banner ${session.color}`}>
          <button className="icon-button light" onClick={onClose} aria-label="Close"><X /></button>
          <div className="modal-discipline">{isVi ? `Buổi tập ${session.discipline}` : `${session.discipline} session`}</div>
          <h2>{getSessionTitle(session, isVi)}</h2>
        </div>
        <div className="modal-content">
          <div className="modal-details">
            <span><Clock3 /> {session.time} · {formatDuration(session.duration, isVi)}</span>
            <span><MapPin /> {formatRoom(session.room, isVi)}</span>
            <span><Users /> {formatInstructor(session.instructor, isVi)}</span>
          </div>
          <div className="credit-box">
            <div>
              <strong>{creditsLeft}</strong>
              <span>{isVi ? 'buổi tập khả dụng' : 'credits remaining'}</span>
            </div>
            <span className="credit-arrow">− 1 {isVi ? 'buổi' : 'credit'}</span>
          </div>
          <button className="button button-primary full-width" onClick={() => onBook(session)}>
            <Check /> {isVi ? 'Xác nhận đặt lịch' : 'Confirm booking'}
          </button>
          <p className="modal-note">
            {isVi ? 'Hủy trước 2 tiếng để được hoàn trả buổi tập vào tài khoản.' : 'Cancel up to 2 hours before class to restore your credit.'}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   PAGE 2: MY SCHEDULE / BOOKED SESSIONS VIEW (NEW PAGE)
   ========================================================================== */
function MyScheduleView({
  bookedSessions,
  sessions,
  onCancel,
  onLeaveWaitlist,
  onGoToExplore,
  onViewDetail,
  isVi,
  showToast,
}: {
  bookedSessions: BookedSession[]
  sessions?: Session[]
  onCancel: (bookedId: number, sessionId: number, title: string) => void
  onLeaveWaitlist: (bookedId: number, title: string) => void
  onGoToExplore: () => void
  onViewDetail?: (s: Session) => void
  isVi: boolean
  showToast: (msg: string) => void
}) {
  const confirmedSessions = bookedSessions.filter(b => b.status === 'confirmed')
  const waitlistSessions = bookedSessions.filter(b => b.status === 'waitlist')

  return (
    <>
      <PageHeader
        eyebrow={isVi ? 'Quản lý lịch học của bạn' : 'Your Personal Calendar'}
        title={isVi ? 'Lịch tập đã đặt của bạn.' : 'Your booked sessions.'}
        description={isVi ? 'Theo dõi các ca học sắp diễn ra, hủy lịch hoặc đồng bộ vào lịch cá nhân.' : 'Track your upcoming classes, cancel bookings, or sync with your calendar.'}
        action={
          <button className="button button-primary" onClick={onGoToExplore}>
            <Plus /> {isVi ? 'Đặt thêm ca học mới' : 'Book another session'}
          </button>
        }
      />

      {confirmedSessions.length > 0 && (
        <div className="next-session-banner">
          <div className="next-session-info">
            <div className="next-session-icon">
              <Clock3 style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <strong>{isVi ? 'Ca tập tiếp theo: ' : 'Next up: '}{getSessionTitle(confirmedSessions[0], isVi)}</strong>
              <p>
                {formatDay(confirmedSessions[0].day, isVi)}, {confirmedSessions[0].time} · {formatRoom(confirmedSessions[0].room, isVi)} · {isVi ? 'HLV: ' : 'Coach: '}{formatInstructor(confirmedSessions[0].instructor, isVi)}
              </p>
            </div>
          </div>
          <Chip tone="green">
            <span className="pulse-dot" /> {isVi ? 'Đã xác nhận chỗ' : 'Confirmed'}
          </Chip>
        </div>
      )}

      <div className="detail-card">
        <div className="section-heading" style={{ marginBottom: 18 }}>
          <div>
            <h2>{isVi ? 'Danh sách ca tập đã đăng ký' : 'Registered classes'}</h2>
            <p>{confirmedSessions.length} {isVi ? 'ca chính thức' : 'confirmed'} · {waitlistSessions.length} {isVi ? 'ca trong hàng chờ' : 'in waitlist'}</p>
          </div>
          <button className="button button-ghost" onClick={() => showToast(isVi ? 'Đã đồng bộ lịch với Google Calendar!' : 'Calendar synced with Google Calendar!')}>
            <CalendarCheck /> {isVi ? 'Đồng bộ Google Calendar' : 'Sync Calendar'}
          </button>
        </div>

        {bookedSessions.length === 0 ? (
          <div className="empty-state" style={{ padding: '50px 20px' }}>
            <CalendarDays style={{ width: 36, height: 36, color: 'var(--muted)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: '0 0 6px' }}>
              {isVi ? 'Bạn chưa đặt ca tập nào.' : 'You have no booked sessions yet.'}
            </p>
            <p style={{ margin: '0 0 16px', color: 'var(--muted)' }}>
              {isVi ? 'Khám phá các ca Gym, Yoga và Pilates Reformer trong tuần và đặt chỗ ngay!' : 'Explore our weekly schedule and reserve your spot!'}
            </p>
            <button className="button button-primary" onClick={onGoToExplore}>
              <Plus /> {isVi ? 'Khám phá lịch Studio' : 'Explore Schedule'}
            </button>
          </div>
        ) : (
          <div className="my-schedule-list">
            {bookedSessions.map(item => {
              const matchedSession = sessions?.find(s => s.id === item.sessionId)
              return (
                <div
                  className={`booked-card ${matchedSession && onViewDetail ? 'session-row-clickable' : ''}`}
                  key={item.id}
                  onClick={() => {
                    if (matchedSession && onViewDetail) onViewDetail(matchedSession)
                  }}
                  title={matchedSession && onViewDetail ? (isVi ? 'Bấm để xem chi tiết lớp học & giảng viên' : 'Click to view class & instructor details') : undefined}
                >
                  <div className="booked-card-left">
                    <div className={`discipline-icon ${item.color}`}>
                      {item.discipline === 'Gym' ? <Dumbbell /> : item.discipline === 'Yoga' ? <Activity /> : <Target />}
                    </div>
                    <div className="booked-card-main">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <strong>{getSessionTitle(item, isVi)}</strong>
                        {item.status === 'waitlist' ? (
                          <Chip tone="amber">
                            <Clock3 style={{ width: 10, height: 10 }} /> {isVi ? 'Hàng chờ #1' : 'Waitlist #1'}
                          </Chip>
                        ) : (
                          <Chip tone="green">{isVi ? 'Đã xác nhận' : 'Confirmed'}</Chip>
                        )}
                      </div>
                      <div className="booked-card-meta">
                        <span><CalendarDays style={{ width: 12, height: 12 }} /> {formatDay(item.day, isVi)}, {item.date}</span>
                        <span><Clock3 style={{ width: 12, height: 12 }} /> {item.time}</span>
                        <span><Users style={{ width: 12, height: 12 }} /> {formatInstructor(item.instructor, isVi)}</span>
                        <span><MapPin style={{ width: 12, height: 12 }} /> {formatRoom(item.room, isVi)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="booked-card-actions">
                    {item.status === 'waitlist' ? (
                      <button
                        className="button button-ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onLeaveWaitlist(item.id, getSessionTitle(item, isVi))
                        }}
                        style={{ color: '#e27d78', borderColor: 'rgba(226, 125, 120, .3)' }}
                        title={isVi ? 'Rời danh sách chờ' : 'Leave waitlist queue'}
                      >
                        <Trash2 style={{ width: 13, height: 13 }} />
                        <span>{isVi ? 'Rời hàng chờ' : 'Leave waitlist'}</span>
                      </button>
                    ) : (
                      <button
                        className="button button-ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onCancel(item.id, item.sessionId, getSessionTitle(item, isVi))
                        }}
                        style={{ color: '#e27d78', borderColor: 'rgba(226, 125, 120, .3)' }}
                        title={isVi ? 'Hủy ca và hoàn trả buổi tập' : 'Cancel booking and refund credit'}
                      >
                        <Trash2 style={{ width: 13, height: 13 }} />
                        <span>{isVi ? 'Hủy ca' : 'Cancel'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

/* ==========================================================================
   PAGE 3: DETAILED PROFILE & MEMBERSHIP PASS VIEW (NEW PAGE)
   ========================================================================== */
function MemberProfileView({
  user,
  creditsLeft,
  bookedSessions,
  isVi,
  onGoToSchedule,
  showToast,
  onUpdateUser,
}: {
  user: User
  creditsLeft: number
  bookedSessions: BookedSession[]
  isVi: boolean
  onGoToSchedule: () => void
  showToast: (msg: string) => void
  onUpdateUser?: (updated: Partial<User>) => void
}) {
  const [tokenCountdown, setTokenCountdown] = useState(45)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(user.name)
  const [editEmail, setEditEmail] = useState(user.email)
  const [editPhone, setEditPhone] = useState(user.phone || '0901 829 384')

  const handleOpenEdit = () => {
    setEditName(user.name)
    setEditEmail(user.email)
    setEditPhone(user.phone || '0901 829 384')
    setIsEditing(true)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) {
      showToast(isVi ? 'Họ và tên không được để trống' : 'Name cannot be empty')
      return
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      showToast(isVi ? 'Vui lòng nhập địa chỉ email hợp lệ' : 'Please enter a valid email address')
      return
    }
    if (onUpdateUser) {
      onUpdateUser({
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
      })
    }
    setIsEditing(false)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTokenCountdown(t => (t <= 1 ? 45 : t - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <PageHeader
        eyebrow={isVi ? 'Tài khoản & Thẻ định danh' : 'Account & Pass Overview'}
        title={isVi ? 'Thông tin chi tiết hội viên.' : 'Member profile & pass.'}
        description={isVi ? 'Xem thông tin gói tập hiện tại, quyền lợi thành viên và thẻ kỹ thuật số.' : 'Manage your subscription, member benefits, and digital check-in token.'}
        action={
          <button className="button button-primary" onClick={onGoToSchedule}>
            <CalendarDays /> {isVi ? 'Xem lịch tập' : 'Studio schedule'}
          </button>
        }
      />

      <div className="profile-grid-layout">
        {/* Left Column: Plan details & Perks & History */}
        <div>
          <div className="detail-card">
            <div className="profile-header-strip">
              <div className={`avatar avatar-large ${user.avatarColor}`} style={{ width: 52, height: 52, fontSize: 16 }}>
                {user.avatar}
              </div>
              <div className="profile-header-info">
                <h2>{user.name}</h2>
                <span>
                  {user.email} {user.phone ? `· ${user.phone}` : ''} · {isVi ? 'Mã hội viên' : 'Member ID'}: <strong>FP-2026-8921-JD</strong>
                </span>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Chip tone="green">
                    <ShieldCheck style={{ width: 12, height: 12 }} />
                    {isVi ? 'Hội viên chính thức' : 'Verified Member'}
                  </Chip>
                  {user.phone && (
                    <span style={{ fontSize: 11, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Phone style={{ width: 11, height: 11 }} /> {user.phone}
                    </span>
                  )}
                </div>
              </div>
              <button
                className="button button-ghost"
                style={{ marginLeft: 'auto', gap: 6, whiteSpace: 'nowrap' }}
                onClick={handleOpenEdit}
              >
                <Edit3 style={{ width: 14, height: 14, color: 'var(--teal)' }} />
                <span>{isVi ? 'Chỉnh sửa hồ sơ' : 'Edit profile'}</span>
              </button>
            </div>

            <div className="section-heading">
              <div>
                <h2>{isVi ? 'Gói thành viên hiện tại' : 'Active membership package'}</h2>
                <p>{isVi ? 'Gói Pro · Toàn quyền Đa bộ môn (Gym + Yoga + Pilates)' : 'Pro · All Access Multi-Disciplinary (Gym + Yoga + Pilates)'}</p>
              </div>
              <Chip tone="violet">{isVi ? 'Gói cao cấp' : 'Pro Tier'}</Chip>
            </div>

            <div style={{ margin: '20px 0 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{isVi ? 'Số buổi tập khả dụng trong tháng' : 'Remaining monthly session credits'}</span>
                <strong style={{ color: 'var(--text)' }}>{creditsLeft} / 10 {isVi ? 'buổi' : 'credits'}</strong>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <i style={{ width: `${(creditsLeft / 10) * 100}%` }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 18 }}>
              <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255, 255, 255, .03)', border: '1px solid var(--line)' }}>
                <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block' }}>{isVi ? 'Hạn sử dụng' : 'Valid until'}</span>
                <strong style={{ fontSize: 13, color: 'var(--text)', display: 'block', marginTop: 4 }}>14/11/2026</strong>
              </div>
              <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255, 255, 255, .03)', border: '1px solid var(--line)' }}>
                <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block' }}>{isVi ? 'Ngày gia hạn' : 'Renews in'}</span>
                <strong style={{ fontSize: 13, color: 'var(--teal)', display: 'block', marginTop: 4 }}>12 {isVi ? 'ngày' : 'days'}</strong>
              </div>
              <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255, 255, 255, .03)', border: '1px solid var(--line)' }}>
                <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block' }}>{isVi ? 'Trạng thái' : 'Billing state'}</span>
                <strong style={{ fontSize: 13, color: 'var(--lime)', display: 'block', marginTop: 4 }}>{isVi ? 'Tự động' : 'Auto-renew'}</strong>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>{isVi ? 'ĐẶC QUYỀN GÓI PRO' : 'PACKAGE PERKS & BENEFITS'}</div>
              <div className="perks-grid">
                <div className="perk-item">
                  <Check /> <span>{isVi ? 'Tủ đồ thông minh RFID' : 'Smart RFID Locker'}</span>
                </div>
                <div className="perk-item">
                  <Check /> <span>{isVi ? 'Khăn tập & Nước khoáng ion' : 'Free Towel & Ion Water'}</span>
                </div>
                <div className="perk-item">
                  <Check /> <span>{isVi ? '1 buổi InBody hàng tháng' : 'Monthly InBody Analysis'}</span>
                </div>
                <div className="perk-item">
                  <Check /> <span>{isVi ? 'Đặt trước máy Reformer' : 'Reformer Priority Booking'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <div className="section-heading">
              <div>
                <h2>{isVi ? 'Lịch sử check-in gần nhất' : 'Recent attendance log'}</h2>
                <p>{isVi ? 'Nhật ký 4 buổi tập đã hoàn thành' : 'Last 4 completed workout sessions'}</p>
              </div>
              <button className="button button-ghost" onClick={() => showToast(isVi ? 'Đang trích xuất lịch sử tập luyện...' : 'Exporting workout report...')}>
                <ArrowUpRight /> {isVi ? 'Xuất báo cáo' : 'Export log'}
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{isVi ? 'Ngày' : 'Date'}</th>
                    <th>{isVi ? 'Bộ môn' : 'Discipline'}</th>
                    <th>{isVi ? 'Ca học' : 'Class'}</th>
                    <th>{isVi ? 'HLV' : 'Trainer'}</th>
                    <th>{isVi ? 'Trạng thái' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['13/10/2026', 'Pilates', 'Athletic Reformer', 'Maya Chen', isVi ? 'Đã tham gia' : 'Checked-in'],
                    ['11/10/2026', 'Yoga', 'Power Flow', 'Noah Williams', isVi ? 'Đã tham gia' : 'Checked-in'],
                    ['09/10/2026', 'Gym', 'Strength Lab', 'Alex Morgan', isVi ? 'Đã tham gia' : 'Checked-in'],
                    ['06/10/2026', 'Pilates', 'Core & Control', 'Maya Chen', isVi ? 'Đã tham gia' : 'Checked-in'],
                  ].map((row, idx) => (
                    <tr key={idx}>
                      <td><strong>{row[0]}</strong></td>
                      <td>
                        <span className={`chip chip-${row[1] === 'Gym' ? 'green' : row[1] === 'Yoga' ? 'amber' : 'violet'}`}>
                          {row[1]}
                        </span>
                      </td>
                      <td>{row[2]}</td>
                      <td>{row[3]}</td>
                      <td><Chip tone="green"><Check style={{ width: 10, height: 10 }} /> {row[4]}</Chip></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Digital Pass QR & Card */}
        <div>
          <div className="detail-card" style={{ textAlign: 'center' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>{isVi ? 'THẺ HỘI VIÊN CHÍNH THỨC' : 'FITPULSE OFFICIAL PASS'}</div>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, color: 'var(--text)' }}>
              {isVi ? 'Thẻ định danh điện tử' : 'Digital Studio Pass'}
            </h2>

            <div className="qr-box" style={{ width: 220, height: 220, margin: '0 auto 16px', padding: 18 }}>
              <div className="qr-pattern" style={{ width: 150, height: 150 }}>
                <QrCode style={{ width: 140, height: 140 }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, color: 'var(--muted)', marginBottom: 18 }}>
              <RefreshCw style={{ width: 12, height: 12, color: 'var(--teal)' }} />
              <span>{isVi ? `Mã token tự động làm mới sau ${tokenCountdown}s` : `Security token refreshes in ${tokenCountdown}s`}</span>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(255, 255, 255, .03)', border: '1px solid var(--line)', marginBottom: 18, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--muted)' }}>{isVi ? 'Mã thẻ thành viên' : 'Member Barcode'}</span>
                <strong style={{ color: 'var(--text)', fontFamily: 'monospace' }}>FP-8921-JD</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: 'var(--muted)' }}>{isVi ? 'Tình trạng thẻ' : 'Card Status'}</span>
                <span style={{ color: 'var(--teal)', fontWeight: 700 }}>{isVi ? 'Đã kích hoạt' : 'Active & Verified'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="button button-primary full-width" onClick={() => showToast(isVi ? 'Đã tải mã QR thẻ hội viên về thiết bị!' : 'QR Pass saved to device!')}>
                <QrCode /> {isVi ? 'Tải mã QR về máy' : 'Download QR Code'}
              </button>
              <button className="button button-ghost full-width" onClick={() => showToast(isVi ? 'Đã đồng bộ thẻ vào Apple Wallet!' : 'Added pass to Apple Wallet!')}>
                <CreditCard /> {isVi ? 'Thêm vào Apple / Google Wallet' : 'Add to Wallet'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-backdrop" onClick={() => setIsEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 'min(480px, 92vw)' }}>
            <div className="modal-banner lime">
              <button className="icon-button light" onClick={() => setIsEditing(false)} aria-label="Close"><X /></button>
              <div className="modal-discipline">{isVi ? 'Hồ sơ thành viên' : 'Member Profile'}</div>
              <h2>{isVi ? 'Chỉnh sửa thông tin cá nhân' : 'Edit Personal Details'}</h2>
            </div>
            <form onSubmit={handleSaveEdit} className="modal-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 22 }}>
                <div className="form-group">
                  <label>{isVi ? 'Họ và tên' : 'Full Name'}</label>
                  <div className="input-with-icon">
                    <UserCheck />
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder={isVi ? 'Nhập họ và tên...' : 'Enter your name...'}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{isVi ? 'Địa chỉ Email' : 'Email Address'}</label>
                  <div className="input-with-icon">
                    <Mail />
                    <input
                      type="email"
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      placeholder="name@fitpulse.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{isVi ? 'Số điện thoại liên hệ' : 'Phone Number'}</label>
                  <div className="input-with-icon">
                    <Phone />
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      placeholder="0901 829 384"
                    />
                  </div>
                </div>

                <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255, 255, 255, .03)', border: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Info style={{ width: 14, height: 14, color: 'var(--teal)', flexShrink: 0 }} />
                  <span>
                    {isVi
                      ? 'Thông tin cập nhật sẽ được lưu trữ an toàn và đồng bộ tức thì trên toàn hệ thống.'
                      : 'Updated details will immediately synchronize across the system and persist locally.'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="button button-ghost" onClick={() => setIsEditing(false)}>
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button type="submit" className="button button-primary">
                  <Check style={{ width: 14, height: 14 }} /> {isVi ? 'Lưu thông tin' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}


/* ==========================================================================
   CLASS DETAIL & LEAD INSTRUCTOR DOSSIER COMPONENT
   ========================================================================== */
export interface InstructorDetailProfile {
  name: string
  avatar: string
  avatarColor: string
  title: { vi: string; en: string }
  experience: { vi: string; en: string }
  rating: number
  reviewCount: number
  teachingHours: string
  bio: { vi: string; en: string }
  certifications: string[]
  specialties: { vi: string[]; en: string[] }
  phone: string
  email: string
  quote: { vi: string; en: string }
}

export const INSTRUCTOR_PROFILES: Record<string, InstructorDetailProfile> = {
  'Maya Chen': {
    name: 'Maya Chen',
    avatar: 'MC',
    avatarColor: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    title: {
      vi: 'Chuyên gia Huấn luyện Pilates Cổ điển & Reformer',
      en: 'Senior Classical & Reformer Pilates Specialist',
    },
    experience: {
      vi: '8+ năm kinh nghiệm · Cựu vũ công múa cổ điển',
      en: '8+ years experience · Former Classical Ballerina',
    },
    rating: 4.98,
    reviewCount: 218,
    teachingHours: '1,450+ giờ',
    bio: {
      vi: 'Maya Chen tốt nghiệp Học viện Nghệ thuật Chuyển động và sở hữu chứng chỉ PMA Certified Pilates Teacher cùng Balanced Body Master Trainer. Phong cách huấn luyện của Maya tập trung vào độ chính xác giải phẫu, kiểm soát hơi thở sâu và tái định hình chuỗi cơ lõi sâu nhằm phục hồi tư thế, triệt tiêu đau mỏi cột sống và đánh thức năng lượng dẻo dai bên trong.',
      en: 'Maya Chen is a PMA Certified Pilates Teacher and Balanced Body Master Trainer. Her methodology blends anatomical precision, diaphragmatic control, and kinetic chain realignment to sculpt elongated core strength, eliminate spinal compression, and restore vibrant balance.',
    },
    certifications: [
      'PMA Certified Pilates Teacher',
      'Balanced Body Master Trainer',
      'Anatomy Trains Kinetic Chains Specialist',
      'Pre & Post-Natal Reformer Conditioning',
    ],
    specialties: {
      vi: ['Reformer Căn bản & Nâng cao', 'Cơ lõi & Kiểm soát Trọng tâm', 'Nắn chỉnh Cột sống & Phục hồi', 'Pilates Bàn nhảy Đốt mỡ'],
      en: ['Reformer Foundations & Mastery', 'Deep Core & Kinetic Stability', 'Spine Realignment & Posture Rehab', 'Athletic Jumpboard Burn'],
    },
    phone: '0912 345 678',
    email: 'maya@fitpulse.com',
    quote: {
      vi: '"Cơ thể bạn là ngôi đền duy nhất bạn sở hữu suốt cuộc đời. Hãy chăm sóc từng khớp xương bằng sự tôn trọng và chính xác."',
      en: '"Your body is the only temple you dwell in for life. Treat every joint and breath with absolute precision and reverence."',
    },
  },
  'Noah Williams': {
    name: 'Noah Williams',
    avatar: 'NW',
    avatarColor: 'linear-gradient(135deg, #d97706, #f59e0b)',
    title: {
      vi: 'Bậc thầy Yoga Vinyasa, Yin Yoga & Trị liệu Chuông xoay',
      en: 'Master Yoga Instructor & Sound Healing Practitioner',
    },
    experience: {
      vi: '10+ năm tu học & đào tạo tại Rishikesh (Ấn Độ) & Nepal',
      en: '10+ years practice & study in Rishikesh & Kathmandu',
    },
    rating: 4.96,
    reviewCount: 185,
    teachingHours: '2,100+ giờ',
    bio: {
      vi: 'Noah Williams đạt chứng chỉ cao cấp Yoga Alliance E-RYT 500 và là chuyên gia trị liệu chuông xoay Tây Tạng được đào tạo trực tiếp tại thung lũng Kathmandu (Nepal). Lớp học của Noah dẫn dắt học viên qua những chuỗi asana nhịp nhàng kết hợp với tần số rung động của chuông xoay Tây Tạng, giúp thanh lọc tâm trí, giải tỏa căng thẳng hệ thần kinh thực vật và mở rộng biên độ chuyển động tự nhiên.',
      en: 'Noah Williams holds the prestigious Yoga Alliance E-RYT 500 credential and completed Tibetan Singing Bowl therapy masteries in Kathmandu. His classes guide students through fluid breath-driven Vinyasa sequences synchronized with healing acoustic resonances, releasing neural fatigue and awakening profound inner peace.',
    },
    certifications: [
      'Yoga Alliance E-RYT 500 (Master Trainer)',
      'YACEP Continuing Education Provider',
      'Tibetan Sound Bowl Therapy Master (Nepal)',
      'Advanced Pranayama & Mindfulness Guide',
    ],
    specialties: {
      vi: ['Yoga Vinyasa Bình minh Năng lượng', 'Yin Yoga Phục hồi Thân tâm', 'Chuông xoay Tây Tạng & Thiền định', 'Giải phóng Khớp Hông & Lưng'],
      en: ['Sunrise Vinyasa Flow', 'Deep Restorative Yin Yoga', 'Tibetan Sound Bath & Meditation', 'Hip Mobility & Spine Decompression'],
    },
    phone: '0938 123 789',
    email: 'noah@fitpulse.com',
    quote: {
      vi: '"Yoga không phải là chạm vào ngón chân, mà là những gì bạn học được trên đường đi xuống."',
      en: '"Yoga is not about touching your toes, it is about what you learn on the journey on the way down."',
    },
  },
  'Alex Morgan': {
    name: 'Alex Morgan',
    avatar: 'AM',
    avatarColor: 'linear-gradient(135deg, #059669, #10b981)',
    title: {
      vi: 'Chuyên gia Huấn luyện Sức mạnh Chức năng & Thể lực HIIT',
      en: 'Head Strength, Conditioning & Functional Performance Coach',
    },
    experience: {
      vi: '7+ năm huấn luyện vận động viên thể thao & Hội viên cao cấp',
      en: '7+ years coaching competitive athletes & executive trainees',
    },
    rating: 4.95,
    reviewCount: 172,
    teachingHours: '1,680+ giờ',
    bio: {
      vi: 'Alex Morgan sở hữu chứng chỉ quốc tế CSCS (Certified Strength and Conditioning Specialist) từ Hiệp hội Sức mạnh Quốc gia Hoa Kỳ (NSCA). Với nền tảng khoa học vận động cơ sinh học, Alex thiết kế các bài tập kháng lực compound, cử tạ kỹ thuật và mạch HIIT cường độ cao giúp tối ưu hóa hệ trao đổi chất, tăng mật độ cơ bắp nạc và nâng cao chỉ số thể lực toàn diện một cách an toàn.',
      en: 'Alex Morgan holds the gold-standard NSCA-CSCS credential with an academic foundation in biomechanics and athletic conditioning. Alex engineers progressive compound lifting programs and metabolic circuits that supercharge VO2 max, optimize fat oxidation, and forge functional strength.',
    },
    certifications: [
      'NSCA Certified Strength & Conditioning Specialist (CSCS)',
      'USA Weightlifting Level 2 Coach (USAW)',
      'EXOS Performance Specialist',
      'Precision Nutrition Level 1 Coach',
    ],
    specialties: {
      vi: ['Tập Gym Kháng lực & HIIT Chuyển hóa', 'Phát triển Cơ bắp Thân trên/Thân dưới', 'Cử tạ Sức mạnh & Đòn tạ Compound', 'Tăng tốc Chuyển hóa & Đốt mỡ'],
      en: ['Functional HIIT & Metabolic Conditioning', 'Upper/Lower Hypertrophy Mastery', 'Olympic Weightlifting & Compound Power', 'Metabolic Conditioning & Conditioning'],
    },
    phone: '0903 567 890',
    email: 'alex@fitpulse.com',
    quote: {
      vi: '"Kỷ luật và kỹ thuật chuẩn xác luôn đi trước mức tạ. Sức mạnh bền vững đến từ nền tảng vững vàng."',
      en: '"Discipline and biomechanical form always precede load. Sustainable strength is built from flawless fundamentals."',
    },
  },
  'Elena Rostova': {
    name: 'Elena Rostova',
    avatar: 'ER',
    avatarColor: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    title: {
      vi: 'Chuyên gia STOTT Pilates & Phục hồi Vận động Thể thao',
      en: 'Senior STOTT PILATES & Sports Rehabilitation Specialist',
    },
    experience: {
      vi: '6+ năm kinh nghiệm đào tạo Pilates chuyên sâu tại Châu Âu',
      en: '6+ years international Pilates & kinetic rehab instruction',
    },
    rating: 4.97,
    reviewCount: 139,
    teachingHours: '1,220+ giờ',
    bio: {
      vi: 'Elena Rostova được đào tạo bài bản theo trường phái STOTT PILATES quốc tế với chuyên môn phục hồi chấn thương cột sống và cân bằng cơ học vận động. Các lớp học của cô kết hợp kỹ thuật lò xo kháng lực tinh tế với các động tác kích hoạt cơ ổn định sâu, giúp giải phóng áp lực thắt lưng, định hình đường cong săn chắc và tối ưu hóa năng lượng cơ thể.',
      en: 'Elena Rostova is certified under the world-renowned STOTT PILATES curriculum, specializing in spinal rehabilitation and kinetic alignment. Her classes combine spring resistance mechanics with neuromuscular stabilizer activation to relieve postural compression and sculpt athletic tone.',
    },
    certifications: [
      'STOTT PILATES Full Certified Instructor',
      'Fascial Movement Foundation Specialist',
      'Spine & Joint Post-Rehab Conditioning',
      'Athletic Reformer Jumpboard Specialist',
    ],
    specialties: {
      vi: ['Pilates Nắn chỉnh Cột sống & Tư thế', 'Pilates Bàn nhảy Đốt mỡ Cardio', 'Kỹ thuật Cơ chế Máy Reformer', 'Siết cơ Thon gọn Điêu khắc'],
      en: ['Spine Alignment & Posture Rehab', 'Dynamic Jumpboard Cardio', 'Reformer Biomechanics & Form', 'Sculpt & Long-line Definition'],
    },
    phone: '0978 654 321',
    email: 'elena@fitpulse.com',
    quote: {
      vi: '"Chuyển động chính xác chữa lành cơ thể. Khi cơ lõi vững vàng, mọi bước đi đều trở nên thanh thoát."',
      en: '"Precise movement heals the body. When your core is centered, every step in life moves with effortless grace."',
    },
  },
  'Open access': {
    name: 'Sàn Gym Tự do',
    avatar: 'FP',
    avatarColor: 'linear-gradient(135deg, #10b981, #059669)',
    title: {
      vi: 'Đội ngũ Huấn luyện viên Trực sàn & Giám sát An toàn FitPulse',
      en: 'Fitness Floor Specialists & Safety Supervisory Team',
    },
    experience: {
      vi: 'Luôn túc trực 100% thời gian hoạt động của Studio',
      en: 'Stationed 100% of studio operating hours',
    },
    rating: 4.92,
    reviewCount: 345,
    teachingHours: 'Túc trực toàn thời gian',
    bio: {
      vi: 'Khu vực Sàn Gym Tự do FitPulse được đầu tư toàn bộ trang thiết bị Technogym và Eleiko tiêu chuẩn thi đấu Olympic. Đội ngũ Huấn luyện viên trực sàn luôn sẵn sàng hỗ trợ bạn hiệu chỉnh máy tập, hỗ trợ đỡ tạ an toàn (spotting) trong các hiệp tập nặng và tư vấn lộ trình tập luyện cá nhân hóa theo từng mục tiêu thể chất.',
      en: 'FitPulse Open Floor features elite Olympic-grade Technogym and Eleiko hardware. Dedicated floor coaching staff are stationed full-time to provide live machine setup, spotting support on heavy sets, and biometric-based workout recommendations.',
    },
    certifications: [
      'FitPulse Certified Floor Safety Standard',
      'First Aid & CPR/AED American Heart Association',
      'Olympic Barbell Spotting & Safety Protocol',
      'InBody 770 Biometric Body Composition Analyst',
    ],
    specialties: {
      vi: ['Hỗ trợ kỹ thuật động tác nâng tạ', 'Kiểm tra tư thế an toàn khi Squat/Deadlift', 'Tư vấn sử dụng máy theo mục tiêu', 'Đo chỉ số cơ thể InBody 770 miễn phí'],
      en: ['Barbell Spotting & Form Feedback', 'Squat & Deadlift Safety Checks', 'Machine Setup & Target Calibration', 'Complimentary InBody 770 Analysis'],
    },
    phone: '028 7300 8899',
    email: 'support@fitpulse.com',
    quote: {
      vi: '"Không gian tập luyện tự do đẳng cấp quốc tế. Chúng tôi đồng hành cùng sự an toàn và tiến bộ của bạn mỗi ngày."',
      en: '"World-class open training environment. We stand by your safety and progress every single rep."',
    },
  },
}

export function getClassDetails(session: Session, isVi: boolean) {
  const isPilates = session.discipline === 'Pilates'
  const isYoga = session.discipline === 'Yoga'

  let level = isVi ? 'Tất cả cấp độ' : 'All Levels'
  let intensity = isVi ? 'Cường độ: Vừa - Cao' : 'Intensity: Moderate - High'
  let calories = '380 - 520 kcal'

  if (session.title.includes('Foundations') || session.title.includes('Căn bản') || session.title.includes('Intro')) {
    level = isVi ? 'Căn bản & Nhập môn' : 'Beginner & Foundations'
    intensity = isVi ? 'Cường độ: Vừa phải' : 'Intensity: Moderate'
    calories = '280 - 400 kcal'
  } else if (session.title.includes('Athletic') || session.title.includes('Burn') || session.title.includes('HIIT') || session.title.includes('Powerlifting')) {
    level = isVi ? 'Trung cấp & Nâng cao' : 'Intermediate & Advanced'
    intensity = isVi ? 'Cường độ: Rất cao' : 'Intensity: High'
    calories = '450 - 650 kcal'
  } else if (session.title.includes('Yin') || session.title.includes('Rest') || session.title.includes('Sound Bath') || session.title.includes('Gentle')) {
    level = isVi ? 'Thư giãn & Phục hồi' : 'Restorative & Deep Calm'
    intensity = isVi ? 'Cường độ: Nhẹ nhàng' : 'Intensity: Gentle'
    calories = '180 - 260 kcal'
  }

  const objectives = isPilates
    ? [
        {
          title: isVi ? 'Kích hoạt sâu chuỗi cơ lõi (Deep Core)' : 'Deep Core Activation',
          desc: isVi ? 'Siết cơ bụng ngang, cơ sàn chậu và cơ dựng sống thông qua hệ thống lò xo kháng lực biến thiên.' : 'Engage transverse abdominis, pelvic floor, and multifidus with progressive spring tension.',
        },
        {
          title: isVi ? 'Nắn chỉnh cột sống & giải tỏa áp lực đĩa đệm' : 'Spinal Decompression & Posture Realignment',
          desc: isVi ? 'Giải tỏa áp lực lên đĩa đệm đốt sống, định hình trục xương thẳng tự nhiên và kéo dài các nhóm cơ co rút.' : 'Decompress spinal discs, restore neutral alignment, and elongate tight muscle groups.',
        },
        {
          title: isVi ? 'Tăng sức bền dẻo dai và điêu khắc cơ thon dài' : 'Long-line Muscular Endurance & Tone',
          desc: isVi ? 'Điêu khắc vóc dáng thon gọn, săn chắc mà không làm thô cơ bắp nhờ chuyển động kiểm soát cao.' : 'Sculpt lean, elongated muscle tone without bulk through high-precision eccentric control.',
        },
      ]
    : isYoga
    ? [
        {
          title: isVi ? 'Hòa nhịp hơi thở Pranayama & Chuyển động Asana' : 'Breath & Asana Synchronization',
          desc: isVi ? 'Đồng bộ từng nhịp thở sâu với các chuỗi tư thế chuyển tiếp mượt mà, lưu thông kinh lạc và khí huyết.' : 'Synchronize Pranayama breathwork with fluid transitions to elevate circulation and vitality.',
        },
        {
          title: isVi ? 'Mở rộng biên độ vận động khớp & Giải phóng hông' : 'Joint Mobility & Hip Decompression',
          desc: isVi ? 'Tăng độ dẻo dai của khớp hông, gân kheo và cột sống, giải phóng các điểm căng cứng thần kinh.' : 'Expand hip, hamstring, and thoracic range of motion while clearing somatic tension.',
        },
        {
          title: isVi ? 'Tĩnh tâm sâu & Phục hồi hệ thần kinh thực vật' : 'Neural Calming & Parasympathetic Reset',
          desc: isVi ? 'Hạ mức cortisol gây căng thẳng, kích hoạt hệ thần kinh phó giao cảm giúp ngủ ngon và tái tạo năng lượng.' : 'Downregulate sympathetic stress, lower cortisol, and trigger restorative autonomic recovery.',
        },
      ]
    : [
        {
          title: isVi ? 'Tối ưu chỉ số trao đổi chất & Hiệu ứng đốt mỡ EPOC' : 'Metabolic Conditioning & EPOC',
          desc: isVi ? 'Tăng hiệu ứng đốt năng lượng sau tập luyện (Afterburn) kéo dài nhiều giờ sau khi kết thúc buổi tập.' : 'Maximize excess post-exercise oxygen consumption (EPOC) to elevate caloric expenditure.',
        },
        {
          title: isVi ? 'Phát triển sức mạnh chức năng đa khớp (Compound)' : 'Functional Multi-joint Strength',
          desc: isVi ? 'Tập trung vào các chuyển động tự nhiên: Squat, Hinge, Push, Pull giúp cơ thể khỏe mạnh toàn diện.' : 'Master foundational multi-joint patterns: Squat, Hinge, Push, Pull for athletic vigor.',
        },
        {
          title: isVi ? 'Cải thiện sức bền tim mạch & Chỉ số VO2 Max' : 'Cardiovascular Endurance & VO2 Max',
          desc: isVi ? 'Nâng cao ngưỡng chịu đựng tim phổi, củng cố mật độ xương và bảo vệ các khớp xương vận động.' : 'Boost cardiac output, expand aerobic threshold, and fortify joint connective tissues.',
        },
      ]

  const syllabus = isPilates
    ? [
        {
          time: '00:00 - 00:10',
          title: isVi ? 'Khởi động khớp & Kích hoạt hơi thở cơ hoành' : 'Joint Prep & Diaphragmatic Breath',
          desc: isVi ? 'Thiết lập khung chậu trung tính trên thảm máy, hít thở sườn bên và kích hoạt nhóm cơ ổn định sâu.' : 'Establish neutral spine alignment on the carriage, lateral ribcage breathing, and pelvic floor activation.',
        },
        {
          time: '00:10 - 00:30',
          title: isVi ? 'Chuỗi bài tập Footwork & Kháng lực dây đai' : 'Footwork Progression & Straps Series',
          desc: isVi ? 'Bài tập chân trên thanh Footbar với các mức lò xo khác nhau; chuyển tiếp sang bài tập cánh tay và cơ lõi.' : 'Progressive footwork series followed by supine arm and core stability exercises using reformer straps.',
        },
        {
          time: '00:30 - 00:42',
          title: isVi ? 'Đỉnh cao chuyển động: Khối cơ lõi & Thăng bằng' : 'Peak Movement: Core Elevation & Balance',
          desc: isVi ? 'Các động tác plank trên bệ di động, động tác Short Box hoặc bài tập bàn nhảy Jumpboard cường độ cao.' : 'Challenging dynamic planks on the carriage, Short Box abdominal series, or rhythmic jumpboard intervals.',
        },
        {
          time: '00:42 - 00:50',
          title: isVi ? 'Giãn cơ sâu & Phục hồi giải phóng cơ mạc' : 'Deep Stretch & Myofascial Release',
          desc: isVi ? 'Kéo giãn gân kheo, cơ gập hông (hip flexors) và thả lỏng cột sống kết thúc buổi tập nhẹ nhõm.' : 'Full spinal articulation, deep hip flexor opening, and calming recovery on the reformer frame.',
        },
      ]
    : isYoga
    ? [
        {
          time: '00:00 - 00:12',
          title: isVi ? 'Thiền tĩnh tâm & Khí công Pranayama' : 'Centering & Pranayama Breathwork',
          desc: isVi ? 'Ngồi tĩnh lặng, quan sát dòng chảy hơi thở và làm nóng các khớp cổ, vai, hông nhẹ nhàng.' : 'Seated grounding meditation, Ujjayi breathing, and gentle spinal mobilizing stretches.',
        },
        {
          time: '00:12 - 00:35',
          title: isVi ? 'Chào mặt trời & Dòng chảy tư thế Surya Namaskar' : 'Sun Salutations & Dynamic Asana Flow',
          desc: isVi ? 'Liên kết nhịp nhàng chuỗi tư thế Chiến binh (Warrior), Thăng bằng tam giác và mở rộng lồng ngực.' : 'Continuous breath-synchronized Surya Namaskar flows, Warrior variations, and expansive chest openers.',
        },
        {
          time: '00:35 - 00:50',
          title: isVi ? 'Tư thế đỉnh cao & Uốn lưng mở tim an toàn' : 'Peak Pose & Heart-Opening Inversions',
          desc: isVi ? 'Khám phá thế chim bồ câu (Pigeon), thế cây cầu hoặc các biến thể giữ thăng bằng cánh tay an toàn.' : 'Deep hip opening in Pigeon pose, gentle camel/bridge variations with supportive alignment cues.',
        },
        {
          time: '00:50 - 01:00',
          title: isVi ? 'Savasana buông thư & Tần số chuông xoay Tây Tạng' : 'Savasana Rest & Tibetan Sound Bath',
          desc: isVi ? 'Nằm thư giãn hoàn toàn trong sóng âm thanh êm dịu của chuông xoay giúp phục hồi sâu toàn bộ tế bào.' : 'Complete stillness in corpse pose bathed in melodic Tibetan sound frequencies for restorative calm.',
        },
      ]
    : [
        {
          time: '00:00 - 00:08',
          title: isVi ? 'Khởi động động lực học & Kích hoạt hệ thần kinh' : 'Dynamic Movement Prep & Neural Primer',
          desc: isVi ? 'Làm nóng khớp, kích hoạt nhóm cơ mông, đùi và bả vai với dây chun mini-band và con lăn bọt.' : 'Foam rolling, mobility flow, and glute/shoulder activation with mini-bands to prepare joints.',
        },
        {
          time: '00:08 - 00:25',
          title: isVi ? 'Khối bài tập sức mạnh Compound trọng tâm' : 'Primary Compound Strength Block',
          desc: isVi ? 'Thực hiện các động tác tạ phức hợp (Deadlift/Squat/Bench Press) dưới sự giám sát kỹ thuật sát sao.' : 'Execute multi-joint compound barbell lifts under strict biomechanical supervision and tempo coaching.',
        },
        {
          time: '00:25 - 00:38',
          title: isVi ? 'Vòng lặp chức năng HIIT & Kỹ thuật bổ trợ' : 'Functional Circuit & Metabolic Finisher',
          desc: isVi ? 'Các hiệp tập xoay vòng tốc độ cao với tạ chuông Kettlebell, bóng tạ Slam Ball và máy chèo thuyền Concept2.' : 'High-energy supersets with kettlebells, slam balls, and Concept2 ergometers for metabolic boost.',
        },
        {
          time: '00:38 - 00:45',
          title: isVi ? 'Hạ nhịp tim & Phục hồi cơ bắp' : 'Cool Down & Downregulation Breathing',
          desc: isVi ? 'Kéo giãn cơ bắp tĩnh, hít thở sâu phục hồi nhịp tim về trạng thái bình thường và ghi nhận kết quả.' : 'Static stretching of targeted muscle groups and parasympathetic breathing reset.',
        },
      ]

  const equipment = isPilates
    ? [
        { label: isVi ? 'Máy Reformer Balanced Body Allegro 2 thế hệ mới' : 'Balanced Body Allegro 2 Reformer' },
        { label: isVi ? 'Bàn nhảy Jumpboard, hộp đệm Box & vòng Pilates chuyên dụng' : 'Padded Jumpboard, Sitting Box & Magic Circle' },
        { label: isVi ? 'Khăn lạnh vô trùng & Nước điện giải ion kiềm FitPulse miễn phí' : 'Complimentary Sterile Chilled Towels & Alkaline Electrolytes' },
        { label: isVi ? 'Phòng tập nhiệt độ chuẩn 22-24°C với lọc khí HEPA áp suất dương' : 'Climate Controlled Studio (22-24°C) with Positive-Pressure HEPA Filtration' },
      ]
    : isYoga
    ? [
        { label: isVi ? 'Thảm tập cao su thiên nhiên Lululemon 6mm kháng khuẩn' : 'Premium 6mm Natural Rubber Lululemon Mats' },
        { label: isVi ? 'Bộ gạch tập cork, dây đai dệt cotton & gối ôm yoga bolster' : 'Natural Cork Blocks, Organic Cotton Straps & Yoga Bolsters' },
        { label: isVi ? 'Chuông xoay Tây Tạng Kathmandu thủ công & tinh dầu trầm hương' : 'Handcrafted Kathmandu Tibetan Singing Bowls & Sandalwood Diffusers' },
        { label: isVi ? 'Hệ thống âm thanh đa vùng Genelec tái hiện tần số 432Hz chữa lành' : 'Genelec Multi-zone Acoustic System Tuned to 432Hz Healing Frequency' },
      ]
    : [
        { label: isVi ? 'Hệ thống máy kháng lực thông minh Technogym BioStrength' : 'Technogym BioStrength Connected Resistance Fleet' },
        { label: isVi ? 'Thanh đòn và bánh tạ chuẩn thi đấu Olympic Eleiko Thụy Điển' : 'Eleiko Swedish Competition Barbells & Bumper Plates' },
        { label: isVi ? 'Thiết bị đo chỉ số InBody 770 y khoa & Đai đo nhịp tim thông minh' : 'Clinical InBody 770 Biometric Scanner & Heart Rate Monitoring' },
        { label: isVi ? 'Khu vực phục hồi giãn cơ chuyên biệt với súng massage Theragun' : 'Dedicated Recovery Zone Equipped with Theragun Pro Devices' },
      ]

  const guidelines = [
    {
      title: isVi ? 'Thời gian có mặt' : 'Arrival Time',
      desc: isVi ? 'Vui lòng có mặt trước giờ bắt đầu lớp học 10-15 phút để làm thủ tục check-in, chuẩn bị trang phục và nhận chỗ tập tốt nhất.' : 'Please arrive 10-15 minutes prior to class start to check in, stow belongings, and secure your station.',
    },
    {
      title: isVi ? 'Quy định trang phục' : 'Attire Policy',
      desc: isPilates
        ? (isVi ? 'Trang phục tập luyện ôm sát cơ thể co giãn thoải mái. Bắt buộc mang vớ chống trượt (grip socks) khi sử dụng máy Reformer.' : 'Form-fitting flexible activewear. Grip socks are mandatory for all Reformer sessions.')
        : (isVi ? 'Trang phục thể thao co giãn thoáng khí, giày tập thể thao sạch đế bằng (đối với lớp Gym) hoặc chân trần (đối với Yoga).' : 'Breathable athletic activewear. Clean flat-soled sneakers (Gym) or bare feet (Yoga).'),
    },
    {
      title: isVi ? 'Tình trạng sức khỏe' : 'Health & Pre-existing Conditions',
      desc: isVi ? 'Nếu bạn đang có chấn thương, tiền sử bệnh cột sống hoặc phụ nữ đang mang thai, vui lòng thông báo cho Huấn luyện viên trước buổi học.' : 'If you are recovering from injury, have spinal restrictions, or are pregnant, please notify the instructor prior to class.',
    },
    {
      title: isVi ? 'Chính sách bảo lưu tín chỉ' : 'Cancellation & Credit Policy',
      desc: isVi ? 'Hội viên có thể hủy ca tập miễn phí trước giờ bắt đầu tối thiểu 2 tiếng. Tín chỉ lượt tập sẽ được tự động hoàn lại ngay lập tức.' : 'Cancellations made at least 2 hours before class are 100% credit-refundable and returned instantly.',
    },
  ]

  return { level, intensity, calories, objectives, syllabus, equipment, guidelines }
}

function ClassDetailView({
  session,
  sessions,
  bookedSessions,
  creditsLeft,
  isVi,
  onBack,
  onSelect,
  onJoinWaitlist,
  onCancelBooking,
  onLeaveWaitlist,
  showToast,
}: {
  session: Session
  sessions: Session[]
  bookedSessions: BookedSession[]
  creditsLeft: number
  isVi: boolean
  onBack: () => void
  onSelect: (s: Session) => void
  onJoinWaitlist: (s: Session) => void
  onCancelBooking: (bookedId: number, sessionId: number, title: string) => void
  onLeaveWaitlist: (bookedId: number, title: string) => void
  showToast: (msg: string) => void
}) {
  const liveSession = sessions.find(s => s.id === session.id) || session
  const bookedItem = bookedSessions.find(b => b.sessionId === liveSession.id && (b.status === 'confirmed' || b.status === 'waitlist'))
  const isBooked = bookedItem?.status === 'confirmed'
  const isWaitlisted = bookedItem?.status === 'waitlist'
  const spotsLeft = liveSession.capacity - liveSession.booked
  const isFull = spotsLeft <= 0

  const instructorName = liveSession.instructor
  const instructor = INSTRUCTOR_PROFILES[instructorName] || INSTRUCTOR_PROFILES['Maya Chen']
  const classDetails = getClassDetails(liveSession, isVi)
  const sessionTitle = getSessionTitle(liveSession, isVi)

  return (
    <div className="class-detail-page">
      {/* Top Navigation */}
      <div className="class-detail-nav">
        <button className="button button-ghost" onClick={onBack}>
          <ArrowLeft style={{ width: 15, height: 15 }} />
          <span>{isVi ? 'Quay lại Lịch tập Studio' : 'Back to Studio Schedule'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isBooked ? (
            <button
              type="button"
              className="button button-booked-action"
              onClick={() => onCancelBooking(bookedItem.id, liveSession.id, sessionTitle)}
            >
              <span className="btn-label-normal">{isVi ? 'Đã xác nhận đặt chỗ' : 'Confirmed Booking'}</span>
              <span className="btn-label-hover"><X style={{ width: 12, height: 12 }} /> {isVi ? 'Hủy ca tập này' : 'Cancel Booking'}</span>
            </button>
          ) : isWaitlisted ? (
            <button
              type="button"
              className="button button-waitlisted-action"
              onClick={() => onLeaveWaitlist(bookedItem.id, sessionTitle)}
            >
              <span className="btn-label-normal">{isVi ? 'Đang trong hàng chờ #1' : 'Waitlisted #1'}</span>
              <span className="btn-label-hover"><X style={{ width: 12, height: 12 }} /> {isVi ? 'Rời hàng chờ' : 'Leave Waitlist'}</span>
            </button>
          ) : isFull ? (
            <button
              className="button button-waitlist"
              onClick={() => onJoinWaitlist(liveSession)}
            >
              <ArrowUpRight style={{ width: 14, height: 14 }} />
              <span>{isVi ? 'Đăng ký vào hàng chờ' : 'Join Waitlist Queue'}</span>
            </button>
          ) : (
            <button
              className="button button-primary"
              onClick={() => onSelect(liveSession)}
            >
              <Zap style={{ width: 14, height: 14 }} />
              <span>{isVi ? 'Đặt ca học này ngay' : 'Book This Class'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Page Header */}
      <PageHeader
        eyebrow={isVi ? `CHI TIẾT LỚP HỌC · ${liveSession.discipline.toUpperCase()} STUDIO` : `CLASS DETAIL · ${liveSession.discipline.toUpperCase()} STUDIO`}
        title={sessionTitle}
        description={
          isVi
            ? `Lớp học chuyên sâu thiết kế theo giáo trình chuẩn quốc tế, trang bị máy tập cao cấp và điều phối bởi Huấn luyện viên ${formatInstructor(liveSession.instructor, isVi)}.`
            : `Comprehensive studio class engineered with world-class curriculum, elite hardware, led by Coach ${formatInstructor(liveSession.instructor, false)}.`
        }
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip tone={liveSession.color as any}>{liveSession.discipline}</Chip>
            {isBooked && <Chip tone="green">{isVi ? 'Bạn đã đặt' : 'Booked'}</Chip>}
            {isWaitlisted && <Chip tone="amber">{isVi ? 'Hàng chờ #1' : 'Waitlist #1'}</Chip>}
            {isFull && !isBooked && !isWaitlisted && <Chip tone="red">{isVi ? 'Đã đủ chỗ' : 'Class Full'}</Chip>}
            {!isFull && !isBooked && !isWaitlisted && (
              <Chip tone="green">
                <span className="pulse-dot" /> {spotsLeft} {isVi ? 'chỗ còn trống' : 'spots available'}
              </Chip>
            )}
          </div>
        }
      />

      {/* Quick Stats Ribbon */}
      <div className="class-quick-stats">
        <div className="class-stat-card">
          <div className="class-stat-header">
            <Clock3 />
            <span>{isVi ? 'Khung giờ & Thời lượng' : 'Time & Duration'}</span>
          </div>
          <div className="class-stat-value">{liveSession.time} · {formatDuration(liveSession.duration, isVi)}</div>
          <div className="class-stat-sub">
            {liveSession.date ? `${formatDay(liveSession.day, isVi)}, ${liveSession.date}` : formatDay(liveSession.day, isVi)}
          </div>
        </div>

        <div className="class-stat-card">
          <div className="class-stat-header">
            <MapPin />
            <span>{isVi ? 'Phòng tập & Không gian' : 'Studio Room'}</span>
          </div>
          <div className="class-stat-value">{formatRoom(liveSession.room, isVi)}</div>
          <div className="class-stat-sub">
            {isVi ? 'Hệ thống khí sạch HEPA & Âm học 432Hz' : 'HEPA Clean Air & 432Hz Acoustics'}
          </div>
        </div>

        <div className="class-stat-card">
          <div className="class-stat-header">
            <Users />
            <span>{isVi ? 'Huấn luyện viên phụ trách' : 'Lead Instructor'}</span>
          </div>
          <div className="class-stat-value">{formatInstructor(liveSession.instructor, isVi)}</div>
          <div className="class-stat-sub">
            {isVi ? instructor.title.vi : instructor.title.en}
          </div>
        </div>

        <div className="class-stat-card">
          <div className="class-stat-header">
            <Target />
            <span>{isVi ? 'Sĩ số & Chỗ trống' : 'Roster Capacity'}</span>
          </div>
          <div className="class-stat-value">{liveSession.booked} / {liveSession.capacity} {isVi ? 'học viên' : 'trainees'}</div>
          <div className="class-stat-sub">
            {isFull ? (isVi ? 'Lớp đã đủ người' : 'Class at capacity') : (isVi ? `Còn ${spotsLeft} chỗ đặt ngay` : `${spotsLeft} open spots`)}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="profile-grid-layout">
        {/* Left Column: Syllabus & Facilities */}
        <div>
          {/* Card 1: Overview & Physical Target */}
          <div className="detail-card">
            <div className="section-heading" style={{ marginBottom: 16 }}>
              <div>
                <h2>{isVi ? 'Mục tiêu thể chất & Lợi ích vận động' : 'Physical Objectives & Benefits'}</h2>
                <p>{isVi ? 'Định hình vóc dáng, tối ưu chuyển hóa năng lượng và cải thiện cơ sinh học' : 'Body contouring, metabolic optimization, and kinetic alignment'}</p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Chip tone="violet">{classDetails.level}</Chip>
                <Chip tone="amber">{classDetails.intensity}</Chip>
                <Chip tone="green">{classDetails.calories}</Chip>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {classDetails.objectives.map((obj, i) => (
                <div key={i} className="perk-item" style={{ alignItems: 'flex-start', padding: '12px 14px' }}>
                  <CircleCheck style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: 12, color: 'var(--text)', marginBottom: 2 }}>{obj.title}</strong>
                    <span style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.45, fontWeight: 400 }}>{obj.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Syllabus Timeline */}
          <div className="detail-card">
            <div className="section-heading" style={{ marginBottom: 14 }}>
              <div>
                <h2>{isVi ? 'Khung tiến trình buổi học (Syllabus)' : 'Class Flow & Syllabus'}</h2>
                <p>{isVi ? 'Các giai đoạn bài tập được thiết kế khoa học từng phút' : 'Scientifically sequenced phases engineered for maximum progression'}</p>
              </div>
            </div>

            <div className="session-timeline">
              {classDetails.syllabus.map((step, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-time-badge">{step.time}</div>
                  <div className="timeline-content">
                    <strong>{step.title}</strong>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Equipment & Studio Amenities */}
          <div className="detail-card">
            <div className="section-heading" style={{ marginBottom: 14 }}>
              <div>
                <h2>{isVi ? 'Trang thiết bị & Tiện ích tiêu chuẩn' : 'Equipment & Studio Amenities'}</h2>
                <p>{isVi ? 'Được trang bị hoàn toàn miễn phí cho Hội viên trong suốt buổi học' : 'Complimentary elite studio amenities provided throughout your session'}</p>
              </div>
            </div>

            <div className="perks-grid">
              {classDetails.equipment.map((eq, idx) => (
                <div key={idx} className="perk-item">
                  <Check style={{ color: 'var(--teal)', width: 14, height: 14, flexShrink: 0 }} />
                  <span>{eq.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Trainee Preparation Guidelines */}
          <div className="detail-card">
            <div className="section-heading" style={{ marginBottom: 14 }}>
              <div>
                <h2>{isVi ? 'Hướng dẫn chuẩn bị cho Hội viên' : 'Preparation Guidelines'}</h2>
                <p>{isVi ? 'Lưu ý cần thiết để có trải nghiệm luyện tập an toàn và trọn vẹn nhất' : 'Key recommendations for an optimal, safe, and comfortable session'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {classDetails.guidelines.map((rule, idx) => (
                <div key={idx} style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)' }}>
                  <strong style={{ fontSize: 11, color: 'var(--text)', display: 'block', marginBottom: 2 }}>{rule.title}</strong>
                  <span style={{ fontSize: 10.5, color: 'var(--muted)', lineHeight: 1.45 }}>{rule.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Instructor Dossier & Pass Status */}
        <div>
          {/* Card 1: Lead Instructor Dossier */}
          <div className="instructor-dossier-card" style={{ marginBottom: 22 }}>
            <div className="instructor-dossier-top">
              <div className="instructor-dossier-avatar" style={{ background: instructor.avatarColor }}>
                {instructor.avatar}
              </div>
              <div className="instructor-dossier-info">
                <h3>{formatInstructor(instructor.name, isVi)}</h3>
                <p>{isVi ? instructor.title.vi : instructor.title.en}</p>
                <div style={{ marginTop: 4 }}>
                  <Chip tone="green">
                    <ShieldCheck style={{ width: 11, height: 11 }} />
                    <span>{isVi ? 'Đã kiểm duyệt chuyên môn' : 'Verified Instructor'}</span>
                  </Chip>
                </div>
              </div>
            </div>

            {/* Rating & Teaching Stats */}
            <div className="instructor-rating-row">
              <div className="instructor-rating-item">
                <Star />
                <span>{instructor.rating} / 5.0</span>
              </div>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>·</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                {instructor.reviewCount} {isVi ? 'đánh giá hội viên' : 'reviews'}
              </span>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>·</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                {instructor.teachingHours}
              </span>
            </div>

            {/* Bio */}
            <div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                {isVi ? 'Tiểu sử & Phong cách giảng dạy' : 'Biography & Teaching Philosophy'}
              </span>
              <p style={{ fontSize: 11.5, color: 'var(--text)', lineHeight: 1.55, margin: 0 }}>
                {isVi ? instructor.bio.vi : instructor.bio.en}
              </p>
            </div>

            {/* Quote */}
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(198, 243, 107, 0.05)', border: '1px solid rgba(198, 243, 107, 0.2)', fontStyle: 'italic', fontSize: 11, color: 'var(--text)' }}>
              {isVi ? instructor.quote.vi : instructor.quote.en}
            </div>

            {/* Certifications */}
            <div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                {isVi ? 'Chứng chỉ & Bằng cấp quốc tế' : 'Accreditations & Certifications'}
              </span>
              <div className="instructor-tags-wrap">
                {instructor.certifications.map((cert, i) => (
                  <span key={i} className="instructor-tag">
                    <Award style={{ width: 11, height: 11, color: 'var(--teal)', display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                {isVi ? 'Lĩnh vực chuyên sâu' : 'Core Disciplines & Specialties'}
              </span>
              <div className="instructor-tags-wrap">
                {(isVi ? instructor.specialties.vi : instructor.specialties.en).map((spec, i) => (
                  <span key={i} className="instructor-tag" style={{ color: 'var(--text)', fontWeight: 500 }}>
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--muted)' }}>
                <Mail style={{ width: 13, height: 13 }} />
                <span>{instructor.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--muted)' }}>
                <Phone style={{ width: 13, height: 13 }} />
                <span>{instructor.phone}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Pass Status & Quick Action */}
          <div className="detail-card">
            <div className="section-heading" style={{ marginBottom: 14 }}>
              <div>
                <h2>{isVi ? 'Tài khoản & Thao tác đặt ca' : 'Your Pass & Booking Action'}</h2>
                <p>{isVi ? 'Trừ 1 tín chỉ cho mỗi lần đặt chỗ chính thức' : 'Deducts 1 session credit per confirmed booking'}</p>
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{isVi ? 'Số buổi tập khả dụng' : 'Available Credits'}</span>
                <strong style={{ fontSize: 14, color: 'var(--lime)' }}>{creditsLeft} / 10 {isVi ? 'buổi' : 'credits'}</strong>
              </div>
              <div className="progress">
                <i style={{ width: `${(creditsLeft / 10) * 100}%` }} />
              </div>
            </div>

            {isBooked ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--teal)', fontSize: 11, fontWeight: 600 }}>
                  <CircleCheck style={{ width: 15, height: 15 }} />
                  <span>{isVi ? 'Bạn đã có chỗ chắc chắn trong lớp học này!' : 'You have a confirmed spot in this class!'}</span>
                </div>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => onCancelBooking(bookedItem.id, liveSession.id, sessionTitle)}
                  style={{ width: '100%', justifyContent: 'center', color: '#f18c88' }}
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
                  <span>{isVi ? 'Hủy đặt chỗ (Hoàn 1 tín chỉ)' : 'Cancel Booking (+1 Credit Refund)'}</span>
                </button>
              </div>
            ) : isWaitlisted ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--amber)', fontSize: 11, fontWeight: 600 }}>
                  <Clock3 style={{ width: 15, height: 15 }} />
                  <span>{isVi ? 'Bạn đang ở vị trí #1 danh sách chờ!' : 'You are #1 on the waiting list!'}</span>
                </div>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => onLeaveWaitlist(bookedItem.id, sessionTitle)}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <X style={{ width: 14, height: 14 }} />
                  <span>{isVi ? 'Rời hàng chờ' : 'Leave Waitlist'}</span>
                </button>
              </div>
            ) : isFull ? (
              <button
                className="button button-waitlist"
                onClick={() => onJoinWaitlist(liveSession)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <ArrowUpRight style={{ width: 14, height: 14 }} />
                <span>{isVi ? 'Tham gia hàng chờ (Tự động vào khi có người hủy)' : 'Join Waitlist (Auto-enrolls on cancel)'}</span>
              </button>
            ) : (
              <button
                className="button button-primary"
                onClick={() => onSelect(liveSession)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Zap style={{ width: 14, height: 14 }} />
                <span>{isVi ? 'Xác nhận đặt chỗ (1 tín chỉ)' : 'Confirm Booking (1 Credit)'}</span>
              </button>
            )}

            <div style={{ marginTop: 14, fontSize: 10, color: 'var(--muted)', lineHeight: 1.4, textAlign: 'center' }}>
              {isVi ? '✓ Miễn phí hủy ca trước 2 tiếng · Hoàn trả 100% tín chỉ ngay lập tức' : '✓ Free cancellation up to 2h prior · 100% instant credit refund'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   INSTRUCTOR VIEW
   ========================================================================== */
export const DEFAULT_COACH_BIO = {
  vi: 'Hơn 10 năm kinh nghiệm trong ngành chuyển động cơ thể và hồi phục chức năng. Chú trọng tính chính xác của trục cột sống, kiểm soát hơi thở cơ hoành và tối ưu hóa sức mạnh cơ lõi (Core Control). Kết hợp kỷ luật của Pilates Reformer cổ điển và sự dẻo dai của Yoga hiện đại.',
  en: 'Over 10 years of professional experience in functional movement and physical rehabilitation. Emphasizes spinal alignment, diaphragmatic breathwork, and core stability. Combines the discipline of classical Pilates Reformer with dynamic modern Yoga flexibility.',
}

export const DAY_LABELS_FULL_VI: Record<string, string> = {
  Mon: 'Thứ Hai',
  Tue: 'Thứ Ba',
  Wed: 'Thứ Tư',
  Thu: 'Thứ Năm',
  Fri: 'Thứ Sáu',
  Sat: 'Thứ Bảy',
  Sun: 'Chủ Nhật',
}

export const DAY_LABELS_FULL_EN: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
}

const POOL_OF_STUDENTS = [
  { name: 'Jordan Davis', initials: 'JD', avatarClass: 'avatar-lime' },
  { name: 'Sofia Patel', initials: 'SP', avatarClass: 'avatar-1' },
  { name: 'Marcus Lee', initials: 'ML', avatarClass: 'avatar-2' },
  { name: 'Emma Wilson', initials: 'EW', avatarClass: 'avatar-3' },
  { name: 'Liam Nguyen', initials: 'LN', avatarClass: 'avatar-lime' },
  { name: 'Chloe Taylor', initials: 'CT', avatarClass: 'avatar-2' },
  { name: 'Ethan Chen', initials: 'EC', avatarClass: 'avatar-1' },
  { name: 'Ava Rossi', initials: 'AR', avatarClass: 'avatar-3' },
]

function InstructorView({
  sessions,
  bookedSessions = [],
  showToast,
  user,
  isVi,
  onGoToProfile,
}: {
  sessions: Session[]
  bookedSessions?: BookedSession[]
  showToast: (m: string) => void
  user: User
  isVi: boolean
  onGoToProfile?: () => void
}) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const [weekOffset, setWeekOffset] = useState(0)
  const [activeDay, setActiveDay] = useState(getTodayDayKey)
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [checkedMap, setCheckedMap] = useState<Record<number, number[]>>({ 1: [1, 2], 4: [1] })
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [classNotes, setClassNotes] = useState<Record<number, { vi: string; en: string } | string>>({
    1: {
      vi: 'Lưu ý học viên Jordan Davis cần điều chỉnh lò xo nhẹ hơn do căng cơ.',
      en: 'Jordan Davis needs lighter spring setting due to muscle tension.',
    },
  })
  const [noteInput, setNoteInput] = useState('')

  const getNoteText = (classId: number) => {
    const val = classNotes[classId]
    if (!val) return ''
    if (typeof val === 'string') return val
    return isVi ? val.vi : val.en
  }

  // 1. Classes for this instructor on the chosen day, strictly sorted chronologically
  const dayClasses = useMemo(() => {
    return sessions
      .filter(s => (s.instructor === user.name || (user.name === 'Maya Chen' && s.instructor === 'Maya Chen')) && s.day === activeDay)
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [sessions, user.name, activeDay])

  // Active selected class (fallback to first class of the day if none selected)
  const activeClass = dayClasses.find(s => s.id === selectedClassId) || dayClasses[0] || null

  // Total daily statistics
  const totalParticipants = useMemo(() => {
    return dayClasses.reduce((sum, s) => sum + s.booked, 0)
  }, [dayClasses])

  // Next up class calculation
  const nextClass = dayClasses.length > 0 ? dayClasses[0] : null

  // 2. Generate dynamic roster for the selected class matching booked count
  const classRoster = useMemo(() => {
    if (!activeClass) return []

    const rosterList: { id: number; name: string; initials: string; avatarClass: string; time: string }[] = []

    // If Jordan Davis booked this session, put them first
    const memberBooked = bookedSessions.some(b => b.sessionId === activeClass.id && b.status === 'confirmed')
    if (memberBooked) {
      rosterList.push({
        id: 1,
        name: 'Jordan Davis',
        initials: 'JD',
        avatarClass: 'avatar-lime',
        time: isVi ? 'Hôm qua, 18:42' : 'Yesterday, 18:42',
      })
    }

    // Fill with pool students up to activeClass.booked
    let poolIndex = memberBooked ? 1 : 0
    let studentIdCounter = memberBooked ? 2 : 1
    const times = [
      isVi ? 'Hôm qua, 17:08' : 'Yesterday, 17:08',
      isVi ? 'Hôm qua, 16:54' : 'Yesterday, 16:54',
      isVi ? 'Hôm qua, 16:21' : 'Yesterday, 16:21',
      isVi ? 'Hôm qua, 15:40' : 'Yesterday, 15:40',
      isVi ? 'Hôm nay, 06:15' : 'Today, 06:15',
      isVi ? 'Hôm nay, 06:30' : 'Today, 06:30',
    ]

    while (rosterList.length < activeClass.booked && poolIndex < POOL_OF_STUDENTS.length) {
      const student = POOL_OF_STUDENTS[poolIndex]
      if (student.name !== 'Jordan Davis' || !memberBooked) {
        rosterList.push({
          id: studentIdCounter,
          name: student.name,
          initials: student.initials,
          avatarClass: student.avatarClass,
          time: times[(studentIdCounter - 1) % times.length],
        })
        studentIdCounter++
      }
      poolIndex++
    }

    return rosterList
  }, [activeClass, bookedSessions, isVi])

  // Current checked student IDs for active class
  const currentChecked = (activeClass && checkedMap[activeClass.id]) || [1, 2]

  const toggleCheck = (studentId: number, studentName: string) => {
    if (!activeClass) return
    const isCurrentlyChecked = currentChecked.includes(studentId)
    const newChecked = isCurrentlyChecked
      ? currentChecked.filter(id => id !== studentId)
      : [...currentChecked, studentId]

    setCheckedMap(prev => ({ ...prev, [activeClass.id]: newChecked }))
    showToast(isCurrentlyChecked
      ? (isVi ? `${studentName} đã chuyển sang trạng thái vắng mặt.` : `${studentName} marked as absent.`)
      : (isVi ? `${studentName} đã điểm danh thành công!` : `${studentName} checked in successfully!`)
    )
  }

  const checkAll = () => {
    if (!activeClass) return
    const allIds = classRoster.map(s => s.id)
    setCheckedMap(prev => ({ ...prev, [activeClass.id]: allIds }))
    showToast(isVi
      ? `Đã điểm danh toàn bộ ${allIds.length} học viên lớp ${getSessionTitle(activeClass, isVi)}!`
      : `All ${allIds.length} students in ${getSessionTitle(activeClass, isVi)} checked in successfully!`
    )
  }

  const handleOpenNoteModal = () => {
    if (activeClass) {
      setNoteInput(getNoteText(activeClass.id))
      setShowNoteModal(true)
    }
  }

  const handleSaveNote = () => {
    if (!activeClass) return
    setClassNotes(prev => ({ ...prev, [activeClass.id]: noteInput.trim() }))
    setShowNoteModal(false)
    showToast(isVi ? 'Đã lưu ghi chú ca học thành công!' : 'Class session note saved successfully!')
  }

  const activeDayIdx = days.indexOf(activeDay)
  const dateLabel = getFullDayDateLabel(weekOffset, activeDayIdx >= 0 ? activeDayIdx : 0, isVi)

  return (
    <>
      <PageHeader
        eyebrow={dateLabel}
        title={isVi ? 'Trung tâm điều phối Huấn luyện viên' : 'Instructor Dispatch Center'}
        description={isVi ? `Chào buổi sáng, ${user.name}. Đây là lịch giảng dạy hôm nay của bạn.` : `Good morning, ${user.name}. Here is your teaching schedule for today.`}
        action={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {onGoToProfile && (
              <button className="button button-ghost" onClick={onGoToProfile}>
                <Award /> {isVi ? 'Hồ sơ chuyên môn' : 'Coach profile'}
              </button>
            )}
            <button className="button button-primary" onClick={handleOpenNoteModal}>
              <Plus /> {isVi ? 'Thêm ghi chú ca học' : 'Add session note'}
            </button>
          </div>
        }
      />

      {/* Week Navigation Header Bar */}
      <div className="section-heading" style={{ marginBottom: 10, marginTop: 4 }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
            {getWeekRange(weekOffset, isVi)}
          </p>
        </div>
        <button
          type="button"
          className="button button-ghost"
          onClick={() => { setWeekOffset(0); setActiveDay(getTodayDayKey()); setSelectedClassId(null); }}
          title={isVi ? 'Trở về tuần hiện tại' : 'Return to current week'}
        >
          <CalendarDays /> {isVi ? 'Tuần này' : 'This week'}
        </button>
      </div>

      {/* Day Selector Tabs with Left/Right Arrows for Coach */}
      <div className="day-tabs-row" style={{ marginBottom: 22, marginTop: 0 }}>
        <button
          type="button"
          className="week-nav-arrow-btn"
          onClick={() => setWeekOffset(w => w - 1)}
          title={isVi ? 'Tuần trước' : 'Previous week'}
          aria-label="Previous week"
        >
          <ChevronLeft style={{ width: 16, height: 16 }} />
        </button>

        <div className="day-tabs">
          {days.map((day, idx) => {
            const dateObj = getDayDate(weekOffset, idx)
            return (
              <button
                key={day}
                type="button"
                className={day === activeDay ? 'selected' : ''}
                onClick={() => { setActiveDay(day); setSelectedClassId(null); }}
              >
                <span>{isVi ? DAY_LABELS_SHORT[day] : day}</span>
                <strong>{dateObj.getDate()}</strong>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="week-nav-arrow-btn"
          onClick={() => setWeekOffset(w => w + 1)}
          title={isVi ? 'Tuần sau' : 'Next week'}
          aria-label="Next week"
        >
          <ChevronRight style={{ width: 16, height: 16 }} />
        </button>
      </div>

      <div className="instructor-layout">
        <section className="class-list-panel">
          <div className="section-heading">
            <div>
              <h2>{isVi ? 'Lịch dạy trong ngày' : "Day's schedule"}</h2>
              <p>{dayClasses.length} {isVi ? 'ca học' : dayClasses.length === 1 ? 'class' : 'classes'} · {totalParticipants} {isVi ? 'học viên tham gia' : totalParticipants === 1 ? 'student enrolled' : 'students enrolled'}</p>
            </div>
          </div>

          {dayClasses.length === 0 ? (
            <div className="empty-state" style={{ padding: '35px 15px' }}>
              <Clock3 style={{ width: 28, height: 28, color: 'var(--muted)', margin: '0 auto 10px', display: 'block' }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: '0 0 4px' }}>
                {isVi ? 'Không có ca dạy nào trong ngày này.' : 'No teaching sessions on this day.'}
              </p>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                {isVi ? 'Thời gian nghỉ ngơi & phục hồi thể lực.' : 'Rest & recovery day.'}
              </span>
            </div>
          ) : (
            dayClasses.map(s => {
              const isSelected = activeClass?.id === s.id
              return (
                <button
                  key={s.id}
                  className={`class-card ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedClassId(s.id)}
                >
                  <div className={`discipline-icon ${s.color}`}>
                    {s.discipline === 'Pilates' ? <Target /> : <Activity />}
                  </div>
                  <div>
                    <strong>{getSessionTitle(s, isVi)}</strong>
                    <span>{s.time} · {formatRoom(s.room, isVi)}</span>
                  </div>
                  <div className="class-count">
                    <strong>{s.booked}/{s.capacity}</strong>
                    <span>{isVi ? 'đã đặt' : 'booked'}</span>
                  </div>
                  <ChevronRight />
                </button>
              )
            })
          )}

          {nextClass && (
            <div className="next-up">
              <span className="eyebrow">{isVi ? 'CA TIẾP THEO TRONG NGÀY' : 'NEXT UP TODAY'}</span>
              <strong>{getSessionTitle(nextClass, isVi)}</strong>
              <p>{nextClass.time} · {formatRoom(nextClass.room, isVi)} ({formatDuration(nextClass.duration, isVi)})</p>
            </div>
          )}
        </section>

        <section className="roster-panel">
          {activeClass ? (
            <>
              <div className="section-heading">
                <div>
                  <div className="eyebrow accent-eyebrow">{isVi ? 'DANH SÁCH HỌC VIÊN' : 'LIVE ROSTER'}</div>
                  <h2>{getSessionTitle(activeClass, isVi)}</h2>
                  <p>{activeClass.time} · {formatRoom(activeClass.room, isVi)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    className="button button-ghost"
                    onClick={checkAll}
                    style={{ fontSize: 10, padding: '6px 10px' }}
                    title={isVi ? 'Điểm danh toàn bộ học viên' : 'Check in all participants'}
                  >
                    <Check style={{ width: 12, height: 12 }} /> {isVi ? 'Điểm danh tất cả' : 'Check all'}
                  </button>
                  <Chip tone="green"><span className="pulse-dot" /> {activeClass.booked} {isVi ? 'đã đặt' : 'booked'}</Chip>
                </div>
              </div>

              {getNoteText(activeClass.id) && (
                <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: 'rgba(198, 243, 107, 0.08)', border: '1px solid rgba(198, 243, 107, 0.25)', fontSize: 11 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--lime)', fontWeight: 700, marginBottom: 4 }}>
                    <Info style={{ width: 13, height: 13 }} />
                    <span>{isVi ? 'Lưu ý từ HLV Maya Chen:' : 'Instructor Note:'}</span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text)', fontSize: 11, lineHeight: 1.5 }}>
                    {getNoteText(activeClass.id)}
                  </p>
                </div>
              )}

              <div className="roster-progress">
                <span>{isVi ? 'Tiến độ điểm danh' : 'Check-in Progress'}</span>
                <strong>{currentChecked.length} / {classRoster.length} {isVi ? 'đã có mặt' : 'present'}</strong>
                <div className="progress">
                  <i style={{ width: `${classRoster.length > 0 ? (currentChecked.length / classRoster.length) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="roster-list">
                {classRoster.map((person) => {
                  const isPresent = currentChecked.includes(person.id)
                  return (
                    <div className="roster-row" key={person.name}>
                      <div className={`avatar ${person.avatarClass}`}>{person.initials}</div>
                      <div className="roster-name">
                        <strong>{person.name}</strong>
                        <span>{isVi ? 'Đã đặt' : 'Booked'}: {person.time}</span>
                      </div>
                      <button
                        className={`attendance ${isPresent ? 'present' : ''}`}
                        onClick={() => toggleCheck(person.id, person.name)}
                      >
                        {isPresent ? <><Check /> {isVi ? 'Đã điểm danh' : 'Checked in'}</> : (isVi ? 'Điểm danh' : 'Check in')}
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <Users style={{ width: 36, height: 36, color: 'var(--muted)', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: '0 0 6px' }}>
                {isVi ? 'Chưa có lớp học được chọn' : 'No class selected'}
              </p>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: 11 }}>
                {isVi ? 'Vui lòng chọn một ca dạy ở danh sách bên trái để quản lý danh sách học viên.' : 'Select a class on the left to manage roster and attendance.'}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Coach Note Modal */}
      {showNoteModal && activeClass && (
        <div className="modal-backdrop" onClick={() => setShowNoteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 'min(460px, 92vw)' }}>
            <div className={`modal-banner ${activeClass.color}`}>
              <button className="icon-button light" onClick={() => setShowNoteModal(false)} aria-label="Close"><X /></button>
              <div className="modal-discipline">{isVi ? 'Ghi chú ca học' : 'Class Session Note'}</div>
              <h2>{getSessionTitle(activeClass, isVi)}</h2>
            </div>
            <div className="modal-content">
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>
                {isVi ? 'Nội dung lưu ý / Thể trạng học viên' : 'Session Note / Trainee Alerts'}
              </label>
              <textarea
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder={isVi ? 'Ví dụ: Học viên Jordan Davis căng cơ chân, học viên Sofia cần lưu ý góc nghiêng cổ chân...' : 'E.g., Jordan Davis muscle tension, check reformer spring settings...'}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--line)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text)',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                  marginBottom: 16
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button className="button button-ghost" onClick={() => setShowNoteModal(false)}>
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button className="button button-primary" onClick={handleSaveNote}>
                  <Check /> {isVi ? 'Lưu ghi chú' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ==========================================================================
   INSTRUCTOR PROFILE VIEW (COACH DETAILED CREDENTIALS & PERKS)
   ========================================================================== */
function InstructorProfileView({
  user,
  sessions,
  isVi,
  onGoToSchedule,
  showToast,
  onUpdateUser,
}: {
  user: User
  sessions: Session[]
  isVi: boolean
  onGoToSchedule: () => void
  showToast: (msg: string) => void
  onUpdateUser?: (updated: Partial<User>) => void
}) {
  const isDefaultBio = !user.bio || user.bio === DEFAULT_COACH_BIO.vi || user.bio === DEFAULT_COACH_BIO.en
  const currentBio = isDefaultBio ? (isVi ? DEFAULT_COACH_BIO.vi : DEFAULT_COACH_BIO.en) : user.bio

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(user.name)
  const [editEmail, setEditEmail] = useState(user.email)
  const [editPhone, setEditPhone] = useState(user.phone || '0912 345 678')
  const [editBio, setEditBio] = useState(currentBio)

  useEffect(() => {
    setEditBio(currentBio)
  }, [currentBio])

  const handleOpenEdit = () => {
    setEditName(user.name)
    setEditEmail(user.email)
    setEditPhone(user.phone || '0912 345 678')
    setEditBio(currentBio)
    setIsEditing(true)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) {
      showToast(isVi ? 'Họ và tên không được để trống' : 'Name cannot be empty')
      return
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      showToast(isVi ? 'Vui lòng nhập địa chỉ email hợp lệ' : 'Please enter a valid email address')
      return
    }
    if (onUpdateUser) {
      onUpdateUser({
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        bio: (editBio || '').trim(),
      })
    }
    setIsEditing(false)
  }

  const coachClasses = useMemo(() => {
    return sessions.filter(s => s.instructor === user.name || (user.name === 'Maya Chen' && s.instructor === 'Maya Chen'))
  }, [sessions, user.name])

  return (
    <>
      <PageHeader
        eyebrow={isVi ? 'HỒ SƠ CHUYÊN MÔN & BẰNG CẤP HLV' : 'COACH PROFILE & CERTIFICATIONS'}
        title={isVi ? 'Hồ sơ Huấn luyện viên' : 'Instructor Profile'}
        description={isVi ? 'Thông tin chứng chỉ quốc tế, năng lực đào tạo chuyên sâu và hiệu suất giảng dạy tại FitPulse.' : 'International certifications, specialized teaching qualifications, and studio performance.'}
        action={
          <button className="button button-primary" onClick={onGoToSchedule}>
            <CalendarDays /> {isVi ? 'Xem lịch dạy' : 'Teaching schedule'}
          </button>
        }
      />

      <div className="profile-grid-layout">
        {/* Left Column: Bio, Certifications, Specialties & Assigned Sessions */}
        <div>
          <div className="detail-card">
            <div className="profile-header-strip">
              <div className={`avatar avatar-large ${user.avatarColor}`} style={{ width: 54, height: 54, fontSize: 16 }}>
                {user.avatar}
              </div>
              <div className="profile-header-info">
                <h2>{user.name}</h2>
                <span>
                  {user.email} · {user.phone || '0912 345 678'} · {isVi ? 'Mã HLV' : 'Staff ID'}: <strong>FP-COACH-04</strong>
                </span>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Chip tone="violet">
                    <Award style={{ width: 12, height: 12 }} />
                    {user.subtitle ? (isVi ? user.subtitle.vi : user.subtitle.en) : (isVi ? 'HLV Pilates & Yoga' : 'Pilates & Yoga Coach')}
                  </Chip>
                  <Chip tone="green">
                    <ShieldCheck style={{ width: 12, height: 12 }} />
                    {isVi ? 'Đã kiểm duyệt PMA & Yoga Alliance' : 'Verified PMA & Yoga Alliance'}
                  </Chip>
                </div>
              </div>
              <button
                className="button button-ghost"
                style={{ marginLeft: 'auto', gap: 6, whiteSpace: 'nowrap' }}
                onClick={handleOpenEdit}
              >
                <Edit3 style={{ width: 14, height: 14, color: 'var(--teal)' }} />
                <span>{isVi ? 'Chỉnh sửa hồ sơ' : 'Edit profile'}</span>
              </button>
            </div>

            <div style={{ marginTop: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>{isVi ? 'TIỂU SỬ & PHƯƠNG PHÁP HUẤN LUYỆN' : 'BIOGRAPHY & COACHING PHILOSOPHY'}</div>
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
                {currentBio}
              </p>
            </div>

            <div style={{ marginTop: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>{isVi ? 'BẰNG CẤP & CHỨNG CHỈ QUỐC TẾ' : 'ACCREDITED CERTIFICATIONS'}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                {[
                  {
                    title: 'PMA-CPT® Certified Pilates Teacher',
                    issuer: isVi ? 'Pilates Method Alliance (Hoa Kỳ) · Hiệu lực đến 2028' : 'Pilates Method Alliance (USA) · Valid through 2028',
                    tag: isVi ? 'Bậc thầy Pilates' : 'Pilates Master',
                    tone: 'violet' as const,
                  },
                  {
                    title: 'RYT® 500 Yoga Alliance Registered',
                    issuer: isVi ? 'Yoga Alliance International (Rishikesh, Ấn Độ)' : 'Yoga Alliance International (Rishikesh, India)',
                    tag: isVi ? 'Bậc thầy Yoga' : 'Yoga Master',
                    tone: 'amber' as const,
                  },
                  {
                    title: 'FMS Level 2 Functional Movement Screen',
                    issuer: isVi ? 'Đánh giá chuyển động & phòng ngừa chấn thương' : 'Movement screen & injury risk mitigation',
                    tag: isVi ? 'Cơ sinh học' : 'Biomechanics',
                    tone: 'green' as const,
                  },
                  {
                    title: 'Pre & Postnatal Pilates Specialist',
                    issuer: isVi ? 'Chuyên gia phục hồi cơ sàn chậu & cột sống sau sinh' : 'Core & pelvic floor postpartum recovery',
                    tag: isVi ? 'Chuyên gia' : 'Specialist',
                    tone: 'neutral' as const,
                  },
                ].map((cert, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 14,
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, .03)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <strong style={{ fontSize: 12, color: 'var(--text)' }}>{cert.title}</strong>
                      <Chip tone={cert.tone}>{cert.tag}</Chip>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>{cert.issuer}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>{isVi ? 'BỘ MÔN CHUYÊN TRÁCH' : 'CORE SPECIALTIES'}</div>
              <div className="perks-grid">
                <div className="perk-item">
                  <Check /> <span>{isVi ? 'Pilates Reformer Thấu cảm' : 'Intuitive Reformer Pilates'}</span>
                </div>
                <div className="perk-item">
                  <Check /> <span>{isVi ? 'Pilates Thể lực Cao & Core' : 'Athletic Reformer & Core'}</span>
                </div>
                <div className="perk-item">
                  <Check /> <span>{isVi ? 'Vinyasa Flow Yoga Khí huyết' : 'Vitality Flow Yoga'}</span>
                </div>
                <div className="perk-item">
                  <Check /> <span>{isVi ? 'Phục hồi tư thế & Giảm đau lưng' : 'Spinal Alignment & Posture Rehab'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Classes List */}
          <div className="detail-card">
            <div className="section-heading">
              <div>
                <h2>{isVi ? 'Các ca học phụ trách trong tuần' : 'Assigned weekly studio sessions'}</h2>
                <p>{coachClasses.length} {isVi ? 'ca học đang hoạt động trên hệ thống' : 'active weekly classes'}</p>
              </div>
              <button className="button button-ghost" onClick={onGoToSchedule}>
                <CalendarDays /> {isVi ? 'Mở lịch điều phối' : 'View in calendar'}
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{isVi ? 'Thứ' : 'Day'}</th>
                    <th>{isVi ? 'Giờ học' : 'Time'}</th>
                    <th>{isVi ? 'Tên ca học' : 'Class Title'}</th>
                    <th>{isVi ? 'Bộ môn' : 'Discipline'}</th>
                    <th>{isVi ? 'Phòng tập' : 'Studio Room'}</th>
                    <th>{isVi ? 'Sức chứa' : 'Capacity'}</th>
                  </tr>
                </thead>
                <tbody>
                  {coachClasses.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{isVi ? DAY_LABELS_FULL_VI[item.day] : DAY_LABELS_FULL_EN[item.day]}</strong></td>
                      <td>{item.time}</td>
                      <td><strong>{getSessionTitle(item, isVi)}</strong></td>
                      <td>
                        <span className={`chip chip-${item.discipline === 'Pilates' ? 'violet' : item.discipline === 'Yoga' ? 'amber' : 'green'}`}>
                          {item.discipline}
                        </span>
                      </td>
                      <td>{formatRoom(item.room, isVi)}</td>
                      <td><Chip tone="green">{item.booked} / {item.capacity} {isVi ? 'chỗ' : 'slots'}</Chip></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Performance KPIs & Staff ID Badge */}
        <div>
          {/* Performance KPI Card */}
          <div className="detail-card">
            <div className="eyebrow" style={{ marginBottom: 8 }}>{isVi ? 'CHỈ SỐ GIẢNG DẠY' : 'TEACHING KPI'}</div>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, color: 'var(--text)' }}>
              {isVi ? 'Hiệu suất chuyên môn' : 'Performance Overview'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 18 }}>
              <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255, 255, 255, .03)', border: '1px solid var(--line)' }}>
                <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block' }}>{isVi ? 'Đánh giá học viên' : 'Student Rating'}</span>
                <strong style={{ fontSize: 16, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Star style={{ width: 14, height: 14, fill: 'currentColor' }} /> 4.96 <small style={{ fontSize: 10, color: 'var(--muted)' }}>({isVi ? '184 đánh giá' : '184 reviews'})</small>
                </strong>
              </div>
              <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255, 255, 255, .03)', border: '1px solid var(--line)' }}>
                <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block' }}>{isVi ? 'Giờ dạy tích lũy' : 'Teaching Hours'}</span>
                <strong style={{ fontSize: 16, color: 'var(--teal)', display: 'block', marginTop: 4 }}>1,280+ {isVi ? 'giờ' : 'hrs'}</strong>
              </div>
              <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255, 255, 255, .03)', border: '1px solid var(--line)' }}>
                <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block' }}>{isVi ? 'Học viên đã kèm' : 'Total Students'}</span>
                <strong style={{ fontSize: 16, color: 'var(--text)', display: 'block', marginTop: 4 }}>360+ {isVi ? 'người' : 'trainees'}</strong>
              </div>
              <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255, 255, 255, .03)', border: '1px solid var(--line)' }}>
                <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block' }}>{isVi ? 'Đúng giờ & hoàn thành' : 'On-time Rate'}</span>
                <strong style={{ fontSize: 16, color: 'var(--lime)', display: 'block', marginTop: 4 }}>99.8%</strong>
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(255, 255, 255, .03)', border: '1px solid var(--line)', marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--muted)' }}>{isVi ? 'Phòng tập thường trực' : 'Primary Studios'}</span>
                <strong style={{ color: 'var(--text)' }}>{isVi ? 'Phòng Reformer 1 & Phòng Zen' : 'Reformer Studio 1 & Zen Room'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: 'var(--muted)' }}>{isVi ? 'Tình trạng chứng chỉ' : 'Certification Status'}</span>
                <span style={{ color: 'var(--teal)', fontWeight: 700 }}>{isVi ? 'Đang hiệu lực (2028)' : 'Active (thru 2028)'}</span>
              </div>
            </div>
          </div>

          {/* Instructor Staff Card */}
          <div className="detail-card" style={{ textAlign: 'center' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>{isVi ? 'THẺ HUẤN LUYỆN VIÊN FITPULSE' : 'FITPULSE INSTRUCTOR PASS'}</div>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, color: 'var(--text)' }}>
              {isVi ? 'Thẻ định danh HLV' : 'Digital Staff ID'}
            </h2>

            <div className="qr-box" style={{ width: 200, height: 200, margin: '0 auto 16px', padding: 18 }}>
              <div className="qr-pattern" style={{ width: 140, height: 140 }}>
                <QrCode style={{ width: 130, height: 130 }} />
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(255, 255, 255, .03)', border: '1px solid var(--line)', marginBottom: 18, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--muted)' }}>{isVi ? 'Mã định danh HLV' : 'Staff Barcode'}</span>
                <strong style={{ color: 'var(--text)', fontFamily: 'monospace' }}>FP-COACH-04-MC</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: 'var(--muted)' }}>{isVi ? 'Cấp độ phân quyền' : 'Security Level'}</span>
                <span style={{ color: 'var(--violet)', fontWeight: 700 }}>{isVi ? 'HLV Cấp 3 (Toàn quyền Studio)' : 'Tier 3 (Master Coach)'}</span>
              </div>
            </div>

            <button className="button button-primary full-width" onClick={onGoToSchedule}>
              <CalendarDays /> {isVi ? 'Vào lịch giảng dạy hôm nay' : 'Go to Teaching Schedule'}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Coach Profile Modal */}
      {isEditing && (
        <div className="modal-backdrop" onClick={() => setIsEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 'min(500px, 92vw)' }}>
            <div className="modal-banner violet">
              <button className="icon-button light" onClick={() => setIsEditing(false)} aria-label="Close"><X /></button>
              <div className="modal-discipline">{isVi ? 'Hồ sơ chuyên môn' : 'Coach Credentials'}</div>
              <h2>{isVi ? 'Chỉnh sửa thông tin Huấn luyện viên' : 'Edit Coach Profile'}</h2>
            </div>
            <form onSubmit={handleSaveEdit} className="modal-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 22 }}>
                <div className="form-group">
                  <label>{isVi ? 'Họ và tên HLV' : 'Full Name'}</label>
                  <div className="input-with-icon">
                    <UserCheck />
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Maya Chen"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{isVi ? 'Địa chỉ Email' : 'Email Address'}</label>
                  <div className="input-with-icon">
                    <Mail />
                    <input
                      type="email"
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      placeholder="maya@fitpulse.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{isVi ? 'Số điện thoại liên hệ' : 'Phone Number'}</label>
                  <div className="input-with-icon">
                    <Phone />
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      placeholder="0912 345 678"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{isVi ? 'Tiểu sử & Phương pháp huấn luyện' : 'Coaching Bio & Philosophy'}</label>
                  <textarea
                    rows={4}
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    placeholder={isVi ? 'Nhập tóm tắt tiểu sử và kinh nghiệm giảng dạy...' : 'Enter your bio and coaching background...'}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--line)',
                      background: 'rgba(255, 255, 255, .04)',
                      color: 'var(--text)',
                      fontSize: 12,
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="button button-ghost" onClick={() => setIsEditing(false)}>
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button type="submit" className="button button-primary">
                  <Check style={{ width: 14, height: 14 }} /> {isVi ? 'Lưu thông tin' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

/* ==========================================================================
   ADMIN VIEW
   ========================================================================== */
function AdminView({ sessions, setSessions, showToast, isVi }: { sessions: Session[]; setSessions: React.Dispatch<React.SetStateAction<Session[]>>; showToast: (m: string) => void; isVi: boolean }) {
  const [showForm, setShowForm] = useState(false)
  const totalBooked = sessions.reduce((sum, s) => sum + s.booked, 0)
  const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0)

  return (
    <>
      <PageHeader
        eyebrow={isVi ? `Tổng quan vận hành · Tháng ${new Date().getMonth() + 1}, ${new Date().getFullYear()}` : `Operations overview · ${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}`}
        title={isVi ? 'Bảng điều khiển Quản trị Studio' : 'Studio intelligence.'}
        description={isVi ? 'Cái nhìn toàn diện theo thời gian thực về toàn bộ hệ sinh thái thể thao.' : 'A real-time view of your wellness ecosystem.'}
        action={<button className="button button-primary" onClick={() => setShowForm(!showForm)}><Plus /> {isVi ? 'Mở ca tập mới' : 'New session'}</button>}
      />

      {showForm && (
        <NewSessionForm
          onCancel={() => setShowForm(false)}
          onAdd={session => {
            setSessions(items => [...items, { ...session, id: Date.now(), booked: 0 }])
            setShowForm(false)
            showToast(isVi ? 'Đã thêm ca tập mới vào lịch trình studio.' : 'Session added to the schedule.')
          }}
          isVi={isVi}
        />
      )}

      <div className="kpi-grid">
        <Kpi icon={<Users />} label={isVi ? 'Hội viên hoạt động' : 'Active members'} value="1,284" change="+12.6%" tone="emerald" isVi={isVi} />
        <Kpi icon={<Check />} label={isVi ? 'Lượt check-in hôm nay' : "Today's check-ins"} value="186" change="+8.4%" tone="blue" isVi={isVi} />
        <Kpi icon={<BarChart3 />} label={isVi ? 'Tỷ lệ lấp đầy (CUR)' : 'Capacity utilization'} value={`${Math.round((totalBooked / totalCapacity) * 100)}%`} change="+4.2%" tone="violet" isVi={isVi} />
        <Kpi icon={<Sparkles />} label={isVi ? 'Doanh thu tháng' : 'Monthly revenue'} value="$48.2k" change="+16.8%" tone="amber" isVi={isVi} />
      </div>

      <div className="admin-grid">
        <OccupancyChart isVi={isVi} />
        <DistributionChart isVi={isVi} />
      </div>

      <div className="admin-table-card">
        <div className="section-heading">
          <div>
            <h2>{isVi ? 'Hoạt động hội viên gần đây' : 'Member activity'}</h2>
            <p>{isVi ? 'Nhật ký gói tập và tần suất check-in gần nhất' : 'Recent membership and attendance activity'}</p>
          </div>
          <button className="button button-ghost">{isVi ? 'Xem tất cả' : 'View all'} <ArrowUpRight /></button>
        </div>
        <MemberTable isVi={isVi} />
      </div>
    </>
  )
}

function Kpi({ icon, label, value, change, tone, isVi }: { icon: React.ReactNode; label: string; value: string; change: string; tone: string; isVi: boolean }) {
  return (
    <div className="kpi-card">
      <div className={`kpi-icon ${tone}`}>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small><ArrowUpRight /> {change} <em>{isVi ? 'so với tháng trước' : 'vs last month'}</em></small>
    </div>
  )
}

function OccupancyChart({ isVi }: { isVi: boolean }) {
  const values = [32, 45, 62, 74, 88, 81, 69, 54, 41, 28]
  return (
    <div className="chart-card">
      <div className="section-heading">
        <div>
          <h2>{isVi ? 'Tỷ lệ lấp đầy theo giờ' : 'Studio occupancy'}</h2>
          <p>{isVi ? 'Mức độ khai thác trung bình các khung giờ' : 'Average utilization by hour'}</p>
        </div>
        <Chip tone="green">{isVi ? 'Trực tiếp' : 'Live'}</Chip>
      </div>
      <div className="bar-chart">
        {values.map((value, i) => (
          <div className="bar-col" key={i}>
            <div className="bar" style={{ height: `${value}%` }} />
            <span>{8 + i} {i < 2 ? 'am' : 'pm'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DistributionChart({ isVi }: { isVi: boolean }) {
  return (
    <div className="chart-card distribution">
      <div className="section-heading">
        <div>
          <h2>{isVi ? 'Cơ cấu bộ môn' : 'Class mix'}</h2>
          <p>{isVi ? 'Tỷ lệ đặt lịch theo Gym, Yoga & Pilates' : 'Bookings by discipline'}</p>
        </div>
        <MoreHorizontal />
      </div>
      <div className="donut-wrap">
        <div className="donut">
          <div>
            <strong>186</strong>
            <span>{isVi ? 'lượt đặt' : 'bookings'}</span>
          </div>
        </div>
        <div className="legend">
          <span><i className="dot emerald" /> Gym <b>48%</b></span>
          <span><i className="dot amber" /> Yoga <b>32%</b></span>
          <span><i className="dot violet" /> Pilates <b>20%</b></span>
        </div>
      </div>
    </div>
  )
}

function MemberTable({ isVi }: { isVi: boolean }) {
  const rows = isVi ? [
    ['Jordan Davis', 'Gói Pro · Toàn quyền', 'Hôm nay, 08:42', 'Hoạt động', 'JD'],
    ['Sofia Patel', 'Gói Không giới hạn', 'Hôm nay, 07:15', 'Hoạt động', 'SP'],
    ['Marcus Lee', 'Gói 10 buổi tập', 'Hôm qua, 18:30', 'Hoạt động', 'ML'],
    ['Emma Wilson', 'Gói Yoga tháng', '13/10, 11:20', 'Sắp hết hạn', 'EW']
  ] : [
    ['Jordan Davis', 'Pro · All access', 'Today, 8:42 AM', 'Active', 'JD'],
    ['Sofia Patel', 'Unlimited', 'Today, 7:15 AM', 'Active', 'SP'],
    ['Marcus Lee', '10 session pack', 'Yesterday, 6:30 PM', 'Active', 'ML'],
    ['Emma Wilson', 'Yoga monthly', 'Oct 13, 11:20 AM', 'Expiring soon', 'EW']
  ]
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{isVi ? 'Hội viên' : 'Member'}</th>
            <th>{isVi ? 'Gói thành viên' : 'Plan'}</th>
            <th>{isVi ? 'Hoạt động gần nhất' : 'Last activity'}</th>
            <th>{isVi ? 'Trạng thái' : 'Status'}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row[0]}>
              <td>
                <div className="table-person">
                  <div className="avatar avatar-small">{row[4]}</div>
                  <strong>{row[0]}</strong>
                </div>
              </td>
              <td>{row[1]}</td>
              <td>{row[2]}</td>
              <td><Chip tone={row[3] === 'Active' || row[3] === 'Hoạt động' ? 'green' : 'amber'}>{row[3]}</Chip></td>
              <td><MoreHorizontal /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function NewSessionForm({ onCancel, onAdd, isVi }: { onCancel: () => void; onAdd: (s: Omit<Session, 'id' | 'booked'>) => void; isVi: boolean }) {
  const [title, setTitle] = useState('')
  const [discipline, setDiscipline] = useState<Discipline>('Yoga')
  const [time, setTime] = useState('18:00')
  const [error, setError] = useState('')

  return (
    <div className="new-session">
      <div>
        <div className="eyebrow accent-eyebrow">SCHEDULE BUILDER</div>
        <h2>{isVi ? 'Khởi tạo ca tập mới' : 'Add a new session'}</h2>
        <p>{isVi ? 'Hệ thống tự động kiểm tra sức chứa phòng và phát hiện xung đột lịch dạy.' : 'Capacity validation and conflict detection run automatically.'}</p>
      </div>
      <div className="form-grid">
        <label>
          {isVi ? 'Tên ca học' : 'Session title'}
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Sunrise flow" />
        </label>
        <label>
          {isVi ? 'Bộ môn' : 'Discipline'}
          <select value={discipline} onChange={e => setDiscipline(e.target.value as Discipline)}>
            <option>Yoga</option>
            <option>Pilates</option>
            <option>Gym</option>
          </select>
        </label>
        <label>
          {isVi ? 'Giờ bắt đầu' : 'Start time'}
          <input type="time" value={time} onChange={e => setTime(e.target.value)} />
        </label>
        <label>
          {isVi ? 'Phòng tập' : 'Room'}
          <input defaultValue={discipline === 'Pilates' ? 'Reformer Studio' : 'Zen Room'} />
        </label>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <button className="button button-ghost" onClick={onCancel}>{isVi ? 'Hủy' : 'Cancel'}</button>
        <button
          className="button button-primary"
          onClick={() => {
            if (!title.trim()) {
              setError(isVi ? 'Vui lòng nhập tên ca học.' : 'Add a session title to continue.')
              return
            }
            onAdd({
              title,
              discipline,
              instructor: discipline === 'Pilates' ? 'Maya Chen' : 'Alex Morgan',
              room: discipline === 'Pilates' ? 'Reformer Studio' : discipline === 'Yoga' ? 'Zen Room' : 'Main Floor',
              time,
              duration: discipline === 'Gym' ? 'Flexible' : discipline === 'Yoga' ? '60 min' : '50 min',
              capacity: discipline === 'Pilates' ? 6 : discipline === 'Yoga' ? 20 : 50,
              color: discipline === 'Pilates' ? 'violet' : discipline === 'Yoga' ? 'amber' : 'emerald',
              day: 'Tue',
            })
          }}
        >
          {isVi ? 'Lưu ca tập' : 'Add session'} <ArrowUpRight />
        </button>
      </div>
    </div>
  )
}

/* ==========================================================================
   SIMULATION VIEW
   ========================================================================== */
function SimulationView({ showToast, isVi }: { showToast: (m: string) => void; isVi: boolean }) {
  const [running, setRunning] = useState(false)
  const [complete, setComplete] = useState(false)

  const run = () => {
    setRunning(true)
    window.setTimeout(() => {
      setRunning(false)
      setComplete(true)
      showToast(isVi ? 'Tối ưu hóa hoàn tất. 2 ràng buộc đã được giải quyết.' : 'Re-optimization complete. 2 constraints resolved.')
    }, 1400)
  }

  return (
    <>
      <PageHeader
        eyebrow={isVi ? 'Môi trường nghiên cứu · v1.0' : 'Research sandbox · v1.0'}
        title={isVi ? 'Động cơ Phân bổ Lịch trình Thông minh' : 'The scheduling engine.'}
        description={isVi ? 'Quan sát cách FitPulse xử lý sức chứa máy, xung đột lịch HLV và tối ưu hóa thời gian thực.' : 'Observe how FitPulse handles capacity, conflicts, and allocation in real time.'}
        action={<Chip tone="green"><span className="pulse-dot" /> {isVi ? 'Động cơ trực tuyến' : 'Engine online'}</Chip>}
      />

      <div className="simulation-hero">
        <div className="sim-copy">
          <div className="sim-icon"><Zap /></div>
          <div className="eyebrow accent-eyebrow">CAPACITY-CONSTRAINED OPTIMIZER</div>
          <h2>{isVi ? <>Từng khung giờ, <em>phân bổ hoàn hảo.</em></> : <>Every slot, <em>perfectly placed.</em></>}</h2>
          <p>
            {isVi
              ? 'Thuật toán tối ưu hóa của FitPulse liên tục đánh giá nhu cầu, quỹ thời gian của HLV, ràng buộc phòng tập và số lượng máy Pilates để giữ cho studio vận hành ở công suất cao nhất.'
              : "FitPulse's scheduling engine continuously evaluates demand, instructor availability, room constraints, and equipment inventory to keep every studio moving."}
          </p>
          <button className="button button-primary" onClick={run} disabled={running}>
            {running ? <><Activity /> {isVi ? 'Đang tối ưu hóa...' : 'Re-optimizing…'}</> : <><Play /> {isVi ? 'Chạy thuật toán tái tối ưu' : 'Run automated re-optimization'}</>}
          </button>
          {complete && (
            <div className="optimization-result">
              <Check /> {isVi ? 'Đã giải quyết 2 xung đột · Đã phân bổ 6 máy reformer' : '2 conflicts resolved · 6 reformer machines allocated'}
            </div>
          )}
        </div>

        <div className="sim-visual">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="sim-core"><Zap /></div>
          <span className="node node-one">6/6</span>
          <span className="node node-two">{isVi ? '0 xung đột' : '0 conflicts'}</span>
          <span className="node node-three"><Clock3 /> 92ms</span>
        </div>
      </div>

      <div className="sim-metrics">
        <div>
          <span>{isVi ? 'Tổng số ca tập' : 'Total slots'}</span>
          <strong>48</strong>
          <small>{isVi ? 'Trên 3 bộ môn' : 'Across 3 disciplines'}</small>
        </div>
        <div>
          <span>{isVi ? 'Tỷ lệ lấp đầy (CUR)' : 'Occupancy rate'}</span>
          <strong>76.4%</strong>
          <small className="positive">+4.2% {isVi ? 'tuần này' : 'this week'}</small>
        </div>
        <div>
          <span>{isVi ? 'Xung đột phát hiện' : 'Detected conflicts'}</span>
          <strong className="positive">0</strong>
          <small>{isVi ? 'Tất cả ràng buộc thỏa mãn' : 'All constraints satisfied'}</small>
        </div>
        <div>
          <span>{isVi ? 'Độ trễ trung bình' : 'Avg. response latency'}</span>
          <strong>92ms</strong>
          <small>{isVi ? 'Mục tiêu < 120ms' : 'Target < 120ms'}</small>
        </div>
      </div>

      <div className="algorithm-steps">
        <div className="section-heading">
          <div>
            <h2>{isVi ? 'Quy trình phân bổ giải thuật' : 'Allocation pipeline'}</h2>
            <p>{isVi ? 'Dấu vết quyết định trực tiếp từ lần chạy tối ưu hóa mới nhất' : 'Live decision trace from the latest optimization run'}</p>
          </div>
          <Chip tone="green">Stable</Chip>
        </div>

        <div className="step-row">
          <Step
            number="01"
            title={isVi ? 'Thu thập tín hiệu nhu cầu' : 'Collect demand signals'}
            text={isVi ? 'Lượt đặt chỗ, danh sách chờ và thói quen hội viên' : 'Bookings, waitlists, and member preferences'}
            done
          />
          <Step
            number="02"
            title={isVi ? 'Áp dụng hệ ràng buộc' : 'Apply constraints'}
            text={isVi ? 'Phòng tập, lịch HLV và số lượng máy Reformer' : 'Rooms, instructors, and reformer inventory'}
            done
          />
          <Step
            number="03"
            title={isVi ? 'Tối ưu hóa phân bổ' : 'Optimize allocation'}
            text={isVi ? 'Tối đa hóa công suất không để xảy ra trùng lịch' : 'Maximize utilization without conflicts'}
            done
          />
          <Step
            number="04"
            title={isVi ? 'Đồng bộ lịch trình' : 'Publish schedule'}
            text={isVi ? 'Cập nhật tức thì đến cổng hội viên và HLV' : 'Sync changes across member portals'}
            done
          />
        </div>
      </div>
    </>
  )
}

function Step({ number, title, text, done }: { number: string; title: string; text: string; done?: boolean }) {
  return (
    <div className="step">
      <div className="step-number">{done ? <Check /> : number}</div>
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
      <CircleCheck className="step-check" />
    </div>
  )
}

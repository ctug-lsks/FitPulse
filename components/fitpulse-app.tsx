'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import {
  Activity, ArrowUpRight, BarChart3, CalendarDays, Check, ChevronRight, ChevronDown, CircleCheck, Clock3,
  Dumbbell, Flame, Grid2X2, LayoutDashboard, MapPin, Menu, MoreHorizontal, Play, Plus,
  QrCode, Search, Settings2, Sparkles, Sun, Moon, Target, Users, X, Zap,
  LogOut, Lock, Mail, AlertCircle, Info, Trash2, CalendarCheck, ShieldCheck, CreditCard, Award, UserCheck, RefreshCw,
} from 'lucide-react'

export type Role = 'member' | 'instructor' | 'admin' | 'simulation'
export type Discipline = 'Gym' | 'Yoga' | 'Pilates'
export type MemberTab = 'schedule' | 'my-schedule' | 'profile'

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
      subtitle: { vi: 'HLV Trưởng Pilates & Yoga', en: 'Senior Reformer Coach' },
      plan: 'Certified Instructor',
      planVi: 'Huấn luyện viên Quốc tế',
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
    date: '14/10/2026',
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
    date: '16/10/2026',
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
  const [sessions, setSessions] = useState(initialSessions)
  const [bookedSessions, setBookedSessions] = useState<BookedSession[]>(initialBookedSessions)
  const [creditsLeft, setCreditsLeft] = useState(8)
  const [filter, setFilter] = useState<'All' | Discipline>('All')
  const [selected, setSelected] = useState<Session | null>(null)
  const [toast, setToast] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [activeDay, setActiveDay] = useState('Mon')
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
    showToast(isVi ? `Chào mừng trở lại, ${user.name}` : `Welcome back, ${user.name}`)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('fitpulse_session')
    setUserMenuOpen(false)
    setRole('member')
    setMemberTab('schedule')
    showToast(isVi ? 'Đã đăng xuất thành công' : 'Signed out successfully')
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
      date: '15/10/2026',
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
      date: '15/10/2026',
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
    { id: 'instructor', label: isVi ? 'Giao diện huấn luyện viên' : 'Instructor view', icon: Users },
  ], [isVi])

  const adminNavItems = useMemo(() => [
    { id: 'admin', label: isVi ? 'Bảng quản trị' : 'Admin dashboard', icon: BarChart3 },
    { id: 'simulation', label: isVi ? 'Mô phỏng thuật toán' : 'Algorithm demo', icon: Zap },
  ], [isVi])

  // If not logged in, render the clean Login View
  if (!currentUser) {
    return (
      <div className={`app-shell ${lightTheme ? 'theme-light' : ''}`}>
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
                onClick={() => { setMemberTab(item.id as MemberTab); setMobileNav(false) }}
              >
                <Icon />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="nav-arrow" />}
              </button>
            )
          })}

          {currentUser.role === 'instructor' && instructorNavItems.map(item => {
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
              FITPULSE / {currentUser.role === 'member' ? memberTab.toUpperCase() : role.toUpperCase()}
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
                        {currentUser.role === 'member' ? t('Hội viên', 'Member') : currentUser.role === 'instructor' ? t('HLV', 'Instructor') : t('Quản trị viên', 'Admin')}
                      </span>
                    </div>
                  </div>

                  {currentUser.role === 'member' && (
                    <button
                      className="user-dropdown-item"
                      onClick={() => {
                        setMemberTab('profile')
                        setUserMenuOpen(false)
                      }}
                    >
                      <QrCode style={{ width: 14, height: 14, color: 'var(--teal)' }} />
                      <span>{t('Hồ sơ & Thẻ hội viên', 'Profile & Pass')}</span>
                    </button>
                  )}

                  <button
                    className="user-dropdown-item"
                    onClick={() => {
                      localStorage.removeItem('fitpulse_sessions')
                      localStorage.removeItem('fitpulse_booked_sessions')
                      localStorage.removeItem('fitpulse_credits_left')
                      setSessions(initialSessions)
                      setBookedSessions(initialBookedSessions)
                      setCreditsLeft(8)
                      setUserMenuOpen(false)
                      showToast(isVi ? 'Đã khôi phục dữ liệu ban đầu!' : 'Reset sample data successfully!')
                    }}
                  >
                    <RefreshCw style={{ width: 14, height: 14, color: 'var(--muted)' }} />
                    <span>{t('Khôi phục dữ liệu mẫu', 'Reset sample data')}</span>
                  </button>

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
              {memberTab === 'schedule' && (
                <MemberView
                  sessions={sessions}
                  filter={filter}
                  setFilter={setFilter}
                  activeDay={activeDay}
                  setActiveDay={setActiveDay}
                  onSelect={setSelected}
                  onJoinWaitlist={joinWaitlist}
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
                  onCancel={cancelBooking}
                  onLeaveWaitlist={leaveWaitlist}
                  onGoToExplore={() => setMemberTab('schedule')}
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
                  onGoToSchedule={() => setMemberTab('schedule')}
                  showToast={showToast}
                />
              )}
            </>
          )}

          {role === 'instructor' && currentUser.role === 'instructor' && (
            <InstructorView sessions={sessions} showToast={showToast} user={currentUser} isVi={isVi} />
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
              <div className="demo-account-row">
                <div className="demo-role-badge member">
                  <LayoutDashboard style={{ width: 13, height: 13 }} />
                  <span>{t('Hội viên (Member):', 'Member Role:')}</span>
                </div>
                <div className="demo-credentials">
                  <code>jordan@fitpulse.com</code> / <code>123456</code>
                </div>
              </div>

              <div className="demo-account-row">
                <div className="demo-role-badge instructor">
                  <Users style={{ width: 13, height: 13 }} />
                  <span>{t('Huấn luyện viên (Coach):', 'Instructor Role:')}</span>
                </div>
                <div className="demo-credentials">
                  <code>maya@fitpulse.com</code> / <code>123456</code>
                </div>
              </div>

              <div className="demo-account-row">
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
  bookedSessions: BookedSession[]
  isVi: boolean
  user: User
  creditsLeft: number
  onGoToProfile: () => void
  onGoToMySchedule?: () => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<('morning' | 'afternoon' | 'evening')[]>([])

  const toggleTimeSlot = (slot: 'morning' | 'afternoon' | 'evening') => {
    setSelectedTimeSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    )
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Multi-dimensional filtering: Day + Discipline + Multi-choice Time Slots + Search Query
  const filtered = useMemo(() => {
    return sessions.filter(s => {
      // 1. Day filter
      if (s.day !== activeDay) return false

      // 2. Discipline filter
      if (filter !== 'All' && s.discipline !== filter) return false

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
  }, [sessions, activeDay, filter, selectedTimeSlots, searchQuery])
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
              <p>{copy.week}</p>
            </div>
            <button
              className="button button-ghost"
              onClick={() => setActiveDay('Mon')}
              title={isVi ? 'Trở về ngày đầu tuần' : 'Jump to start of week'}
            >
              <CalendarDays /> {copy.thisWeek}
            </button>
          </div>

          <div className="day-tabs">
            {days.map(day => (
              <button key={day} className={day === activeDay ? 'selected' : ''} onClick={() => setActiveDay(day)}>
                <span>{isVi ? DAY_LABELS_SHORT[day] : day}</span>
                <strong>{14 + days.indexOf(day)}</strong>
              </button>
            ))}
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
                placeholder={isVi ? 'Tìm theo tên ca tập hoặc HLV (ví dụ: Maya, Reformer, Flow, HIIT...)' : 'Search by class or coach (e.g. Maya, Reformer, Flow, HIIT...)'}
                className="search-input"
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery('')} aria-label="Clear search">
                  <X style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>

            {/* Filter Rows: Disciplines & Time Slots */}
            <div className="filter-controls-row">
              {/* Discipline Pills */}
              <div className="filter-row">
                {disciplinePills.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFilter(item.id)}
                    className={`filter-pill ${filter === item.id ? 'selected' : ''}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Multi-choice Time Slot Pills (No detailed hours, supports selecting multiple slots) */}
              <div className="time-filter-row">
                <button
                  type="button"
                  onClick={() => setSelectedTimeSlots([])}
                  className={`filter-pill filter-pill-time ${selectedTimeSlots.length === 0 || selectedTimeSlots.length === 3 ? 'selected' : ''}`}
                >
                  {isVi ? 'Cả ngày' : 'All day'}
                </button>

                {([
                  { id: 'morning' as const, label: isVi ? '🌅 Sáng' : '🌅 Morning' },
                  { id: 'afternoon' as const, label: isVi ? '☀️ Chiều' : '☀️ Afternoon' },
                  { id: 'evening' as const, label: isVi ? '🌙 Tối' : '🌙 Evening' },
                ]).map(item => {
                  const isSelected = selectedTimeSlots.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleTimeSlot(item.id)}
                      className={`filter-pill filter-pill-time ${isSelected ? 'selected' : ''}`}
                      title={isVi ? `Bấm để chọn / bỏ chọn khung giờ ${item.label}` : `Click to toggle ${item.label}`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="session-list">
            {filtered.map(session => {
              const isBooked = bookedSessions.some(b => b.sessionId === session.id && b.status === 'confirmed')
              const isWaitlisted = bookedSessions.some(b => b.sessionId === session.id && b.status === 'waitlist')
              return (
                <SessionRow
                  key={session.id}
                  session={session}
                  onSelect={onSelect}
                  onJoinWaitlist={onJoinWaitlist}
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
                  onClick={() => { setSearchQuery(''); setFilter('All'); setSelectedTimeSlots([]) }}
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
  isVi,
  isBooked,
  isWaitlisted,
}: {
  session: Session
  onSelect: (s: Session) => void
  onJoinWaitlist: (s: Session) => void
  isVi: boolean
  isBooked: boolean
  isWaitlisted: boolean
}) {
  const left = session.capacity - session.booked
  const full = left <= 0

  return (
    <div className="session-row">
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
        <button className="button button-booked" disabled>
          {isVi ? 'Đã đặt' : 'Booked'}
        </button>
      ) : isWaitlisted ? (
        <button className="button button-waitlisted" disabled>
          {isVi ? 'Hàng chờ #1' : 'Waitlist #1'}
        </button>
      ) : full ? (
        <button
          className="button button-waitlist"
          onClick={() => onJoinWaitlist(session)}
          title={isVi ? 'Đăng ký vào danh sách chờ' : 'Join waitlist queue'}
        >
          {isVi ? 'Hàng chờ' : 'Waitlist'} <ArrowUpRight />
        </button>
      ) : (
        <button
          className="button button-dark"
          onClick={() => onSelect(session)}
        >
          {isVi ? 'Đặt ca' : 'Book'} <ArrowUpRight />
        </button>
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
  onCancel,
  onLeaveWaitlist,
  onGoToExplore,
  isVi,
  showToast,
}: {
  bookedSessions: BookedSession[]
  onCancel: (bookedId: number, sessionId: number, title: string) => void
  onLeaveWaitlist: (bookedId: number, title: string) => void
  onGoToExplore: () => void
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
            {bookedSessions.map(item => (
              <div className="booked-card" key={item.id}>
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
                      onClick={() => onLeaveWaitlist(item.id, getSessionTitle(item, isVi))}
                      style={{ color: '#e27d78', borderColor: 'rgba(226, 125, 120, .3)' }}
                      title={isVi ? 'Rời danh sách chờ' : 'Leave waitlist queue'}
                    >
                      <Trash2 style={{ width: 13, height: 13 }} />
                      <span>{isVi ? 'Rời hàng chờ' : 'Leave waitlist'}</span>
                    </button>
                  ) : (
                    <button
                      className="button button-ghost"
                      onClick={() => onCancel(item.id, item.sessionId, getSessionTitle(item, isVi))}
                      style={{ color: '#e27d78', borderColor: 'rgba(226, 125, 120, .3)' }}
                      title={isVi ? 'Hủy ca và hoàn trả buổi tập' : 'Cancel booking and refund credit'}
                    >
                      <Trash2 style={{ width: 13, height: 13 }} />
                      <span>{isVi ? 'Hủy ca' : 'Cancel'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
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
}: {
  user: User
  creditsLeft: number
  bookedSessions: BookedSession[]
  isVi: boolean
  onGoToSchedule: () => void
  showToast: (msg: string) => void
}) {
  const [tokenCountdown, setTokenCountdown] = useState(45)

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
                <span>{user.email} · Mã hội viên: <strong>FP-2026-8921-JD</strong></span>
                <div style={{ marginTop: 6 }}>
                  <Chip tone="green">
                    <ShieldCheck style={{ width: 12, height: 12 }} />
                    {isVi ? 'Hội viên chính thức' : 'Verified Member'}
                  </Chip>
                </div>
              </div>
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
    </>
  )
}

/* ==========================================================================
   INSTRUCTOR VIEW
   ========================================================================== */
function InstructorView({ sessions, showToast, user, isVi }: { sessions: Session[]; showToast: (m: string) => void; user: User; isVi: boolean }) {
  const [checked, setChecked] = useState<number[]>([1, 2])
  const [selectedClass, setSelectedClass] = useState(sessions[0])
  const roster = [
    { name: 'Jordan Davis', initials: 'JD', time: 'Yesterday, 18:42', status: checked.includes(1) },
    { name: 'Sofia Patel', initials: 'SP', time: 'Yesterday, 17:08', status: checked.includes(2) },
    { name: 'Marcus Lee', initials: 'ML', time: 'Yesterday, 16:54', status: checked.includes(3) },
    { name: 'Emma Wilson', initials: 'EW', time: 'Yesterday, 16:21', status: checked.includes(4) }
  ]

  return (
    <>
      <PageHeader
        eyebrow={isVi ? 'Thứ Ba, ngày 15 tháng 10 năm 2026' : 'Tuesday, October 15, 2026'}
        title={isVi ? 'Trung tâm điều phối Huấn luyện viên' : 'Coach command center.'}
        description={isVi ? `Chào buổi sáng, ${user.name}. Đây là lịch giảng dạy hôm nay của bạn.` : `Good morning, ${user.name}. Here's your teaching schedule.`}
        action={<button className="button button-primary"><Plus /> {isVi ? 'Thêm ghi chú' : 'Add note'}</button>}
      />
      <div className="instructor-layout">
        <section className="class-list-panel">
          <div className="section-heading">
            <div>
              <h2>{isVi ? 'Lịch dạy hôm nay' : "Today's schedule"}</h2>
              <p>3 {isVi ? 'ca học' : 'classes'} · 21 {isVi ? 'học viên tham gia' : 'total participants'}</p>
            </div>
          </div>
          {sessions.filter(s => s.instructor === 'Maya Chen').map(s => (
            <button
              key={s.id}
              className={`class-card ${selectedClass.id === s.id ? 'active' : ''}`}
              onClick={() => setSelectedClass(s)}
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
          ))}
          <div className="next-up">
            <span className="eyebrow">{isVi ? 'CA TIẾP THEO' : 'NEXT UP'}</span>
            <strong>{isVi ? 'Pilates Cơ lõi & Kiểm soát' : 'Core & Control'}</strong>
            <p>{isVi ? 'Bắt đầu sau 2h 14m · Phòng Reformer' : 'Starts in 2h 14m · Reformer Studio'}</p>
          </div>
        </section>

        <section className="roster-panel">
          <div className="section-heading">
            <div>
              <div className="eyebrow accent-eyebrow">{isVi ? 'DANH SÁCH HỌC VIÊN' : 'LIVE ROSTER'}</div>
              <h2>{getSessionTitle(selectedClass, isVi)}</h2>
              <p>{selectedClass.time} · {formatRoom(selectedClass.room, isVi)}</p>
            </div>
            <Chip tone="green"><span className="pulse-dot" /> {selectedClass.booked} {isVi ? 'đã đặt' : 'booked'}</Chip>
          </div>

          <div className="roster-progress">
            <span>{isVi ? 'Tiến độ điểm danh' : 'Attendance'}</span>
            <strong>{checked.length} / {roster.length} {isVi ? 'đã có mặt' : 'checked in'}</strong>
            <div className="progress"><i style={{ width: `${(checked.length / roster.length) * 100}%` }} /></div>
          </div>

          <div className="roster-list">
            {roster.map((person, index) => (
              <div className="roster-row" key={person.name}>
                <div className={`avatar avatar-${index}`}>{person.initials}</div>
                <div className="roster-name">
                  <strong>{person.name}</strong>
                  <span>{isVi ? 'Đã đặt' : 'Booked'} {person.time}</span>
                </div>
                <button
                  className={`attendance ${person.status ? 'present' : ''}`}
                  onClick={() => {
                    setChecked(old => old.includes(index + 1) ? old.filter(i => i !== index + 1) : [...old, index + 1])
                    showToast(person.status ? `${person.name} ${isVi ? 'chuyển sang vắng mặt' : 'marked as no-show'}.` : `${person.name} ${isVi ? 'đã điểm danh thành công' : 'checked in'}.`)
                  }}
                >
                  {person.status ? <><Check /> {isVi ? 'Đã điểm danh' : 'Checked in'}</> : (isVi ? 'Điểm danh' : 'Check in')}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
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
        eyebrow={isVi ? 'Tổng quan vận hành · Tháng 10, 2026' : 'Operations overview · October 2026'}
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

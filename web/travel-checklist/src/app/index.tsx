import { createClient } from "@supabase/supabase-js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import "react-native-url-polyfill/auto";

type Screen = "home" | "trip";
type TripTab = "personal" | "shared";
type AddScope = "personal" | "common" | "shared";
type DatePickerTarget = "createStart" | "createEnd" | "editStart" | "editEnd";

type Member = {
  id: string;
  name: string;
  initials: string;
  color: string;
  userId?: string;
};

type PersonalTask = {
  id: string;
  category: string;
  title: string;
  memo?: string;
  done: boolean;
};

type SharedTask = {
  id: string;
  category: string;
  title: string;
  memo?: string;
  done: boolean;
  ownerId: string | null;
};

type TravelGroup = {
  id: string;
  code: string;
  ownerId?: string;
  title: string;
  destination: string;
  weather: string;
  startDate: string;
  endDate: string;
  maxMembers: number;
  members: Member[];
  personalTasks: PersonalTask[];
  commonTasks: PersonalTask[];
  sharedTasks: SharedTask[];
};

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

const supabase =
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

type DbGroup = {
  id: string;
  code: string;
  owner_id: string;
  title: string;
  destination: string;
  weather: string | null;
  start_date: string;
  end_date: string;
  max_members: number;
  created_at: string;
};

type DbMember = {
  id: string;
  group_id: string;
  user_id: string;
  display_name: string;
  joined_at: string;
};

type DbChecklistItem = {
  id: string;
  group_id: string;
  scope: AddScope;
  category: string;
  title: string;
  memo: string | null;
  done: boolean;
  owner_member_id: string | null;
  created_by: string;
  completed_by: string | null;
  created_at: string;
  updated_at: string;
};

function fromDbDate(value: string | null | undefined) {
  return (value ?? "").replace(/-/g, ".");
}

function toDbDate(value: string) {
  return value.replace(/\./g, "-");
}

function readableDbError(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: string }).message ?? "");
  }

  return "잠시 후 다시 시도해 주세요.";
}

const COLORS = {
  background: "#F4F6FA",
  white: "#FFFFFF",
  ink: "#172033",
  sub: "#697386",
  muted: "#A3ACBB",
  line: "#E5E9F0",
  navy: "#18284B",
  navy2: "#263B70",
  blue: "#4A78FF",
  blueSoft: "#EEF3FF",
  peach: "#FF8564",
  peachSoft: "#FFF0EB",
  purple: "#8869F4",
  purpleSoft: "#F2EEFF",
  green: "#27AE7B",
  greenSoft: "#E9F8F1",
  yellow: "#F6B941",
  yellowSoft: "#FFF7E3",
};

const MEMBER_COLORS = [
  "#4A78FF",
  "#FF8564",
  "#8869F4",
  "#27AE7B",
  "#F6B941",
  "#34A6B8",
];
const PERSONAL_CATEGORIES = ["서류", "의류", "세면/건강", "전자기기"];
const SHARED_CATEGORIES = ["공용 짐", "위생용품", "전자기기", "건강/안전"];
const COMMON_CATEGORIES = ["예약/결제", "교통", "일정", "서류"];

const CATEGORY_TONES: Record<
  string,
  { backgroundColor: string; color: string }
> = {
  서류: { backgroundColor: "#EEF3FF", color: "#4778FF" },
  의류: { backgroundColor: "#FFF0EB", color: "#E56D50" },
  "세면/건강": { backgroundColor: "#E9F8F1", color: "#24855F" },
  전자기기: { backgroundColor: "#F2EEFF", color: "#7659D1" },
  "공용 짐": { backgroundColor: "#FFF7E3", color: "#B57A12" },
  위생용품: { backgroundColor: "#FFF0F4", color: "#C85F7F" },
  "건강/안전": { backgroundColor: "#E9F8F1", color: "#24855F" },
  "예약/결제": { backgroundColor: "#FFF7E3", color: "#B57A12" },
  교통: { backgroundColor: "#EEF3FF", color: "#4778FF" },
  일정: { backgroundColor: "#F2EEFF", color: "#7659D1" },
};

function getCategoryTone(category: string) {
  return (
    CATEGORY_TONES[category] ?? {
      backgroundColor: "#F2F4F8",
      color: "#687386",
    }
  );
}

const ME: Member = {
  id: "me",
  name: "나",
  initials: "나",
  color: "#4A78FF",
};

const DEFAULT_PERSONAL: PersonalTask[] = [
  {
    id: "p-passport",
    category: "서류",
    title: "여권 · 사본 사진",
    done: false,
  },
  {
    id: "p-booking",
    category: "서류",
    title: "항공권 및 숙소 예약 확인서",
    done: false,
  },
  {
    id: "p-outfit",
    category: "의류",
    title: "여행지 날씨에 맞는 겉옷",
    done: false,
  },
  { id: "p-battery", category: "전자기기", title: "보조배터리", done: false },
  {
    id: "p-medicine",
    category: "세면/건강",
    title: "개인 상비약",
    done: false,
  },
];

const DEFAULT_SHARED: SharedTask[] = [
  {
    id: "s-filter",
    category: "위생용품",
    title: "샤워필터",
    done: false,
    ownerId: null,
  },
  {
    id: "s-adapter",
    category: "전자기기",
    title: "멀티 어댑터",
    done: false,
    ownerId: null,
  },
  {
    id: "s-umbrella",
    category: "공용 짐",
    title: "접이식 우산",
    done: false,
    ownerId: null,
  },
  {
    id: "s-firstaid",
    category: "건강/안전",
    title: "공용 상비약",
    done: false,
    ownerId: null,
  },
];

const DEFAULT_COMMON: PersonalTask[] = [
  { id: "c-stay", category: "예약/결제", title: "숙소 예약", done: false },
  { id: "c-flight", category: "예약/결제", title: "항공권 예약", done: false },
  {
    id: "c-route",
    category: "교통",
    title: "공항 이동 방법 확인",
    done: false,
  },
  { id: "c-plan", category: "일정", title: "여행 일정 공유", done: false },
];

const INITIAL_GROUPS: TravelGroup[] = [
  {
    id: "osaka-2026",
    code: "OSK-0404",
    title: "오사카 벚꽃 여행",
    destination: "일본 오사카",
    weather: "12°–19° · 맑음",
    startDate: "2026.04.04",
    endDate: "2026.04.07",
    maxMembers: 4,
    members: [
      ME,
      { id: "jiwon", name: "지원", initials: "지", color: "#FF8564" },
      { id: "minsu", name: "민수", initials: "민", color: "#8869F4" },
    ],
    personalTasks: [
      { id: "op-1", category: "서류", title: "여권 · 사본 사진", done: true },
      {
        id: "op-2",
        category: "서류",
        title: "항공권 및 숙소 예약 확인서",
        done: false,
      },
      {
        id: "op-3",
        category: "의류",
        title: "벚꽃 시즌용 얇은 겉옷",
        done: false,
      },
      { id: "op-4", category: "세면/건강", title: "개인 상비약", done: true },
      { id: "op-5", category: "전자기기", title: "보조배터리", done: false },
    ],
    commonTasks: [
      { id: "c-stay", category: "예약/결제", title: "숙소 예약", done: true },
      {
        id: "c-flight",
        category: "예약/결제",
        title: "항공권 예약",
        done: false,
      },
      {
        id: "c-route",
        category: "교통",
        title: "공항 이동 방법 확인",
        done: false,
      },
      { id: "c-plan", category: "일정", title: "여행 일정 공유", done: false },
    ],
    sharedTasks: [
      {
        id: "os-1",
        category: "위생용품",
        title: "샤워필터",
        done: false,
        ownerId: "jiwon",
      },
      {
        id: "os-2",
        category: "전자기기",
        title: "멀티 어댑터",
        done: true,
        ownerId: "me",
      },
      {
        id: "os-3",
        category: "건강/안전",
        title: "공용 상비약",
        done: false,
        ownerId: null,
      },
      {
        id: "os-4",
        category: "공용 짐",
        title: "접이식 우산",
        done: false,
        ownerId: "minsu",
      },
    ],
  },
  {
    id: "taipei-2026",
    code: "TPE-0515",
    title: "타이베이 먹방 여행",
    destination: "대만 타이베이",
    weather: "22°–27° · 간헐적 비",
    startDate: "2026.05.15",
    endDate: "2026.05.18",
    maxMembers: 2,
    members: [ME],
    personalTasks: [
      { id: "tp-1", category: "서류", title: "여권 · 사본 사진", done: false },
      { id: "tp-2", category: "전자기기", title: "보조배터리", done: false },
      {
        id: "tp-3",
        category: "기타",
        title: "트래블카드 또는 환전",
        done: false,
      },
    ],
    commonTasks: [
      { id: "c-stay", category: "예약/결제", title: "숙소 예약", done: true },
      {
        id: "c-flight",
        category: "예약/결제",
        title: "항공권 예약",
        done: false,
      },
      {
        id: "c-route",
        category: "교통",
        title: "공항 이동 방법 확인",
        done: false,
      },
      { id: "c-plan", category: "일정", title: "여행 일정 공유", done: false },
    ],
    sharedTasks: [
      {
        id: "ts-1",
        category: "위생용품",
        title: "샤워필터",
        done: false,
        ownerId: "me",
      },
      {
        id: "ts-2",
        category: "공용 짐",
        title: "접이식 우산",
        done: false,
        ownerId: null,
      },
    ],
  },
];

function cloneDefaultPersonal() {
  return DEFAULT_PERSONAL.map((task, index) => ({
    ...task,
    id: `p-${Date.now()}-${index}`,
  }));
}

function cloneDefaultCommon() {
  return DEFAULT_COMMON.map((task, index) => ({
    ...task,
    id: `c-${Date.now()}-${index}`,
  }));
}

function cloneDefaultShared() {
  return DEFAULT_SHARED.map((task, index) => ({
    ...task,
    id: `s-${Date.now()}-${index}`,
  }));
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function parseAppDate(value: string) {
  const match = value.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})$/);
  if (!match) return new Date();

  const parsed = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatAppDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function isSameAppDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getCalendarCells(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const startOffset = new Date(year, month, 1).getDay();
  const dayCount = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = Array.from({ length: 42 }, () => null);

  for (let day = 1; day <= dayCount; day += 1) {
    cells[startOffset + day - 1] = new Date(year, month, day);
  }

  return cells;
}

function groupByCategory<T extends { category: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((grouped, item) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
    return grouped;
  }, {});
}

function createCode(destination: string) {
  const letters = destination
    .replace(/[^A-Za-z가-힣]/g, "")
    .slice(0, 3)
    .toUpperCase();

  const random = Math.floor(1000 + Math.random() * 9000);
  return `${letters || "TRIP"}-${random}`;
}

function weatherForDestination(destination: string) {
  const place = destination.trim().toLowerCase();

  if (!place) return "여행지를 입력하면 예상 날씨가 자동 표시됩니다.";
  if (/(일본|도쿄|오사카|후쿠오카|삿포로|교토)/.test(place))
    return "계절별 일교차 큼 · 여행 전 실제 예보 확인";
  if (/(대만|타이베이|가오슝)/.test(place))
    return "따뜻하고 비가 잦음 · 우산 권장";
  if (/(태국|방콕|치앙마이|푸켓)/.test(place))
    return "고온다습 · 우기 및 스콜 확인";
  if (/(베트남|다낭|하노이|호치민)/.test(place))
    return "지역별 우기 차이 · 얇은 옷 권장";
  if (/(싱가포르|말레이시아|쿠알라룸푸르)/.test(place))
    return "연중 고온다습 · 실내 냉방 대비";
  if (/(필리핀|세부|보라카이)/.test(place)) return "고온다습 · 태풍 시기 확인";
  if (/(인도네시아|발리)/.test(place)) return "건기·우기 확인 · 자외선 차단";
  if (/(중국|상하이|베이징)/.test(place))
    return "도시별 기온 차이 큼 · 여행 전 예보 확인";
  if (/(홍콩|마카오)/.test(place)) return "습도 높음 · 실내 냉방 대비";
  if (/(미국|뉴욕|로스앤젤레스|하와이)/.test(place))
    return "도시별 기후 차이 큼 · 여행 전 예보 확인";
  if (
    /(영국|런던|프랑스|파리|이탈리아|로마|스페인|바르셀로나|독일|베를린|유럽)/.test(
      place,
    )
  )
    return "일교차와 비 대비 · 겉옷 권장";
  if (/(호주|시드니|뉴질랜드|오클랜드)/.test(place))
    return "남반구 계절 확인 · 겉옷 준비";
  return "계절별 기후 확인 필요 · 출발 전 실제 예보 확인";
}

function Avatar({ member, size = 30 }: { member: Member; size?: number }) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: member.color,
        },
      ]}
    >
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
        style={[
          styles.avatarText,
          {
            width: size - 4,
            fontSize:
              member.name.length >= 4
                ? Math.max(8, size * 0.25)
                : Math.max(9, size * 0.31),
          },
        ]}
      >
        {member.name}
      </Text>
    </View>
  );
}

function StatBadge({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  tone: "blue" | "peach" | "purple";
}) {
  const toneStyle =
    tone === "blue"
      ? styles.statToneBlue
      : tone === "peach"
        ? styles.statTonePeach
        : styles.statTonePurple;

  const iconStyle =
    tone === "blue"
      ? styles.statIconBlue
      : tone === "peach"
        ? styles.statIconPeach
        : styles.statIconPurple;

  return (
    <View style={[styles.statBadge, toneStyle]}>
      <Text style={[styles.statBadgeIcon, iconStyle]}>{icon}</Text>
      <View style={styles.statBadgeCopy}>
        <Text style={styles.statBadgeLabel}>{label}</Text>
        <Text style={styles.statBadgeValue}>{value}</Text>
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A7AFBE"
        keyboardType={keyboardType}
        style={styles.fieldInput}
      />
    </View>
  );
}

function DateField({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable onPress={onPress} style={styles.dateFieldButton}>
        <Text
          style={[styles.dateFieldText, !value && styles.dateFieldPlaceholder]}
        >
          {value || "날짜 선택"}
        </Text>
        <Text style={styles.dateFieldIcon}>⌄</Text>
      </Pressable>
    </View>
  );
}

function ChecklistCheck({
  done,
  onPress,
}: {
  done: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      style={[styles.checkBox, done && styles.checkBoxDone]}
    >
      <Text style={styles.checkBoxText}>{done ? "✓" : ""}</Text>
    </Pressable>
  );
}

export default function TravelChecklistApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [groups, setGroups] = useState<TravelGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TripTab>("personal");
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupError, setSetupError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  const [createTitle, setCreateTitle] = useState("");
  const [createDestination, setCreateDestination] = useState("");
  const [createWeather, setCreateWeather] = useState("");
  const [createStartDate, setCreateStartDate] = useState("");
  const [createEndDate, setCreateEndDate] = useState("");
  const [createMaxMembers, setCreateMaxMembers] = useState("2");

  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("나");

  const [editTitle, setEditTitle] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editWeather, setEditWeather] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editMaxMembers, setEditMaxMembers] = useState("2");

  const [newTaskScope, setNewTaskScope] = useState<AddScope>("personal");
  const [newTaskCategory, setNewTaskCategory] = useState(
    PERSONAL_CATEGORIES[0],
  );
  const [newCustomCategory, setNewCustomCategory] = useState("");
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskMemo, setNewTaskMemo] = useState("");
  const [taskEditorOpen, setTaskEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{
    scope: AddScope;
    id: string;
  } | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskCategory, setEditTaskCategory] = useState("");
  const [editTaskMemo, setEditTaskMemo] = useState("");
  const [ownerPickerTaskId, setOwnerPickerTaskId] = useState<string | null>(
    null,
  );
  const [datePickerTarget, setDatePickerTarget] =
    useState<DatePickerTarget | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const activeGroup = useMemo(
    () => groups.find((group) => group.id === activeGroupId) ?? null,
    [groups, activeGroupId],
  );

  const currentMemberId = useMemo(
    () =>
      activeGroup?.members.find((member) => member.userId === authUserId)?.id ??
      null,
    [activeGroup, authUserId],
  );

  const loadGroups = useCallback(async (userId: string) => {
    if (!supabase) return;

    const { data: groupData, error: groupError } = await supabase
      .from("travel_groups")
      .select("*")
      .order("created_at", { ascending: false });

    if (groupError) {
      setSetupError(readableDbError(groupError));
      return;
    }

    const dbGroups = (groupData ?? []) as DbGroup[];
    if (dbGroups.length === 0) {
      setGroups([]);
      return;
    }

    const groupIds = dbGroups.map((group) => group.id);
    const [
      { data: memberData, error: memberError },
      { data: itemData, error: itemError },
    ] = await Promise.all([
      supabase
        .from("travel_members")
        .select("id, group_id, user_id, display_name, joined_at")
        .in("group_id", groupIds)
        .order("joined_at", { ascending: true }),
      supabase
        .from("checklist_items")
        .select("*")
        .in("group_id", groupIds)
        .order("created_at", { ascending: true }),
    ]);

    if (memberError || itemError) {
      setSetupError(readableDbError(memberError ?? itemError));
      return;
    }

    const dbMembers = (memberData ?? []) as DbMember[];
    const dbItems = (itemData ?? []) as DbChecklistItem[];

    const loadedGroups: TravelGroup[] = dbGroups.map((group) => {
      const groupMembers = dbMembers
        .filter((member) => member.group_id === group.id)
        .map((member, index) => ({
          id: member.id,
          userId: member.user_id,
          name: member.display_name,
          initials: member.display_name,
          color: MEMBER_COLORS[index % MEMBER_COLORS.length],
        }));

      const groupItems = dbItems.filter((item) => item.group_id === group.id);
      const toTask = (item: DbChecklistItem): PersonalTask => ({
        id: item.id,
        category: item.category,
        title: item.title,
        memo: item.memo ?? undefined,
        done: item.done,
      });

      return {
        id: group.id,
        ownerId: group.owner_id,
        code: group.code,
        title: group.title,
        destination: group.destination,
        weather: group.weather || "날씨 정보 없음",
        startDate: fromDbDate(group.start_date),
        endDate: fromDbDate(group.end_date),
        maxMembers: group.max_members,
        members: groupMembers,
        personalTasks: groupItems
          .filter(
            (item) => item.scope === "personal" && item.created_by === userId,
          )
          .map(toTask),
        commonTasks: groupItems
          .filter((item) => item.scope === "common")
          .map(toTask),
        sharedTasks: groupItems
          .filter((item) => item.scope === "shared")
          .map((item) => ({ ...toTask(item), ownerId: item.owner_member_id })),
      };
    });

    setGroups(loadedGroups);
    const myMember = loadedGroups
      .flatMap((group) => group.members)
      .find((member) => member.userId === userId);
    if (myMember) setProfileName(myMember.name);
    setSetupError("");
  }, []);

  useEffect(() => {
    let mounted = true;

    async function startSession() {
      if (!supabase) {
        if (mounted) {
          setSetupError(
            ".env 파일의 Supabase 주소 또는 Publishable key를 찾지 못했어요.",
          );
          setIsLoading(false);
        }
        return;
      }

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        if (mounted) {
          setSetupError(readableDbError(sessionError));
          setIsLoading(false);
        }
        return;
      }

      let user = sessionData.session?.user ?? null;
      if (!user) {
        const { data: signInData, error: signInError } =
          await supabase.auth.signInAnonymously();
        if (signInError || !signInData.user) {
          if (mounted) {
            setSetupError(readableDbError(signInError));
            setIsLoading(false);
          }
          return;
        }
        user = signInData.user;
      }

      if (!mounted) return;
      setAuthUserId(user.id);
      await loadGroups(user.id);
      if (mounted) setIsLoading(false);
    }

    void startSession();
    return () => {
      mounted = false;
    };
  }, [loadGroups]);

  useEffect(() => {
    if (!supabase || !authUserId) return;

    const channel = supabase
      .channel("travel-checklist-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "travel_groups" },
        () => void loadGroups(authUserId),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "travel_members" },
        () => void loadGroups(authUserId),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checklist_items" },
        () => void loadGroups(authUserId),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [authUserId, loadGroups]);

  function showDbError(title: string, error: unknown) {
    Alert.alert(title, readableDbError(error));
  }

  function openGroup(groupId: string) {
    setActiveGroupId(groupId);
    setActiveTab("personal");
    setScreen("trip");
  }

  function backHome() {
    setScreen("home");
    setActiveGroupId(null);
  }

  function isActiveGroupOwner() {
    return Boolean(
      activeGroup && authUserId && activeGroup.ownerId === authUserId,
    );
  }

  function confirmGroupAction(
    title: string,
    message: string,
    confirmLabel: string,
    onConfirm: () => void,
  ) {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      if (window.confirm(`${title}\n\n${message}`)) onConfirm();
      return;
    }

    Alert.alert(title, message, [
      { text: "취소", style: "cancel" },
      { text: confirmLabel, style: "destructive", onPress: onConfirm },
    ]);
  }

  async function deleteActiveGroup() {
    if (!supabase || !activeGroup || !authUserId) return;

    const { error } = await supabase.rpc("delete_travel_group", {
      p_group_id: activeGroup.id,
    });

    if (error) {
      showDbError("그룹 삭제 실패", error);
      return;
    }

    backHome();
    await loadGroups(authUserId);
  }

  function requestDeleteActiveGroup() {
    if (!isActiveGroupOwner() || !activeGroup) return;

    confirmGroupAction(
      "그룹 삭제",
      `“${activeGroup.title}” 그룹과 모든 체크리스트를 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`,
      "삭제",
      () => {
        void deleteActiveGroup();
      },
    );
  }

  async function leaveActiveGroup() {
    if (!supabase || !activeGroup || !authUserId) return;

    const { error } = await supabase.rpc("leave_travel_group", {
      p_group_id: activeGroup.id,
    });

    if (error) {
      showDbError("그룹 나가기 실패", error);
      return;
    }

    backHome();
    await loadGroups(authUserId);
  }

  function requestLeaveActiveGroup() {
    if (isActiveGroupOwner() || !activeGroup) return;

    confirmGroupAction(
      "그룹 나가기",
      `“${activeGroup.title}” 그룹에서 나갈까요?\n나가면 초대 코드로 다시 참여해야 합니다.`,
      "나가기",
      () => {
        void leaveActiveGroup();
      },
    );
  }

  function updateCreateDestination(destination: string) {
    setCreateDestination(destination);
    setCreateWeather(weatherForDestination(destination));
  }

  function updateEditDestination(destination: string) {
    setEditDestination(destination);
    setEditWeather(weatherForDestination(destination));
  }

  function valueForDateTarget(target: DatePickerTarget) {
    if (target === "createStart") return createStartDate;
    if (target === "createEnd") return createEndDate;
    if (target === "editStart") return editStartDate;
    return editEndDate;
  }

  function openDatePicker(target: DatePickerTarget) {
    setDatePickerTarget(target);
    setCalendarMonth(parseAppDate(valueForDateTarget(target)));
  }

  function selectCalendarDate(date: Date) {
    const value = formatAppDate(date);

    if (datePickerTarget === "createStart") setCreateStartDate(value);
    if (datePickerTarget === "createEnd") setCreateEndDate(value);
    if (datePickerTarget === "editStart") setEditStartDate(value);
    if (datePickerTarget === "editEnd") setEditEndDate(value);

    setDatePickerTarget(null);
  }

  function shiftCalendarMonth(direction: number) {
    setCalendarMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + direction, 1),
    );
  }

  function getCurrentProfile() {
    return {
      ...ME,
      name: profileName.trim() || "나",
      initials: profileName.trim() || "나",
    };
  }

  function openProfileSettings() {
    setProfileOpen(true);
  }

  async function saveProfileName() {
    const name = profileName.trim();
    if (!name) {
      Alert.alert("이름 입력", "그룹에서 사용할 이름을 입력해 주세요.");
      return;
    }

    if (!supabase || !authUserId) return;
    const { error } = await supabase
      .from("travel_members")
      .update({ display_name: name })
      .eq("user_id", authUserId);

    if (error) {
      showDbError("이름 저장 실패", error);
      return;
    }

    setProfileName(name);
    setProfileOpen(false);
    await loadGroups(authUserId);
  }

  function resetCreateForm() {
    setCreateTitle("");
    setCreateDestination("");
    setCreateWeather("");
    setCreateStartDate("");
    setCreateEndDate("");
    setCreateMaxMembers("2");
  }

  async function createGroup() {
    if (!supabase || !authUserId) return;

    const title = createTitle.trim();
    const destination = createDestination.trim();
    const weather = createWeather.trim() || weatherForDestination(destination);
    const startDate = createStartDate.trim();
    const endDate = createEndDate.trim();
    const maxMembers = Number.parseInt(createMaxMembers, 10);
    const displayName = profileName.trim() || "나";

    if (!title || !destination || !startDate || !endDate) {
      Alert.alert(
        "입력 확인",
        "여행 이름, 여행지, 여행 기간을 모두 입력해 주세요.",
      );
      return;
    }
    if (!Number.isFinite(maxMembers) || maxMembers < 1) {
      Alert.alert("최대 인원 확인", "최대 인원은 1명 이상으로 설정해 주세요.");
      return;
    }

    const code = createCode(destination);
    const { data: groupId, error: createError } = await supabase.rpc(
      "create_travel_group",
      {
        p_code: code,
        p_title: title,
        p_destination: destination,
        p_weather: weather,
        p_start_date: toDbDate(startDate),
        p_end_date: toDbDate(endDate),
        p_max_members: maxMembers,
        p_display_name: displayName,
      },
    );

    if (createError || !groupId) {
      showDbError("여행 만들기 실패", createError);
      return;
    }

    const defaultItems = [
      ...cloneDefaultPersonal().map((task) => ({
        ...task,
        scope: "personal" as const,
      })),
      ...cloneDefaultCommon().map((task) => ({
        ...task,
        scope: "common" as const,
      })),
      ...cloneDefaultShared().map((task) => ({
        ...task,
        scope: "shared" as const,
      })),
    ].map((task) => ({
      group_id: groupId,
      scope: task.scope,
      category: task.category,
      title: task.title,
      memo: task.memo ?? null,
      done: false,
      owner_member_id: "ownerId" in task ? task.ownerId : null,
      created_by: authUserId,
    }));

    const { error: itemError } = await supabase
      .from("checklist_items")
      .insert(defaultItems);
    if (itemError) {
      showDbError("기본 체크리스트 생성 실패", itemError);
    }

    setCreateOpen(false);
    resetCreateForm();
    await loadGroups(authUserId);
    openGroup(String(groupId));
  }

  async function joinGroup() {
    if (!supabase || !authUserId) return;

    const code = joinCode.trim().toUpperCase();
    const name = joinName.trim();
    if (!name) {
      Alert.alert("이름 입력", "그룹에서 사용할 이름을 입력해 주세요.");
      return;
    }
    if (!code) {
      Alert.alert("초대 코드 입력", "초대 코드를 입력해 주세요.");
      return;
    }

    const { data: groupId, error } = await supabase.rpc("join_travel_group", {
      p_code: code,
      p_display_name: name,
    });
    if (error || !groupId) {
      showDbError("그룹 참여 실패", error);
      return;
    }

    setProfileName(name);
    setJoinOpen(false);
    setJoinCode("");
    setJoinName("");
    await loadGroups(authUserId);
    openGroup(String(groupId));
  }

  function openInvite() {
    if (!activeGroup) return;
    setInviteOpen(true);
  }

  async function shareInvite() {
    if (!activeGroup) return;
    try {
      await Share.share({
        message: `[${activeGroup.title}] 여행 그룹 초대\n초대 코드: ${activeGroup.code}\n여행 기간: ${activeGroup.startDate} — ${activeGroup.endDate}`,
      });
    } catch {
      Alert.alert("초대 코드", activeGroup.code);
    }
  }

  function startEditTravel() {
    if (!activeGroup) return;
    setEditTitle(activeGroup.title);
    setEditDestination(activeGroup.destination);
    setEditWeather(activeGroup.weather);
    setEditStartDate(activeGroup.startDate);
    setEditEndDate(activeGroup.endDate);
    setEditMaxMembers(String(activeGroup.maxMembers));
    setEditOpen(true);
  }

  async function saveTravelInfo() {
    if (!supabase || !activeGroup || !authUserId) return;

    const title = editTitle.trim();
    const destination = editDestination.trim();
    const weather = editWeather.trim() || weatherForDestination(destination);
    const startDate = editStartDate.trim();
    const endDate = editEndDate.trim();
    const maxMembers = Number.parseInt(editMaxMembers, 10);

    if (!title || !destination || !startDate || !endDate) {
      Alert.alert(
        "입력 확인",
        "여행 이름, 여행지, 여행 기간을 모두 입력해 주세요.",
      );
      return;
    }
    if (
      !Number.isFinite(maxMembers) ||
      maxMembers < activeGroup.members.length
    ) {
      Alert.alert(
        "최대 인원 확인",
        `현재 참여 인원이 ${activeGroup.members.length}명이므로 최대 인원은 그보다 작게 설정할 수 없어요.`,
      );
      return;
    }

    const { error } = await supabase
      .from("travel_groups")
      .update({
        title,
        destination,
        weather,
        start_date: toDbDate(startDate),
        end_date: toDbDate(endDate),
        max_members: maxMembers,
      })
      .eq("id", activeGroup.id);

    if (error) {
      showDbError("여행 정보 수정 실패", error);
      return;
    }

    setEditOpen(false);
    await loadGroups(authUserId);
  }

  async function updateTask(
    taskId: string,
    values: Record<string, unknown>,
    failureTitle: string,
  ) {
    if (!supabase || !authUserId) return false;
    const { error } = await supabase
      .from("checklist_items")
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", taskId);
    if (error) {
      showDbError(failureTitle, error);
      return false;
    }
    await loadGroups(authUserId);
    return true;
  }

  async function togglePersonalTask(taskId: string) {
    const task = activeGroup?.personalTasks.find((item) => item.id === taskId);
    if (!task || !authUserId) return;
    await updateTask(
      taskId,
      { done: !task.done, completed_by: !task.done ? authUserId : null },
      "완료 상태 변경 실패",
    );
  }

  async function toggleCommonTask(taskId: string) {
    const task = activeGroup?.commonTasks.find((item) => item.id === taskId);
    if (!task || !authUserId) return;
    await updateTask(
      taskId,
      { done: !task.done, completed_by: !task.done ? authUserId : null },
      "완료 상태 변경 실패",
    );
  }

  async function toggleSharedTask(taskId: string) {
    if (!activeGroup || !authUserId || !currentMemberId) return;
    const task = activeGroup.sharedTasks.find((item) => item.id === taskId);
    if (!task) return;

    if (!task.ownerId) {
      Alert.alert(
        "담당자를 정해 주세요",
        "공용 준비물은 담당자 지정 후 완료 처리할 수 있어요.",
      );
      return;
    }
    if (task.ownerId !== currentMemberId) {
      const owner = activeGroup.members.find(
        (member) => member.id === task.ownerId,
      );
      Alert.alert(
        "담당자 확인",
        `${owner?.name ?? "담당자"}님이 준비할 항목이에요.`,
      );
      return;
    }

    await updateTask(
      taskId,
      { done: !task.done, completed_by: !task.done ? authUserId : null },
      "완료 상태 변경 실패",
    );
  }

  function openOwnerPicker(taskId: string) {
    setOwnerPickerTaskId(taskId);
  }

  async function setSharedOwner(taskId: string, ownerId: string | null) {
    const updated = await updateTask(
      taskId,
      { owner_member_id: ownerId, done: false, completed_by: null },
      "담당자 변경 실패",
    );
    if (updated) setOwnerPickerTaskId(null);
  }

  function confirmDelete(message: string, onDelete: () => void) {
    // React Native의 Alert.alert은 웹에서 동작이 일정하지 않으므로
    // 기존 그룹 삭제와 동일하게 웹에서는 window.confirm을 사용한다.
    confirmGroupAction("항목 삭제", message, "삭제", onDelete);
  }

  function deleteTask(taskId: string, message: string) {
    confirmDelete(message, () => {
      void (async () => {
        if (!supabase || !authUserId) return;

        const { data, error } = await supabase
          .from("checklist_items")
          .delete()
          .eq("id", taskId)
          .select("id");

        if (error) {
          showDbError("항목 삭제 실패", error);
          return;
        }

        // RLS 정책에 의해 DELETE가 허용되지 않으면 오류 없이 0건이
        // 반환될 수 있으므로 사용자가 원인을 알 수 있게 안내한다.
        if (!data || data.length === 0) {
          Alert.alert(
            "항목 삭제 실패",
            "삭제 권한이 없거나 이미 삭제된 항목입니다. Supabase의 checklist_items DELETE 정책을 확인해 주세요.",
          );
          return;
        }

        await loadGroups(authUserId);
      })();
    });
  }

  function removePersonalTask(taskId: string) {
    deleteTask(taskId, "개인 준비물을 삭제할까요?");
  }

  function removeCommonTask(taskId: string) {
    deleteTask(taskId, "공동 체크 항목을 삭제할까요?");
  }

  function removeSharedTask(taskId: string) {
    deleteTask(taskId, "공용 준비물을 삭제할까요?");
  }

  function openAddTask(scope: AddScope) {
    setNewTaskScope(scope);
    setNewTaskCategory(
      scope === "personal"
        ? PERSONAL_CATEGORIES[0]
        : scope === "common"
          ? COMMON_CATEGORIES[0]
          : SHARED_CATEGORIES[0],
    );
    setNewCustomCategory("");
    setShowCustomCategoryInput(false);
    setNewTaskTitle("");
    setNewTaskMemo("");
    setAddTaskOpen(true);
  }

  function openTaskEditor(scope: AddScope, task: PersonalTask | SharedTask) {
    setEditingTask({ scope, id: task.id });
    setEditTaskTitle(task.title);
    setEditTaskCategory(task.category);
    setEditTaskMemo(task.memo ?? "");
    setTaskEditorOpen(true);
  }

  async function saveTaskEdit() {
    if (!editingTask) return;
    const title = editTaskTitle.trim();
    const category = editTaskCategory.trim();
    const memo = editTaskMemo.trim();
    if (!title || !category) {
      Alert.alert("입력 확인", "카테고리와 품목명을 입력해 주세요.");
      return;
    }

    const updated = await updateTask(
      editingTask.id,
      { title, category, memo: memo || null },
      "준비물 수정 실패",
    );
    if (updated) {
      setTaskEditorOpen(false);
      setEditingTask(null);
    }
  }

  async function addTask() {
    if (!supabase || !activeGroup || !authUserId) return;
    const title = newTaskTitle.trim();
    const category = newCustomCategory.trim() || newTaskCategory;
    if (!title) {
      Alert.alert("준비물 입력", "추가할 준비물을 입력해 주세요.");
      return;
    }
    if (!category) {
      Alert.alert(
        "카테고리 입력",
        "＋ 버튼을 눌렀다면 카테고리 이름을 입력해 주세요.",
      );
      return;
    }

    const { error } = await supabase.from("checklist_items").insert({
      group_id: activeGroup.id,
      scope: newTaskScope,
      category,
      title,
      memo: newTaskMemo.trim() || null,
      done: false,
      owner_member_id: null,
      created_by: authUserId,
    });

    if (error) {
      showDbError("준비물 추가 실패", error);
      return;
    }

    setAddTaskOpen(false);
    setNewTaskTitle("");
    setNewTaskMemo("");
    setNewCustomCategory("");
    await loadGroups(authUserId);
  }

  function renderHome() {
    const nextTrip = groups[0];

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.homeScroll}
      >
        <View style={styles.homeHero}>
          <Text style={styles.homeHeroEyebrow}>MY TRIPS</Text>
          <Text style={styles.homeHeroTitle}>내 여행</Text>
          <Text style={styles.homeHeroSubtitle}>
            준비 중인 여행 {groups.length}개
          </Text>

          <Pressable
            onPress={openProfileSettings}
            style={styles.profileNameButton}
          >
            <Text style={styles.profileNameButtonText}>
              내 이름 · {getCurrentProfile().name} ›
            </Text>
          </Pressable>

          <View style={styles.homeHeroActions}>
            <Pressable
              style={styles.primaryHeroAction}
              onPress={() => setCreateOpen(true)}
            >
              <Text style={styles.primaryHeroActionText}>
                ＋ 새 여행 만들기
              </Text>
            </Pressable>
            <Pressable
              style={styles.secondaryHeroAction}
              onPress={() => setJoinOpen(true)}
            >
              <Text style={styles.secondaryHeroActionText}>코드로 참여</Text>
            </Pressable>
          </View>
        </View>

        {nextTrip ? (
          <View style={styles.quickCard}>
            <View>
              <Text style={styles.quickLabel}>NEXT TRIP</Text>
              <Text style={styles.quickTitle}>{nextTrip.title}</Text>
              <Text style={styles.quickMeta}>
                {nextTrip.startDate} — {nextTrip.endDate}
              </Text>
            </View>
            <Pressable
              onPress={() => openGroup(nextTrip.id)}
              style={styles.quickOpenButton}
            >
              <Text style={styles.quickOpenText}>열기 ›</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.homeSectionHeader}>
          <View>
            <Text style={styles.homeSectionEyebrow}>MY GROUPS</Text>
            <Text style={styles.homeSectionTitle}>내 여행 목록</Text>
          </View>
          <Text style={styles.groupCountText}>{groups.length}개</Text>
        </View>

        {groups.map((group) => {
          return (
            <Pressable
              key={group.id}
              onPress={() => openGroup(group.id)}
              style={styles.tripListCard}
            >
              <View style={styles.tripCardHeader}>
                <View style={styles.destinationPill}>
                  <Text style={styles.destinationPillText}>
                    ✦ {group.destination}
                  </Text>
                </View>
                <Text style={styles.tripCardCode}>{group.code}</Text>
              </View>

              <Text style={styles.tripCardTitle}>{group.title}</Text>
              <Text style={styles.tripCardDates}>
                {group.startDate} — {group.endDate}
              </Text>

              <View style={styles.tripInfoRow}>
                <View style={styles.tripInfoMini}>
                  <Text style={styles.tripInfoMiniIcon}>☀</Text>
                  <Text style={styles.tripInfoMiniText}>{group.weather}</Text>
                </View>
                <View style={styles.tripInfoMini}>
                  <Text style={styles.tripInfoMiniIcon}>◉</Text>
                  <Text style={styles.tripInfoMiniText}>
                    {group.members.length}/{group.maxMembers}명
                  </Text>
                </View>
              </View>

              <View style={styles.tripCardMembers}>
                <Text style={styles.tripCardMembersLabel}>멤버</Text>
                <Text numberOfLines={1} style={styles.tripCardMembersNames}>
                  {group.members.map((member) => member.name).join(" · ")}
                </Text>
                <Text style={styles.tripCardMembersCount}>
                  {group.members.length}/{group.maxMembers}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  function renderTripHeader(group: TravelGroup) {
    return (
      <>
        <View style={styles.tripTopBar}>
          <Pressable onPress={backHome} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
            <Text style={styles.backButtonLabel}>내 여행</Text>
          </Pressable>
          <View style={styles.tripTopActions}>
            <Pressable onPress={openInvite} style={styles.inviteTopButton}>
              <Text style={styles.inviteTopButtonText}>초대</Text>
            </Pressable>
            {group.ownerId === authUserId ? (
              <>
                <Pressable
                  onPress={startEditTravel}
                  style={styles.editTopButton}
                >
                  <Text style={styles.editTopButtonText}>수정</Text>
                </Pressable>
                <Pressable
                  onPress={requestDeleteActiveGroup}
                  style={styles.groupDangerTopButton}
                >
                  <Text style={styles.groupDangerTopButtonText}>삭제</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={requestLeaveActiveGroup}
                style={styles.groupDangerTopButton}
              >
                <Text style={styles.groupDangerTopButtonText}>나가기</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.tripHero}>
          <View style={styles.tripHeroTop}>
            <View style={styles.heroDestinationTag}>
              <Text style={styles.heroDestinationTagText}>
                {group.destination}
              </Text>
            </View>
            <Text style={styles.heroCode}>{group.code}</Text>
          </View>

          <Text style={styles.tripHeroTitle}>{group.title}</Text>
          <Text style={styles.tripHeroDates}>
            {group.startDate} — {group.endDate}
          </Text>

          <View style={styles.tripHeroMembers}>
            <Text style={styles.tripHeroMembersLabel}>멤버</Text>
            <Text numberOfLines={1} style={styles.tripHeroMemberNames}>
              {group.members.map((member) => member.name).join(" · ")}
            </Text>
            <Text style={styles.tripHeroMemberCount}>
              {group.members.length}/{group.maxMembers}
            </Text>
          </View>

          <View style={styles.tripHeroStats}>
            <StatBadge
              icon="☀"
              label="날씨"
              value={group.weather}
              tone="blue"
            />
          </View>
        </View>
      </>
    );
  }

  function renderPersonalTab(group: TravelGroup) {
    const done = group.personalTasks.filter((task) => task.done).length;
    const groupedTasks = groupByCategory(group.personalTasks);

    return (
      <>
        <View style={styles.tabIntroCard}>
          <View
            style={[styles.tabIntroIcon, { backgroundColor: COLORS.blueSoft }]}
          >
            <Text style={[styles.tabIntroIconText, { color: COLORS.blue }]}>
              ✓
            </Text>
          </View>
          <View style={styles.tabIntroCopy}>
            <Text style={styles.tabIntroEyebrow}>MY PACKING</Text>
            <Text style={styles.tabIntroTitle}>개인 준비물</Text>
            <Text style={styles.tabIntroText}>
              내가 직접 챙겨야 하는 물품이에요.
            </Text>
          </View>
          <View style={styles.tabIntroCount}>
            <Text style={[styles.tabIntroCountNumber, { color: COLORS.blue }]}>
              {done}
            </Text>
            <Text style={styles.tabIntroCountTotal}>
              / {group.personalTasks.length}
            </Text>
          </View>
        </View>

        {Object.entries(groupedTasks).map(([category, tasks]) => {
          const tone = getCategoryTone(category);

          return (
            <View key={category} style={styles.personalCategoryCard}>
              <View style={styles.personalCategoryHeader}>
                <View
                  style={[
                    styles.personalCategoryLabel,
                    { backgroundColor: tone.backgroundColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.personalCategoryLabelText,
                      { color: tone.color },
                    ]}
                  >
                    {category}
                  </Text>
                </View>
                <Text style={styles.personalCategoryCount}>
                  {tasks.filter((task) => task.done).length}/{tasks.length}
                </Text>
              </View>

              {tasks.map((task, index) => (
                <View
                  key={task.id}
                  style={[
                    styles.detailTaskRow,
                    index !== tasks.length - 1 && styles.taskRowBorder,
                  ]}
                >
                  <ChecklistCheck
                    done={task.done}
                    onPress={() => togglePersonalTask(task.id)}
                  />

                  <View style={styles.taskDetailContent}>
                    <Text
                      style={[
                        styles.taskTitleText,
                        task.done && styles.taskTextDone,
                      ]}
                    >
                      {task.title}
                    </Text>
                    {task.memo ? (
                      <Text style={styles.taskMemoText}>{task.memo}</Text>
                    ) : null}
                  </View>

                  <Pressable
                    onPress={() => openTaskEditor("personal", task)}
                    style={styles.taskEditButton}
                  >
                    <Text style={styles.taskEditButtonText}>수정</Text>
                  </Pressable>
                  <Pressable
                    hitSlop={8}
                    onPress={() => removePersonalTask(task.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.taskDelete}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          );
        })}

        <Pressable
          style={styles.addTaskButton}
          onPress={() => openAddTask("personal")}
        >
          <Text style={styles.addTaskButtonPlus}>＋</Text>
          <Text style={styles.addTaskButtonText}>개인 준비물 추가하기</Text>
        </Pressable>
      </>
    );
  }

  function renderSharedTab(group: TravelGroup) {
    const commonDone = group.commonTasks.filter((task) => task.done).length;
    const packingDone = group.sharedTasks.filter((task) => task.done).length;
    const sections = [
      ...group.members.map((member) => ({
        key: member.id,
        title: `${member.name} 담당`,
        tasks: group.sharedTasks.filter((task) => task.ownerId === member.id),
      })),
      {
        key: "unassigned",
        title: "담당자 미지정",
        tasks: group.sharedTasks.filter((task) => !task.ownerId),
      },
    ].filter((section) => section.tasks.length > 0);

    return (
      <>
        <View style={[styles.tabIntroCard, styles.sharedIntroCard]}>
          <View style={[styles.tabIntroIcon, { backgroundColor: "#FFDCD2" }]}>
            <Text style={[styles.tabIntroIconText, { color: COLORS.peach }]}>
              ◎
            </Text>
          </View>
          <View style={styles.tabIntroCopy}>
            <Text style={[styles.tabIntroEyebrow, { color: COLORS.peach }]}>
              GROUP SPACE
            </Text>
            <Text style={styles.tabIntroTitle}>그룹 준비</Text>
            <Text style={styles.tabIntroText}>
              같이 확인할 일과 담당자가 필요한 짐을 나눠 관리해요.
            </Text>
          </View>
        </View>

        <View style={styles.groupSectionHeader}>
          <View>
            <Text style={styles.groupSectionEyebrow}>ANYONE CAN CHECK</Text>
            <Text style={styles.groupSectionTitle}>공동 체크리스트</Text>
            <Text style={styles.groupSectionDescription}>
              숙소·항공권 예약처럼 누구나 완료 처리할 수 있어요.
            </Text>
          </View>
          <Text style={styles.groupSectionCount}>
            {commonDone}/{group.commonTasks.length}
          </Text>
        </View>

        <View style={styles.commonChecklistCard}>
          {group.commonTasks.map((task, index) => (
            <View
              key={task.id}
              style={[
                styles.detailTaskRow,
                index !== group.commonTasks.length - 1 && styles.taskRowBorder,
              ]}
            >
              <ChecklistCheck
                done={task.done}
                onPress={() => toggleCommonTask(task.id)}
              />

              <View style={styles.taskDetailContent}>
                <View
                  style={[
                    styles.taskCategoryTop,
                    {
                      backgroundColor: getCategoryTone(task.category)
                        .backgroundColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.taskCategoryTagText,
                      { color: getCategoryTone(task.category).color },
                    ]}
                  >
                    {task.category}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.taskTitleText,
                    task.done && styles.taskTextDone,
                  ]}
                >
                  {task.title}
                </Text>
                {task.memo ? (
                  <Text style={styles.taskMemoText}>{task.memo}</Text>
                ) : null}
              </View>

              <Pressable
                onPress={() => openTaskEditor("common", task)}
                style={styles.taskEditButton}
              >
                <Text style={styles.taskEditButtonText}>수정</Text>
              </Pressable>
              <Pressable
                hitSlop={8}
                onPress={() => removeCommonTask(task.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.taskDelete}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable
          style={styles.addCommonTaskButton}
          onPress={() => openAddTask("common")}
        >
          <Text style={styles.addCommonTaskButtonText}>
            ＋ 공동 체크 항목 추가
          </Text>
        </Pressable>

        <View style={styles.groupSectionDivider} />

        <View style={styles.groupSectionHeader}>
          <View>
            <Text style={styles.groupSectionEyebrow}>ONE PERSON PREPARES</Text>
            <Text style={styles.groupSectionTitle}>공용 준비물</Text>
            <Text style={styles.groupSectionDescription}>
              샤워필터처럼 한 명이 챙기면 되는 물품이에요.
            </Text>
          </View>
          <Text
            style={[styles.groupSectionCount, styles.groupSectionCountPeach]}
          >
            {packingDone}/{group.sharedTasks.length}
          </Text>
        </View>

        <View style={styles.sharedGuide}>
          <View style={styles.sharedGuideIcon}>
            <Text style={styles.sharedGuideIconText}>✦</Text>
          </View>
          <Text style={styles.sharedGuideText}>
            담당자를 직접 선택한 뒤, 담당자만 완료 체크할 수 있어요.
          </Text>
        </View>

        {sections.map((section) => (
          <View key={section.key} style={styles.ownerSectionCard}>
            <View style={styles.ownerSectionHeader}>
              <View style={styles.ownerSectionIdentity}>
                <View>
                  <Text style={styles.ownerSectionTitle}>{section.title}</Text>
                  <Text style={styles.ownerSectionSubTitle}>
                    {section.tasks.filter((task) => task.done).length}/
                    {section.tasks.length} 완료
                  </Text>
                </View>
              </View>
              <Text style={styles.ownerSectionCount}>
                {section.tasks.length}개
              </Text>
            </View>

            {section.tasks.map((task, index) => (
              <View
                key={task.id}
                style={[
                  styles.sharedDetailTaskRow,
                  index !== section.tasks.length - 1 && styles.taskRowBorder,
                ]}
              >
                <ChecklistCheck
                  done={task.done}
                  onPress={() => toggleSharedTask(task.id)}
                />

                <View style={styles.taskDetailContent}>
                  <View
                    style={[
                      styles.taskCategoryTop,
                      {
                        backgroundColor: getCategoryTone(task.category)
                          .backgroundColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.taskCategoryTagText,
                        { color: getCategoryTone(task.category).color },
                      ]}
                    >
                      {task.category}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.taskTitleText,
                      task.done && styles.taskTextDone,
                    ]}
                  >
                    {task.title}
                  </Text>
                  {task.memo ? (
                    <Text style={styles.taskMemoText}>{task.memo}</Text>
                  ) : null}
                </View>

                <View style={styles.sharedTaskActions}>
                  <Pressable
                    onPress={() => openOwnerPicker(task.id)}
                    style={[
                      styles.sharedTaskActionButton,
                      styles.sharedOwnerActionButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sharedTaskActionText,
                        styles.sharedOwnerActionText,
                      ]}
                    >
                      담당
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => openTaskEditor("shared", task)}
                    style={[
                      styles.sharedTaskActionButton,
                      styles.sharedEditActionButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sharedTaskActionText,
                        styles.sharedEditActionText,
                      ]}
                    >
                      수정
                    </Text>
                  </Pressable>
                </View>
                <Pressable
                  hitSlop={8}
                  onPress={() => removeSharedTask(task.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.taskDelete}>×</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ))}

        <Pressable
          style={[styles.addTaskButton, styles.addSharedTaskButton]}
          onPress={() => openAddTask("shared")}
        >
          <Text style={styles.addTaskButtonPlus}>＋</Text>
          <Text style={styles.addTaskButtonText}>공용 준비물 추가하기</Text>
        </Pressable>
      </>
    );
  }

  function renderTrip() {
    if (!activeGroup) {
      return (
        <View style={styles.emptyScreen}>
          <Text style={styles.emptyScreenText}>
            선택한 여행을 찾지 못했어요.
          </Text>
          <Pressable onPress={backHome} style={styles.emptyScreenButton}>
            <Text style={styles.emptyScreenButtonText}>목록으로 돌아가기</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.tripScroll}
      >
        {renderTripHeader(activeGroup)}

        <View style={styles.tripTabs}>
          {(
            [
              ["personal", "개인"],
              ["shared", "그룹"],
            ] as Array<[TripTab, string]>
          ).map(([tab, label]) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tripTab,
                activeTab === tab && styles.tripTabActive,
              ]}
            >
              <Text
                style={[
                  styles.tripTabText,
                  activeTab === tab && styles.tripTabTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === "personal" && renderPersonalTab(activeGroup)}
        {activeTab === "shared" && renderSharedTab(activeGroup)}
      </ScrollView>
    );
  }

  function renderCreateModal() {
    return (
      <Modal
        visible={createOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setDatePickerTarget(null);
          setCreateOpen(false);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={styles.modalDismiss}
            onPress={() => {
              setDatePickerTarget(null);
              setCreateOpen(false);
            }}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>CREATE TRIP GROUP</Text>
                <Text style={styles.sheetTitle}>새 여행 만들기</Text>
              </View>
              <Pressable
                style={styles.sheetClose}
                onPress={() => {
                  setDatePickerTarget(null);
                  setCreateOpen(false);
                }}
              >
                <Text style={styles.sheetCloseText}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetScroll}
            >
              <Field
                label="여행 이름"
                value={createTitle}
                onChangeText={setCreateTitle}
                placeholder="예: 오사카 벚꽃 여행"
              />
              <Field
                label="여행지 또는 나라"
                value={createDestination}
                onChangeText={updateCreateDestination}
                placeholder="예: 일본 오사카"
              />
              <View style={styles.weatherAutoCard}>
                <Text style={styles.weatherAutoLabel}>자동 예상 날씨</Text>
                <Text style={styles.weatherAutoValue}>
                  {createWeather || weatherForDestination(createDestination)}
                </Text>
              </View>

              <View style={styles.fieldRow}>
                <View style={styles.halfField}>
                  <DateField
                    label="출발일"
                    value={createStartDate}
                    onPress={() => openDatePicker("createStart")}
                  />
                </View>
                <View style={styles.halfFieldRight}>
                  <DateField
                    label="귀국일"
                    value={createEndDate}
                    onPress={() => openDatePicker("createEnd")}
                  />
                </View>
              </View>

              {(datePickerTarget === "createStart" ||
                datePickerTarget === "createEnd") &&
                renderInlineCalendar()}

              <Field
                label="최대 인원"
                value={createMaxMembers}
                onChangeText={setCreateMaxMembers}
                placeholder="예: 4"
                keyboardType="numeric"
              />

              <View style={styles.createTip}>
                <Text style={styles.createTipText}>
                  그룹을 만든 뒤 개인 준비물과 그룹 공통 준비물을 따로 관리할 수
                  있어요.
                </Text>
              </View>

              <Pressable style={styles.sheetSubmit} onPress={createGroup}>
                <Text style={styles.sheetSubmitText}>여행 그룹 만들기</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  function renderJoinModal() {
    return (
      <Modal
        visible={joinOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setJoinOpen(false);
          setJoinCode("");
          setJoinName("");
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={styles.modalDismiss}
            onPress={() => {
              setJoinOpen(false);
              setJoinCode("");
              setJoinName("");
            }}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>JOIN A TRIP GROUP</Text>
                <Text style={styles.sheetTitle}>코드로 참여하기</Text>
              </View>
              <Pressable
                style={styles.sheetClose}
                onPress={() => {
                  setJoinOpen(false);
                  setJoinCode("");
                  setJoinName("");
                }}
              >
                <Text style={styles.sheetCloseText}>×</Text>
              </Pressable>
            </View>

            <Text style={styles.joinDescription}>
              이름과 초대 코드만 입력하면 바로 그룹에 참여할 수 있어요.
            </Text>

            <Field
              label="내 이름"
              value={joinName}
              onChangeText={setJoinName}
              placeholder="예: 민주"
            />

            <Field
              label="초대 코드"
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="예: OSK-0404"
            />

            <Pressable style={styles.sheetSubmit} onPress={joinGroup}>
              <Text style={styles.sheetSubmitText}>그룹 참여하기</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  function renderInviteModal() {
    if (!activeGroup) return null;

    return (
      <Modal
        visible={inviteOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setInviteOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={styles.modalDismiss}
            onPress={() => setInviteOpen(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>INVITE MEMBERS</Text>
                <Text style={styles.sheetTitle}>그룹 초대</Text>
              </View>
              <Pressable
                style={styles.sheetClose}
                onPress={() => setInviteOpen(false)}
              >
                <Text style={styles.sheetCloseText}>×</Text>
              </Pressable>
            </View>

            <View style={styles.inviteCodePanel}>
              <View>
                <Text style={styles.inviteCodePanelLabel}>초대 코드</Text>
                <Text selectable style={styles.inviteCodePanelValue}>
                  {activeGroup.code}
                </Text>
              </View>
              <Pressable style={styles.shareInviteButton} onPress={shareInvite}>
                <Text style={styles.shareInviteButtonText}>코드 공유</Text>
              </Pressable>
            </View>

            <Text style={styles.invitePanelInfo}>
              현재 {activeGroup.members.length}명 참여 중 · 최대{" "}
              {activeGroup.maxMembers}명까지 초대할 수 있어요.
            </Text>

            <View style={styles.inviteNotice}>
              <Text style={styles.inviteNoticeText}>
                초대 코드를 공유하면 상대방이 코드로 그룹에 참여합니다.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  function renderEditModal() {
    return (
      <Modal
        visible={editOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setDatePickerTarget(null);
          setEditOpen(false);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={styles.modalDismiss}
            onPress={() => {
              setDatePickerTarget(null);
              setEditOpen(false);
            }}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>EDIT TRIP INFORMATION</Text>
                <Text style={styles.sheetTitle}>여행 정보 수정</Text>
              </View>
              <Pressable
                style={styles.sheetClose}
                onPress={() => {
                  setDatePickerTarget(null);
                  setEditOpen(false);
                }}
              >
                <Text style={styles.sheetCloseText}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetScroll}
            >
              <Field
                label="여행 이름"
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="예: 오사카 벚꽃 여행"
              />
              <Field
                label="여행지 또는 나라"
                value={editDestination}
                onChangeText={updateEditDestination}
                placeholder="예: 일본 오사카"
              />
              <View style={styles.weatherAutoCard}>
                <Text style={styles.weatherAutoLabel}>자동 예상 날씨</Text>
                <Text style={styles.weatherAutoValue}>
                  {editWeather || weatherForDestination(editDestination)}
                </Text>
              </View>

              <View style={styles.fieldRow}>
                <View style={styles.halfField}>
                  <DateField
                    label="출발일"
                    value={editStartDate}
                    onPress={() => openDatePicker("editStart")}
                  />
                </View>
                <View style={styles.halfFieldRight}>
                  <DateField
                    label="귀국일"
                    value={editEndDate}
                    onPress={() => openDatePicker("editEnd")}
                  />
                </View>
              </View>

              {(datePickerTarget === "editStart" ||
                datePickerTarget === "editEnd") &&
                renderInlineCalendar()}

              <Field
                label="최대 인원"
                value={editMaxMembers}
                onChangeText={setEditMaxMembers}
                placeholder="예: 4"
                keyboardType="numeric"
              />

              <Pressable style={styles.sheetSubmit} onPress={saveTravelInfo}>
                <Text style={styles.sheetSubmitText}>여행 정보 저장</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  function renderAddTaskModal() {
    const categories =
      newTaskScope === "personal"
        ? PERSONAL_CATEGORIES
        : newTaskScope === "common"
          ? COMMON_CATEGORIES
          : SHARED_CATEGORIES;

    const itemLabel = newTaskScope === "common" ? "체크 항목" : "준비물";

    function selectScope(scope: AddScope) {
      setNewTaskScope(scope);
      setNewTaskCategory(
        scope === "personal"
          ? PERSONAL_CATEGORIES[0]
          : scope === "common"
            ? COMMON_CATEGORIES[0]
            : SHARED_CATEGORIES[0],
      );
      setNewCustomCategory("");
      setShowCustomCategoryInput(false);
    }

    return (
      <Modal
        visible={addTaskOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setAddTaskOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={styles.modalDismiss}
            onPress={() => setAddTaskOpen(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>NEW CHECKLIST ITEM</Text>
                <Text style={styles.sheetTitle}>준비물 추가</Text>
              </View>
              <Pressable
                style={styles.sheetClose}
                onPress={() => setAddTaskOpen(false)}
              >
                <Text style={styles.sheetCloseText}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.addTaskFormScroll}
            >
              <View style={[styles.addTaskSection, styles.addTaskSectionFirst]}>
                <Text style={styles.addTaskSectionLabel}>구분</Text>
                <View style={styles.scopeSwitch}>
                  <Pressable
                    style={[
                      styles.scopeButton,
                      newTaskScope === "personal" && styles.scopeButtonActive,
                    ]}
                    onPress={() => selectScope("personal")}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.scopeButtonText,
                        newTaskScope === "personal" &&
                          styles.scopeButtonTextActive,
                      ]}
                    >
                      개인 준비물
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.scopeButton,
                      newTaskScope === "common" && styles.scopeButtonActive,
                    ]}
                    onPress={() => selectScope("common")}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.scopeButtonText,
                        newTaskScope === "common" &&
                          styles.scopeButtonTextActive,
                      ]}
                    >
                      공동 체크
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.scopeButton,
                      newTaskScope === "shared" && styles.scopeButtonActive,
                    ]}
                    onPress={() => selectScope("shared")}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.scopeButtonText,
                        newTaskScope === "shared" &&
                          styles.scopeButtonTextActive,
                      ]}
                    >
                      공용 준비물
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.addTaskSection}>
                <Text style={styles.addTaskSectionLabel}>카테고리</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryOptionScroll}
                >
                  {categories.map((category) => (
                    <Pressable
                      key={category}
                      onPress={() => {
                        setNewTaskCategory(category);
                        setNewCustomCategory("");
                        setShowCustomCategoryInput(false);
                      }}
                      style={[
                        styles.categoryOption,
                        !showCustomCategoryInput &&
                          newTaskCategory === category &&
                          styles.categoryOptionActive,
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.categoryOptionText,
                          !showCustomCategoryInput &&
                            newTaskCategory === category &&
                            styles.categoryOptionTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  ))}

                  <Pressable
                    onPress={() => {
                      setNewTaskCategory("");
                      setNewCustomCategory("");
                      setShowCustomCategoryInput(true);
                    }}
                    style={[
                      styles.categoryOption,
                      styles.addCategoryOption,
                      showCustomCategoryInput && styles.addCategoryOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.addCategoryOptionText,
                        showCustomCategoryInput &&
                          styles.addCategoryOptionTextActive,
                      ]}
                    >
                      ＋
                    </Text>
                  </Pressable>
                </ScrollView>

                {showCustomCategoryInput ? (
                  <TextInput
                    value={newCustomCategory}
                    onChangeText={setNewCustomCategory}
                    placeholder="카테고리 이름 입력"
                    placeholderTextColor="#A7AFBE"
                    style={styles.customCategoryInput}
                    autoFocus
                  />
                ) : null}
              </View>

              <View style={styles.addTaskSection}>
                <Text style={styles.addTaskSectionLabel}>{itemLabel}</Text>
                <TextInput
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
                  placeholder="예: 여행용 압축팩"
                  placeholderTextColor="#A7AFBE"
                  style={styles.addTaskItemInput}
                />
              </View>

              <View style={styles.addTaskSection}>
                <Text style={styles.addTaskSectionLabel}>
                  메모 <Text style={styles.optionalLabel}>선택</Text>
                </Text>
                <TextInput
                  value={newTaskMemo}
                  onChangeText={setNewTaskMemo}
                  placeholder="예: 기내용 가방에 넣기"
                  placeholderTextColor="#A7AFBE"
                  style={styles.addTaskMemoInput}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <Pressable style={styles.sheetSubmit} onPress={addTask}>
                <Text style={styles.sheetSubmitText}>체크리스트에 추가</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  function renderInlineCalendar() {
    if (!datePickerTarget) return null;

    const selectedDate = parseAppDate(valueForDateTarget(datePickerTarget));
    const monthCells = getCalendarCells(calendarMonth);
    const monthTitle = `${calendarMonth.getFullYear()}년 ${calendarMonth.getMonth() + 1}월`;
    const pickerTitle =
      datePickerTarget === "createStart" || datePickerTarget === "editStart"
        ? "출발일 선택"
        : "귀국일 선택";

    return (
      <View style={styles.inlineCalendarCard}>
        <View style={styles.inlineCalendarHeader}>
          <View>
            <Text style={styles.calendarEyebrow}>DATE PICKER</Text>
            <Text style={styles.inlineCalendarTitle}>{pickerTitle}</Text>
          </View>
          <Pressable
            onPress={() => setDatePickerTarget(null)}
            style={styles.calendarClose}
          >
            <Text style={styles.calendarCloseText}>×</Text>
          </Pressable>
        </View>

        <View style={styles.calendarMonthRow}>
          <Pressable
            onPress={() => shiftCalendarMonth(-1)}
            style={styles.calendarArrow}
          >
            <Text style={styles.calendarArrowText}>‹</Text>
          </Pressable>
          <Text style={styles.calendarMonthText}>{monthTitle}</Text>
          <Pressable
            onPress={() => shiftCalendarMonth(1)}
            style={styles.calendarArrow}
          >
            <Text style={styles.calendarArrowText}>›</Text>
          </Pressable>
        </View>

        <View style={styles.calendarWeekRow}>
          {WEEKDAY_LABELS.map((label, index) => (
            <Text
              key={label}
              style={[
                styles.calendarWeekText,
                index === 0 && styles.calendarSunday,
                index === 6 && styles.calendarSaturday,
              ]}
            >
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {monthCells.map((date, index) => {
            if (!date)
              return (
                <View key={`blank-${index}`} style={styles.calendarCell} />
              );

            const selected = isSameAppDate(date, selectedDate);
            const today = isSameAppDate(date, new Date());
            const dayOfWeek = date.getDay();

            return (
              <Pressable
                key={formatAppDate(date)}
                onPress={() => selectCalendarDate(date)}
                style={[
                  styles.calendarCell,
                  selected && styles.calendarCellSelected,
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    dayOfWeek === 0 && styles.calendarSunday,
                    dayOfWeek === 6 && styles.calendarSaturday,
                    selected && styles.calendarDayTextSelected,
                    today && !selected && styles.calendarTodayText,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.inlineCalendarHint}>
          날짜를 누르면 바로 적용됩니다.
        </Text>
      </View>
    );
  }

  function renderProfileModal() {
    return (
      <Modal
        visible={profileOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={styles.modalDismiss}
            onPress={() => setProfileOpen(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>MY PROFILE</Text>
                <Text style={styles.sheetTitle}>내 이름 설정</Text>
              </View>
              <Pressable
                style={styles.sheetClose}
                onPress={() => setProfileOpen(false)}
              >
                <Text style={styles.sheetCloseText}>×</Text>
              </Pressable>
            </View>

            <Text style={styles.joinDescription}>
              이 이름은 내가 만든 여행과 코드로 참여한 그룹에서 표시됩니다.
            </Text>

            <Field
              label="내 이름"
              value={profileName}
              onChangeText={setProfileName}
              placeholder="예: 민주"
            />

            <Pressable style={styles.sheetSubmit} onPress={saveProfileName}>
              <Text style={styles.sheetSubmitText}>이름 저장</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  function renderTaskEditorModal() {
    if (!editingTask) return null;

    const titleLabel = editingTask.scope === "common" ? "체크 항목" : "준비물";

    return (
      <Modal
        visible={taskEditorOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setTaskEditorOpen(false);
          setEditingTask(null);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={styles.modalDismiss}
            onPress={() => {
              setTaskEditorOpen(false);
              setEditingTask(null);
            }}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>EDIT CHECKLIST ITEM</Text>
                <Text style={styles.sheetTitle}>준비물 수정</Text>
              </View>
              <Pressable
                style={styles.sheetClose}
                onPress={() => {
                  setTaskEditorOpen(false);
                  setEditingTask(null);
                }}
              >
                <Text style={styles.sheetCloseText}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetScroll}
            >
              <Field
                label="카테고리"
                value={editTaskCategory}
                onChangeText={setEditTaskCategory}
                placeholder="예: 전자기기"
              />
              <Field
                label={titleLabel}
                value={editTaskTitle}
                onChangeText={setEditTaskTitle}
                placeholder="품목명을 입력하세요"
              />
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>
                  메모 <Text style={styles.optionalLabel}>선택</Text>
                </Text>
                <TextInput
                  value={editTaskMemo}
                  onChangeText={setEditTaskMemo}
                  placeholder="예: 기내용 가방에 넣기"
                  placeholderTextColor="#A7AFBE"
                  style={styles.editTaskMemoInput}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <Pressable style={styles.sheetSubmit} onPress={saveTaskEdit}>
                <Text style={styles.sheetSubmitText}>수정 저장</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  function renderOwnerPickerModal() {
    const selectedTask =
      activeGroup?.sharedTasks.find((task) => task.id === ownerPickerTaskId) ??
      null;
    if (!activeGroup || !selectedTask) return null;

    return (
      <Modal
        visible={Boolean(ownerPickerTaskId)}
        transparent
        animationType="fade"
        onRequestClose={() => setOwnerPickerTaskId(null)}
      >
        <View style={styles.ownerModalOverlay}>
          <Pressable
            style={styles.ownerModalDismiss}
            onPress={() => setOwnerPickerTaskId(null)}
          />
          <View style={styles.ownerModalCard}>
            <Text style={styles.ownerModalEyebrow}>ASSIGN OWNER</Text>
            <Text style={styles.ownerModalTitle}>{selectedTask.title}</Text>
            <Text style={styles.ownerModalSubtitle}>
              담당할 사람을 선택하세요.
            </Text>

            <Pressable
              onPress={() => setSharedOwner(selectedTask.id, null)}
              style={styles.ownerChoiceRow}
            >
              <Text style={styles.ownerChoiceName}>담당자 미지정</Text>
              {!selectedTask.ownerId ? (
                <Text style={styles.ownerChoiceCheck}>✓</Text>
              ) : null}
            </Pressable>

            {activeGroup.members.map((member) => (
              <Pressable
                key={member.id}
                onPress={() => setSharedOwner(selectedTask.id, member.id)}
                style={styles.ownerChoiceRow}
              >
                <Text style={styles.ownerChoiceName}>{member.name}</Text>
                {selectedTask.ownerId === member.id ? (
                  <Text
                    style={[styles.ownerChoiceCheck, { color: member.color }]}
                  >
                    ✓
                  </Text>
                ) : null}
              </Pressable>
            ))}

            <Pressable
              onPress={() => setOwnerPickerTaskId(null)}
              style={styles.ownerCancelButton}
            >
              <Text style={styles.ownerCancelButtonText}>취소</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
        <View style={styles.loadingScreen}>
          <Text style={styles.loadingTitle}>여행 목록 불러오는 중</Text>
          <Text style={styles.loadingText}>
            그룹과 체크리스트를 동기화하고 있어요.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (setupError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
        <View style={styles.loadingScreen}>
          <Text style={styles.loadingTitle}>연결을 확인해 주세요</Text>
          <Text style={styles.loadingText}>{setupError}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => {
              if (authUserId) void loadGroups(authUserId);
            }}
          >
            <Text style={styles.retryButtonText}>다시 불러오기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.root}>
        {screen === "home" ? renderHome() : renderTrip()}
      </View>

      {renderCreateModal()}
      {renderJoinModal()}
      {renderInviteModal()}
      {renderEditModal()}
      {renderProfileModal()}
      {renderAddTaskModal()}
      {renderTaskEditorModal()}
      {renderOwnerPickerModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  loadingTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  loadingText: {
    color: COLORS.sub,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: COLORS.blue,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginTop: 18,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },

  homeScroll: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 42,
  },
  homeHero: {
    backgroundColor: COLORS.navy,
    borderRadius: 28,
    overflow: "hidden",
    padding: 21,
  },
  homeHeroEyebrow: {
    color: "#AFC7FF",
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: "900",
  },
  homeHeroTitle: {
    color: COLORS.white,
    fontSize: 27,
    lineHeight: 36,
    letterSpacing: -0.9,
    fontWeight: "900",
    marginTop: 10,
  },
  homeHeroSubtitle: {
    color: "#C1D1F7",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 9,
  },
  profileNameButton: {
    alignSelf: "flex-start",
    marginTop: 11,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  profileNameButtonText: {
    color: "#D7E5FF",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  homeHeroActions: {
    flexDirection: "row",
    marginTop: 15,
  },
  primaryHeroAction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    marginRight: 8,
  },
  primaryHeroActionText: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: "900",
  },
  secondaryHeroAction: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  secondaryHeroActionText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },

  quickCard: {
    backgroundColor: COLORS.white,
    marginTop: 13,
    borderRadius: 19,
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quickLabel: {
    color: COLORS.blue,
    fontSize: 10,
    letterSpacing: 0.95,
    fontWeight: "900",
  },
  quickTitle: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 4,
  },
  quickMeta: {
    color: COLORS.sub,
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
  },
  quickOpenButton: {
    backgroundColor: COLORS.blueSoft,
    borderRadius: 11,
    paddingVertical: 9,
    paddingHorizontal: 11,
  },
  quickOpenText: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: "900",
  },
  homeSectionHeader: {
    marginTop: 26,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  homeSectionEyebrow: {
    color: COLORS.blue,
    fontSize: 10,
    letterSpacing: 1.05,
    fontWeight: "900",
  },
  homeSectionTitle: {
    color: COLORS.ink,
    fontSize: 21,
    letterSpacing: -0.55,
    fontWeight: "900",
    marginTop: 5,
  },
  groupCountText: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 2,
  },
  tripListCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 16,
    marginBottom: 13,
  },
  tripCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  destinationPill: {
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: COLORS.purpleSoft,
  },
  destinationPillText: {
    color: COLORS.purple,
    fontSize: 10,
    fontWeight: "900",
  },
  tripCardCode: {
    color: COLORS.muted,
    fontSize: 10,
    letterSpacing: 0.7,
    fontWeight: "900",
  },
  tripCardTitle: {
    color: COLORS.ink,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.45,
    fontWeight: "900",
    marginTop: 12,
  },
  tripCardDates: {
    color: COLORS.sub,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 5,
  },
  tripInfoRow: {
    flexDirection: "row",
    marginTop: 14,
  },
  tripInfoMini: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FB",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginRight: 7,
  },
  tripInfoMiniIcon: {
    color: COLORS.blue,
    fontSize: 11,
    marginRight: 5,
    fontWeight: "900",
  },
  tripInfoMiniText: {
    color: COLORS.sub,
    fontSize: 10,
    fontWeight: "700",
  },
  tripCardMembers: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#EDF0F4",
  },
  tripCardMembersLabel: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    marginRight: 8,
  },
  tripCardMembersNames: {
    flex: 1,
    minWidth: 0,
    color: COLORS.ink,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  tripCardMembersCount: {
    color: COLORS.sub,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    marginLeft: 8,
  },

  addGroupCard: {
    borderWidth: 1.4,
    borderColor: "#D4DBE8",
    borderStyle: "dashed",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  addGroupIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.blueSoft,
    marginRight: 12,
  },
  addGroupIconText: {
    color: COLORS.blue,
    fontSize: 23,
    lineHeight: 25,
    fontWeight: "400",
  },
  addGroupCopy: {
    flex: 1,
  },
  addGroupTitle: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  addGroupSubtitle: {
    color: COLORS.sub,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
    fontWeight: "600",
  },
  addGroupArrow: {
    color: COLORS.blue,
    fontSize: 27,
    lineHeight: 30,
    marginLeft: 8,
  },

  tripScroll: {
    paddingHorizontal: 18,
    paddingTop: 11,
    paddingBottom: 42,
  },
  tripTopBar: {
    height: 39,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  backButtonText: {
    color: COLORS.navy,
    fontSize: 30,
    lineHeight: 30,
    marginRight: 2,
  },
  backButtonLabel: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: "900",
  },
  tripTopActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  inviteTopButton: {
    backgroundColor: COLORS.purpleSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 11,
    marginRight: 6,
  },
  inviteTopButtonText: {
    color: COLORS.purple,
    fontSize: 11,
    fontWeight: "900",
  },
  editTopButton: {
    backgroundColor: COLORS.blueSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 11,
  },
  editTopButtonText: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: "900",
  },
  groupDangerTopButton: {
    backgroundColor: "#FFF1F1",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 11,
    marginLeft: 6,
  },
  groupDangerTopButtonText: {
    color: "#D94B4B",
    fontSize: 11,
    fontWeight: "900",
  },
  tripHero: {
    backgroundColor: COLORS.navy,
    borderRadius: 25,
    padding: 18,
  },
  tripHeroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroDestinationTag: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heroDestinationTagText: {
    color: "#D7E5FF",
    fontSize: 10,
    fontWeight: "900",
  },
  heroCode: {
    color: "#AFC7FF",
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: "900",
  },
  tripHeroTitle: {
    color: COLORS.white,
    fontSize: 24,
    letterSpacing: -0.7,
    fontWeight: "900",
    marginTop: 15,
  },
  tripHeroDates: {
    color: "#BFD0F7",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },
  tripHeroMembers: {
    minHeight: 31,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.14)",
  },
  tripHeroMembersLabel: {
    color: "#BFD0F7",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "800",
    marginRight: 9,
  },
  tripHeroMemberNames: {
    flex: 1,
    minWidth: 0,
    color: COLORS.white,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  tripHeroMemberCount: {
    color: "#BFD0F7",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "900",
    marginLeft: 9,
  },
  tripHeroStats: {
    flexDirection: "row",
    marginTop: 15,
  },
  statBadge: {
    flex: 1,
    minHeight: 56,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
  },
  statToneBlue: {
    backgroundColor: "#21396D",
    marginRight: 8,
  },
  statTonePeach: {
    backgroundColor: "#52344C",
  },
  statTonePurple: {
    backgroundColor: "#463B71",
  },
  statBadgeIcon: {
    width: 24,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
    marginRight: 7,
  },
  statIconBlue: {
    color: "#88B6FF",
  },
  statIconPeach: {
    color: "#FFB29D",
  },
  statIconPurple: {
    color: "#BCA8FF",
  },
  statBadgeCopy: {
    flex: 1,
  },
  statBadgeLabel: {
    color: "#BFD0F7",
    fontSize: 9,
    fontWeight: "800",
  },
  statBadgeValue: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 3,
  },

  tripTabs: {
    backgroundColor: "#E9EDF4",
    borderRadius: 15,
    padding: 4,
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 21,
  },
  tripTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 11,
  },
  tripTabActive: {
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: "#51607E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.14,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  tripTabText: {
    color: "#8E97A8",
    fontSize: 12,
    fontWeight: "900",
  },
  tripTabTextActive: {
    color: COLORS.navy,
  },
  tabIntroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
  },
  sharedIntroCard: {
    backgroundColor: "#FFFAF8",
  },
  tabIntroIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  tabIntroIconText: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "900",
  },
  tabIntroCopy: {
    flex: 1,
  },
  tabIntroEyebrow: {
    color: COLORS.blue,
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: "900",
  },
  tabIntroTitle: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
  },
  tabIntroText: {
    color: COLORS.sub,
    fontSize: 10,
    marginTop: 3,
    fontWeight: "600",
  },
  tabIntroCount: {
    flexDirection: "row",
    alignItems: "baseline",
    marginLeft: 8,
  },
  tabIntroCountNumber: {
    fontSize: 19,
    fontWeight: "900",
  },
  tabIntroCountTotal: {
    color: COLORS.sub,
    fontSize: 11,
    fontWeight: "800",
  },

  checklistCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  personalCategoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  personalCategoryHeader: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF0F4",
  },
  personalCategoryLabel: {
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  personalCategoryLabelText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  personalCategoryCount: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
  },
  checklistCardHeader: {
    paddingTop: 13,
    paddingBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: COLORS.blueSoft,
  },
  categoryChipText: {
    color: COLORS.blue,
    fontSize: 10,
    fontWeight: "900",
  },
  sharedCategoryChip: {
    backgroundColor: COLORS.peachSoft,
  },
  sharedCategoryChipText: {
    color: COLORS.peach,
  },
  categoryCount: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
  },
  taskRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
  },
  sharedTaskRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
  },
  taskRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EDF0F4",
  },
  checkBox: {
    width: 21,
    height: 21,
    borderRadius: 7,
    borderWidth: 1.4,
    borderColor: "#C9D1DF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkBoxDone: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  checkBoxText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 17,
  },
  taskText: {
    flex: 1,
    color: COLORS.ink,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  taskTextDone: {
    color: "#A1A9B7",
    textDecorationLine: "line-through",
  },
  taskDelete: {
    color: "#C4CBD7",
    fontSize: 20,
    lineHeight: 22,
    textAlign: "center",
  },
  sharedTaskCopy: {
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },
  sharedTaskLine: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  sharedTaskName: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 18,
  },
  sharedTaskOwner: {
    color: COLORS.sub,
    fontSize: 10,
    marginTop: 3,
    fontWeight: "600",
  },
  ownerPill: {
    minWidth: 61,
    height: 32,
    borderRadius: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "#E3E7EF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ownerPillPlus: {
    color: COLORS.muted,
    fontSize: 16,
    fontWeight: "400",
  },
  ownerPillText: {
    color: COLORS.sub,
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 4,
  },
  ownerChangeButton: {
    width: 42,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#F2F4F8",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
  ownerChangeButtonText: {
    color: COLORS.blue,
    fontSize: 10,
    fontWeight: "900",
  },
  deleteButton: {
    width: 22,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
  taskDoneText: {
    color: COLORS.green,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "800",
  },
  groupSectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 10,
  },
  groupSectionEyebrow: {
    color: COLORS.blue,
    fontSize: 10,
    letterSpacing: 0.9,
    fontWeight: "900",
  },
  groupSectionTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },
  groupSectionDescription: {
    color: COLORS.sub,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
  },
  groupSectionCount: {
    color: COLORS.blue,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 6,
  },
  groupSectionCountPeach: {
    color: COLORS.peach,
  },
  commonChecklistCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  commonTaskRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
  },
  commonTaskName: {
    flex: 1,
    minWidth: 0,
  },
  detailTaskRow: {
    minHeight: 57,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  sharedDetailTaskRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  taskDetailContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: 5,
  },
  taskCategoryTop: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 3,
  },
  taskTitleText: {
    color: COLORS.ink,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  taskMemoText: {
    color: COLORS.sub,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  taskEditButton: {
    width: 34,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 1,
  },
  taskEditButtonText: {
    color: "#4778FF",
    fontSize: 9,
    fontWeight: "900",
  },
  sharedTaskActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginRight: 2,
  },
  sharedTaskActionButton: {
    width: 33,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sharedOwnerActionButton: {
    backgroundColor: "#FFF0EB",
  },
  sharedEditActionButton: {
    backgroundColor: "#EEF3FF",
  },
  sharedTaskActionText: {
    fontSize: 9,
    fontWeight: "900",
  },
  sharedOwnerActionText: {
    color: "#E56D50",
  },
  sharedEditActionText: {
    color: "#4778FF",
  },
  addCommonTaskButton: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D6E0FF",
    backgroundColor: COLORS.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  addCommonTaskButtonText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: "900",
  },
  groupSectionDivider: {
    height: 1,
    backgroundColor: "#E1E6EF",
    marginBottom: 21,
  },

  sharedGuide: {
    backgroundColor: COLORS.yellowSoft,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sharedGuideIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE5A7",
    marginRight: 8,
  },
  sharedGuideIconText: {
    color: "#D5961E",
    fontSize: 13,
    fontWeight: "900",
  },
  sharedGuideText: {
    flex: 1,
    color: "#8A641E",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "700",
  },
  addTaskButton: {
    height: 54,
    borderRadius: 17,
    backgroundColor: COLORS.navy,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 5,
  },
  addSharedTaskButton: {
    backgroundColor: COLORS.peach,
  },
  addTaskButtonPlus: {
    color: "#BBD1FF",
    fontSize: 21,
    lineHeight: 23,
    marginRight: 5,
    fontWeight: "400",
  },
  addTaskButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },

  membersSummaryCard: {
    backgroundColor: COLORS.purpleSoft,
    borderRadius: 21,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },
  membersSummaryEyebrow: {
    color: COLORS.purple,
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: "900",
  },
  membersSummaryTitle: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 4,
  },
  membersSummaryText: {
    color: COLORS.sub,
    fontSize: 10,
    marginTop: 4,
    fontWeight: "600",
  },
  membersSummaryAvatarStack: {
    flexDirection: "row",
    marginLeft: "auto",
    paddingLeft: 8,
  },
  membersSummaryAvatarWrap: {
    marginLeft: -8,
    borderWidth: 2,
    borderColor: COLORS.purpleSoft,
    borderRadius: 18,
  },
  membersCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    marginBottom: 13,
  },
  memberRow: {
    minHeight: 80,
    flexDirection: "row",
    alignItems: "center",
  },
  memberRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EDF0F4",
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: "900",
  },
  memberCopy: {
    flex: 1,
    marginLeft: 11,
  },
  memberName: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  memberSubText: {
    color: COLORS.sub,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
  },
  memberProgressTrack: {
    height: 5,
    borderRadius: 5,
    backgroundColor: "#EDF0F4",
    overflow: "hidden",
    marginTop: 8,
  },
  memberProgressValue: {
    height: "100%",
    borderRadius: 5,
  },
  memberPct: {
    minWidth: 38,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "900",
  },
  inviteCard: {
    backgroundColor: COLORS.purpleSoft,
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  inviteIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#DED6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  inviteIconText: {
    color: COLORS.purple,
    fontSize: 23,
    fontWeight: "900",
  },
  inviteCopy: {
    flex: 1,
  },
  inviteLabel: {
    color: "#7458D7",
    fontSize: 10,
    fontWeight: "900",
  },
  inviteCode: {
    color: "#3D2D82",
    fontSize: 17,
    letterSpacing: 1.1,
    fontWeight: "900",
    marginTop: 3,
  },
  copyCodeButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  copyCodeButtonText: {
    color: COLORS.purple,
    fontSize: 10,
    fontWeight: "900",
  },

  emptyScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  emptyScreenText: {
    color: COLORS.sub,
    fontSize: 14,
    fontWeight: "700",
  },
  emptyScreenButton: {
    marginTop: 13,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
  },
  emptyScreenButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(11, 18, 34, 0.38)",
    justifyContent: "flex-end",
  },
  modalDismiss: {
    flex: 1,
  },
  sheet: {
    maxHeight: "88%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#D6DCE6",
    alignSelf: "center",
    marginTop: 11,
    marginBottom: 18,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  sheetEyebrow: {
    color: COLORS.blue,
    fontSize: 10,
    letterSpacing: 0.95,
    fontWeight: "900",
  },
  sheetTitle: {
    color: COLORS.ink,
    fontSize: 22,
    letterSpacing: -0.55,
    fontWeight: "900",
    marginTop: 4,
  },
  sheetClose: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#F0F2F6",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCloseText: {
    color: COLORS.sub,
    fontSize: 22,
    lineHeight: 24,
    fontWeight: "400",
  },
  sheetScroll: {
    paddingTop: 5,
    paddingBottom: 4,
  },
  fieldWrap: {
    marginTop: 13,
  },
  fieldLabel: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 7,
  },
  fieldInput: {
    height: 49,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DEE4ED",
    backgroundColor: "#FBFCFE",
    paddingHorizontal: 13,
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "600",
  },
  dateFieldButton: {
    height: 49,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DEE4ED",
    backgroundColor: "#FBFCFE",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateFieldText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  dateFieldPlaceholder: {
    color: "#A7AFBE",
  },
  dateFieldIcon: {
    color: COLORS.blue,
    fontSize: 18,
    lineHeight: 18,
    fontWeight: "900",
  },
  fieldRow: {
    flexDirection: "row",
  },
  halfField: {
    flex: 1,
    marginRight: 5,
  },
  halfFieldRight: {
    flex: 1,
    marginLeft: 5,
  },
  createTip: {
    backgroundColor: COLORS.blueSoft,
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 15,
  },
  createTipText: {
    color: "#5470B6",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "700",
  },
  sheetSubmit: {
    height: 53,
    borderRadius: 16,
    backgroundColor: COLORS.navy,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 21,
  },
  sheetSubmitText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },
  joinDescription: {
    color: COLORS.sub,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  inviteCodePanel: {
    borderRadius: 17,
    backgroundColor: COLORS.purpleSoft,
    padding: 14,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inviteCodePanelLabel: {
    color: "#7458D7",
    fontSize: 10,
    fontWeight: "900",
  },
  inviteCodePanelValue: {
    color: "#3D2D82",
    fontSize: 19,
    letterSpacing: 1.1,
    fontWeight: "900",
    marginTop: 4,
  },
  shareInviteButton: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  shareInviteButtonText: {
    color: COLORS.purple,
    fontSize: 11,
    fontWeight: "900",
  },
  invitePanelInfo: {
    color: COLORS.sub,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    marginTop: 10,
  },
  inviteNotice: {
    borderRadius: 13,
    backgroundColor: "#F4F6FA",
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginTop: 14,
  },
  inviteNoticeText: {
    color: COLORS.sub,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },

  addTaskFormScroll: {
    paddingTop: 21,
    paddingBottom: 4,
  },
  addTaskSection: {
    marginTop: 26,
  },
  addTaskSectionFirst: {
    marginTop: 0,
  },
  addTaskSectionLabel: {
    color: COLORS.ink,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "900",
    marginBottom: 10,
    includeFontPadding: false,
  },
  scopeSwitch: {
    flexDirection: "row",
    minHeight: 50,
    padding: 4,
    borderRadius: 15,
    backgroundColor: "#F0F2F6",
  },
  scopeButton: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    borderRadius: 11,
  },
  scopeButtonActive: {
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: "#54617D",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.14,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  scopeButtonText: {
    color: COLORS.sub,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
    fontWeight: "800",
  },
  scopeButtonTextActive: {
    color: COLORS.navy,
  },
  categoryOptionScroll: {
    alignItems: "center",
    paddingRight: 12,
    paddingVertical: 1,
  },
  categoryOption: {
    height: 40,
    borderWidth: 1,
    borderColor: "#E0E5EE",
    borderRadius: 20,
    paddingHorizontal: 13,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryOptionActive: {
    backgroundColor: COLORS.blueSoft,
    borderColor: COLORS.blue,
  },
  categoryOptionText: {
    color: COLORS.sub,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
    fontWeight: "800",
  },
  categoryOptionTextActive: {
    color: COLORS.blue,
  },

  weatherAutoCard: {
    marginTop: 13,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 13,
    backgroundColor: COLORS.blueSoft,
  },
  weatherAutoLabel: {
    color: COLORS.blue,
    fontSize: 10,
    letterSpacing: 0.5,
    fontWeight: "900",
  },
  weatherAutoValue: {
    color: "#4F68A6",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  addCategoryOption: {
    width: 40,
    paddingHorizontal: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  addCategoryOptionActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  addCategoryOptionText: {
    color: COLORS.blue,
    fontSize: 19,
    lineHeight: 22,
    textAlignVertical: "center",
    includeFontPadding: false,
    fontWeight: "500",
  },
  addCategoryOptionTextActive: {
    color: COLORS.white,
  },
  customCategoryInput: {
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.blue,
    backgroundColor: "#FBFCFE",
    paddingHorizontal: 13,
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
  },
  addTaskItemInput: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DEE4ED",
    backgroundColor: "#FBFCFE",
    paddingHorizontal: 13,
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  addTaskMemoInput: {
    minHeight: 78,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DEE4ED",
    backgroundColor: "#FBFCFE",
    paddingHorizontal: 13,
    paddingTop: 12,
    paddingBottom: 12,
    color: COLORS.ink,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  editTaskMemoInput: {
    minHeight: 92,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DEE4ED",
    backgroundColor: "#FBFCFE",
    paddingHorizontal: 13,
    paddingTop: 12,
    paddingBottom: 12,
    color: COLORS.ink,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  optionalLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
  },
  ownerSectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  ownerSectionHeader: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF0F4",
  },
  ownerSectionIdentity: {
    flexDirection: "row",
    alignItems: "center",
  },
  unassignedAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF1F5",
  },
  unassignedAvatarText: {
    color: COLORS.muted,
    fontSize: 16,
    fontWeight: "900",
  },
  ownerSectionTitle: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 0,
  },
  ownerSectionSubTitle: {
    color: COLORS.sub,
    fontSize: 9,
    fontWeight: "600",
    marginLeft: 0,
    marginTop: 1,
  },
  ownerSectionCount: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
  },
  taskMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskCategoryTag: {
    flexShrink: 0,
    backgroundColor: "#F2F4F8",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    marginLeft: 6,
  },
  taskCategoryTagText: {
    color: COLORS.sub,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "800",
  },
  inlineCalendarCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E2E7F0",
    borderRadius: 18,
    backgroundColor: "#F8FAFD",
    padding: 13,
  },
  inlineCalendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inlineCalendarTitle: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 3,
  },
  inlineCalendarHint: {
    color: COLORS.sub,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 8,
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: "rgba(11,18,34,0.38)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  calendarDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  calendarCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarEyebrow: {
    color: COLORS.blue,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "900",
  },
  calendarTitle: {
    color: COLORS.ink,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 4,
  },
  calendarClose: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: "#F0F2F6",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarCloseText: {
    color: COLORS.sub,
    fontSize: 21,
    lineHeight: 23,
  },
  calendarMonthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 19,
    marginBottom: 16,
  },
  calendarArrow: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarArrowText: {
    color: COLORS.blue,
    fontSize: 23,
    lineHeight: 26,
    fontWeight: "500",
  },
  calendarMonthText: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  calendarWeekRow: {
    flexDirection: "row",
    marginBottom: 7,
  },
  calendarWeekText: {
    width: "14.2857%",
    textAlign: "center",
    color: COLORS.sub,
    fontSize: 11,
    fontWeight: "800",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarCell: {
    width: "14.2857%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },
  calendarCellSelected: {
    backgroundColor: COLORS.navy,
  },
  calendarDayText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  calendarDayTextSelected: {
    color: COLORS.white,
  },
  calendarSunday: {
    color: COLORS.peach,
  },
  calendarSaturday: {
    color: COLORS.blue,
  },
  calendarTodayText: {
    textDecorationLine: "underline",
    textDecorationColor: COLORS.blue,
  },
  calendarCancelButton: {
    height: 45,
    borderRadius: 13,
    backgroundColor: "#F0F2F6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  calendarCancelText: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: "900",
  },

  ownerModalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    backgroundColor: "rgba(11, 18, 34, 0.42)",
  },
  ownerModalDismiss: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  ownerModalCard: {
    position: "relative",
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
  },
  ownerModalEyebrow: {
    color: COLORS.blue,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "900",
  },
  ownerModalTitle: {
    color: COLORS.ink,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "900",
    marginTop: 5,
  },
  ownerModalSubtitle: {
    color: COLORS.sub,
    fontSize: 12,
    marginTop: 5,
    marginBottom: 13,
    fontWeight: "600",
  },
  ownerChoiceRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EDF0F4",
  },
  ownerChoiceEmptyAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF1F5",
  },
  ownerChoiceEmptyText: {
    color: COLORS.muted,
    fontSize: 17,
    fontWeight: "900",
  },
  ownerChoiceName: {
    flex: 1,
    color: COLORS.ink,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },
  ownerChoiceCheck: {
    color: COLORS.blue,
    fontSize: 18,
    fontWeight: "900",
  },
  ownerCancelButton: {
    height: 45,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F2F6",
    marginTop: 14,
  },
  ownerCancelButtonText: {
    color: COLORS.sub,
    fontSize: 13,
    fontWeight: "900",
  },
});

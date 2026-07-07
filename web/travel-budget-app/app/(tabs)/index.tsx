import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type Session } from "@supabase/supabase-js";
import { useNavigation } from "expo-router";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

// 웹 배포 시 Expo가 Node 환경에서 정적 렌더링을 한 번 수행합니다.
// 그 환경에는 window/localStorage가 없으므로 AsyncStorage를 사용하면 빌드가 중단됩니다.
// 브라우저에서는 localStorage, iOS/Android 앱에서는 AsyncStorage를 사용합니다.
const isWebBrowser = Platform.OS === "web" && typeof window !== "undefined";
const authStorage = isWebBrowser
  ? window.localStorage
  : Platform.OS === "web"
    ? undefined
    : AsyncStorage;
const persistAuthSession = Platform.OS !== "web" || isWebBrowser;

const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_PUBLISHABLE_KEY || "placeholder-key",
  {
    auth: {
      storage: authStorage,
      autoRefreshToken: persistAuthSession,
      persistSession: persistAuthSession,
      detectSessionInUrl: false,
    },
  },
);

// 환산 통화 표시는 기기별 보기 설정입니다. 금액·환율·공유 데이터에는 영향을 주지 않습니다.
function currencyDisplayPreferenceKey(tripId: string) {
  return `travel-budget-show-secondary-currency:${tripId}`;
}

async function readCurrencyDisplayPreference(
  key: string,
): Promise<string | null> {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  }
  return AsyncStorage.getItem(key);
}

async function writeCurrencyDisplayPreference(key: string, value: string) {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
}

// Safari PWA에서는 React Native Alert의 버튼 선택창이 표시되지 않는 경우가 있어,
// 삭제·초기화 확인은 브라우저 확인창으로 처리합니다.
function showAppAlert(title: string, message: string) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

function confirmDestructiveAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = "삭제",
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

type Currency = "KRW" | "JPY" | "USD" | "EUR";
type Screen = "groups" | "detail" | "categoryDetail";
type DetailTab = "fund" | "additional" | "personal" | "ledger";
type ModalName =
  | "createGroup"
  | "joinGroup"
  | "fundSettings"
  | "fundAdd"
  | "schedule"
  | "category"
  | "expense"
  | "additional"
  | "personalBudget"
  | "personalCategory"
  | "personalExpense"
  | "settings"
  | "invite"
  | "converter"
  | null;
type AdditionalScope = "per_person" | "group_total";
type PaymentMethod = "card" | "cash";
type LedgerType = "all" | "fund" | "additional";
type CalendarTarget = "travelStart" | "travelEnd" | "expense" | "additional";
type FundHistoryEventType =
  "initial" | "add" | "allocation_update" | "delete" | "snapshot";

type FundHistoryItem = {
  id: string;
  trip_id: string;
  event_type: FundHistoryEventType;
  amount: number | string;
  currency: Currency;
  base_amount: number | string;
  card_amount: number | string;
  card_currency: Currency | null;
  card_base_amount: number | string;
  cash_amount: number | string;
  cash_currency: Currency | null;
  cash_base_amount: number | string;
  total_after_base_amount: number | string;
  card_after_base_amount: number | string;
  cash_after_base_amount: number | string;
  member_count: number | null;
  created_by: string | null;
  created_at: string;
};

type FundRound = {
  id: string;
  trip_id: string;
  // 회비 1회차, 2회차처럼 실제로 추가한 한 건의 금액입니다. 모두 1인 기준으로 저장합니다.
  amount: number | string;
  currency: Currency;
  base_amount: number | string;
  card_amount: number | string;
  card_currency: Currency | null;
  card_base_amount: number | string;
  cash_amount: number | string;
  cash_currency: Currency | null;
  cash_base_amount: number | string;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
  // 이 값이 "user_add"인 행만 실제 사용자가 "회비 추가"로 만든 회차입니다.
  // 기존 버전이 자동 생성한 초기·스냅샷 행은 "legacy"로 분리해 절대 화면에 표시하지 않습니다.
  round_origin: "user_add" | "legacy" | null;
  is_user_added: boolean | null;
};

type Trip = {
  id: string;
  name: string;
  base_currency: Currency;
  secondary_currency: Currency | null;
  exchange_rate: number | string | null;
  rate_updated_at: string | null;
  fund_per_person_amount: number | string | null;
  fund_currency: Currency | null;
  fund_per_person_base_amount: number | string | null;
  fund_exchange_rate: number | string | null;
  fund_card_per_person_amount: number | string | null;
  fund_cash_per_person_amount: number | string | null;
  // 카드·현금 회비는 서로 다른 통화로 설정할 수 있으므로 원 입력 통화도 별도 저장합니다.
  fund_card_per_person_currency: Currency | null;
  fund_cash_per_person_currency: Currency | null;
  fund_card_per_person_base_amount: number | string | null;
  fund_cash_per_person_base_amount: number | string | null;
  travel_start_date: string | null;
  travel_end_date: string | null;
  // 새 그룹에서 설정하는 최대 참여 인원입니다. 기존 그룹의 null은 제한 없음으로 표시합니다.
  member_limit: number | string | null;
  created_by: string;
  created_at: string;
};

type Category = {
  id: string;
  trip_id: string;
  name: string;
  // 카테고리 예산은 1인 기준이 아니라 그룹 전체 회비 안에서 배정하는 금액입니다.
  budget: number | string;
  group_budget_amount: number | string | null;
  group_budget_currency: Currency | null;
  group_budget_base_amount: number | string | null;
  group_budget_exchange_rate: number | string | null;
  sort_order: number;
  created_at: string;
};

type Expense = {
  id: string;
  trip_id: string;
  category_id: string;
  amount: number | string;
  source_amount: number | string | null;
  source_currency: Currency | null;
  base_amount_snapshot: number | string | null;
  exchange_rate_snapshot: number | string | null;
  payment_method: PaymentMethod | null;
  memo: string;
  spent_on: string;
  created_by: string | null;
  created_at: string;
};

type AdditionalCharge = {
  id: string;
  trip_id: string;
  name: string;
  charge_scope: AdditionalScope;
  source_amount: number | string;
  source_currency: Currency;
  base_amount_snapshot: number | string;
  exchange_rate_snapshot: number | string | null;
  created_by: string | null;
  created_at: string;
  charge_date: string | null;
};

type PersonalBudget = {
  id: string;
  trip_id: string;
  user_id: string;
  source_amount: number | string;
  source_currency: Currency;
  base_amount_snapshot: number | string;
  exchange_rate_snapshot: number | string | null;
  created_at: string;
  updated_at: string | null;
};

type PersonalBudgetCategory = {
  id: string;
  trip_id: string;
  user_id: string;
  name: string;
  source_amount: number | string;
  source_currency: Currency;
  base_amount_snapshot: number | string;
  exchange_rate_snapshot: number | string | null;
  sort_order: number;
  created_at: string;
  updated_at: string | null;
};

type PersonalExpense = {
  id: string;
  trip_id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  memo: string | null;
  source_amount: number | string;
  source_currency: Currency;
  base_amount_snapshot: number | string;
  exchange_rate_snapshot: number | string | null;
  spent_on: string;
  created_at: string;
  updated_at: string | null;
};

type LedgerEntry = {
  id: string;
  kind: "fund" | "additional";
  date: string;
  baseAmount: number;
  title: string;
  categoryName?: string;
  paymentMethod?: PaymentMethod;
  expense?: Expense;
  additional?: AdditionalCharge;
};

const FUND_SPLIT_TOLERANCE_BASE = 10;
const INITIAL_FUND_EDIT_ID = "__initial_fund__";

const CURRENCIES: Array<{ code: Currency; symbol: string }> = [
  { code: "KRW", symbol: "₩" },
  { code: "JPY", symbol: "¥" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
];

const colors = {
  // 눈부심은 줄이고, 카드 간 구분은 또렷하게 만든 화이트·네이비 테마입니다.
  bg: "#F6F8FC",
  panel: "#FFFFFF",
  panelSoft: "#EDF3FA",
  line: "#B8C7DA",
  text: "#12213A",
  muted: "#586981",
  dim: "#788BA7",
  amber: "#183D6B",
  green: "#257A62",
  red: "#C6404B",
  blue: "#4E729F",
};

function numberOf(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function symbolOf(currency: Currency) {
  return CURRENCIES.find((item) => item.code === currency)?.symbol ?? currency;
}

function formatMoney(
  value: number | string | null | undefined,
  currency: Currency,
) {
  const fractionDigits = currency === "USD" || currency === "EUR" ? 2 : 0;
  return `${symbolOf(currency)}${numberOf(value).toLocaleString("ko-KR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  })}`;
}

function formatRate(value: number | string | null | undefined) {
  const rate = numberOf(value);
  if (!rate) return "-";
  return rate < 1 ? rate.toFixed(4) : rate.toFixed(2);
}

function fundHistoryEventLabel(eventType: FundHistoryEventType) {
  switch (eventType) {
    case "initial":
      return "최초 회비 설정";
    case "add":
      return "회비 추가";
    case "allocation_update":
      return "카드·현금 배분 수정";
    case "delete":
      return "회비 삭제";
    case "snapshot":
      return "기존 회비 기준 시작 기록";
  }
}

function formatHistoryDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "날짜 정보 없음";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hour}:${minute}`;
}

function todayLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function dateKeyFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthKey(value: string) {
  return `${value.slice(0, 7)}-01`;
}

function addMonths(monthStart: string, amount: number) {
  const date = parseDateKey(monthStart);
  date.setDate(1);
  date.setMonth(date.getMonth() + amount);
  return dateKeyFromDate(date);
}

function monthLabel(monthStart: string) {
  const date = parseDateKey(monthStart);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function sameOrBetween(date: string, start: string | null, end: string | null) {
  if (!start || !end) return false;
  return date >= start && date <= end;
}

function formatSchedule(start: string | null, end: string | null) {
  if (!start || !end) return "여행 일정을 설정하세요";
  return `${start.replaceAll("-", ".")} ~ ${end.replaceAll("-", ".")}`;
}

function calendarWeeks(monthStart: string) {
  const first = parseDateKey(monthStart);
  first.setDate(1);
  const startOffset = first.getDay();
  const month = first.getMonth();
  const cursor = new Date(first);
  cursor.setDate(1 - startOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() + index);
    return {
      key: dateKeyFromDate(date),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
    };
  });
}

function makeGroupCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 8 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join("");
}

async function fetchRate(base: Currency, quote: Currency) {
  if (base === quote) return 1;
  const response = await fetch(
    `https://api.frankfurter.dev/v2/rate/${base}/${quote}`,
  );
  if (!response.ok) throw new Error("환율을 불러오지 못했습니다.");
  const data = await response.json();
  if (typeof data.rate !== "number")
    throw new Error("환율 형식이 올바르지 않습니다.");
  return data.rate;
}

function availableCurrencies(trip: Trip): Currency[] {
  const values = [trip.base_currency, trip.secondary_currency].filter(
    Boolean,
  ) as Currency[];
  return Array.from(new Set(values));
}

function sourceCurrencyForFund(trip: Trip) {
  return trip.fund_currency ?? trip.base_currency;
}

function cardFundCurrency(trip: Trip): Currency {
  return trip.fund_card_per_person_currency ?? sourceCurrencyForFund(trip);
}

function cashFundCurrency(trip: Trip): Currency {
  return trip.fund_cash_per_person_currency ?? sourceCurrencyForFund(trip);
}

function convertFromBase(
  baseAmount: number,
  currency: Currency,
  trip: Pick<Trip, "base_currency" | "secondary_currency" | "exchange_rate">,
) {
  if (currency === trip.base_currency)
    return { sourceAmount: baseAmount, rate: 1 };
  if (
    currency === trip.secondary_currency &&
    numberOf(trip.exchange_rate) > 0
  ) {
    return {
      sourceAmount: baseAmount * numberOf(trip.exchange_rate),
      rate: numberOf(trip.exchange_rate),
    };
  }
  return null;
}

function categoryBaseAmount(category: Category) {
  return category.group_budget_base_amount === null ||
    category.group_budget_base_amount === undefined
    ? numberOf(category.budget)
    : numberOf(category.group_budget_base_amount);
}

function categorySourceAmount(category: Category) {
  return category.group_budget_amount === null ||
    category.group_budget_amount === undefined
    ? numberOf(category.budget)
    : numberOf(category.group_budget_amount);
}

function categorySourceCurrency(category: Category, trip: Trip) {
  return category.group_budget_currency ?? trip.base_currency;
}

function expenseBaseAmount(expense: Expense) {
  return expense.base_amount_snapshot === null ||
    expense.base_amount_snapshot === undefined
    ? numberOf(expense.amount)
    : numberOf(expense.base_amount_snapshot);
}

function expenseSourceAmount(expense: Expense) {
  return expense.source_amount === null || expense.source_amount === undefined
    ? numberOf(expense.amount)
    : numberOf(expense.source_amount);
}

function expenseSourceCurrency(expense: Expense, trip: Trip) {
  return expense.source_currency ?? trip.base_currency;
}

function convertToBase(
  amount: number,
  currency: Currency,
  trip: Pick<Trip, "base_currency" | "secondary_currency" | "exchange_rate">,
) {
  if (currency === trip.base_currency) return { baseAmount: amount, rate: 1 };
  if (
    currency === trip.secondary_currency &&
    numberOf(trip.exchange_rate) > 0
  ) {
    return {
      baseAmount: amount / numberOf(trip.exchange_rate),
      rate: 1 / numberOf(trip.exchange_rate),
    };
  }
  return null;
}

function fundPerPersonBaseAmount(trip: Trip) {
  return (
    numberOf(trip.fund_per_person_base_amount) ||
    convertToBase(
      numberOf(trip.fund_per_person_amount),
      sourceCurrencyForFund(trip),
      trip,
    )?.baseAmount ||
    0
  );
}

function configuredMoneyText(
  baseAmount: number | string | null | undefined,
  trip: Pick<Trip, "base_currency" | "secondary_currency" | "exchange_rate">,
) {
  return formatMoney(baseAmount, trip.base_currency);
}

function moneyParts(
  baseAmount: number | string | null | undefined,
  trip: Pick<Trip, "base_currency" | "secondary_currency" | "exchange_rate">,
) {
  const primary = formatMoney(baseAmount, trip.base_currency);
  const rate = numberOf(trip.exchange_rate);
  const secondary =
    trip.secondary_currency && rate > 0
      ? `≈ ${formatMoney(numberOf(baseAmount) * rate, trip.secondary_currency)}`
      : null;
  return { primary, secondary };
}

type MoneyVariant = "headline" | "summary" | "body" | "small" | "row";

const CurrencyDisplayContext = createContext(true);

function MoneyDisplay({
  baseAmount,
  trip,
  color,
  variant = "body",
  align = "left",
}: {
  baseAmount: number | string | null | undefined;
  trip: Pick<Trip, "base_currency" | "secondary_currency" | "exchange_rate">;
  color?: string;
  variant?: MoneyVariant;
  align?: "left" | "right";
}) {
  const showSecondaryCurrency = useContext(CurrencyDisplayContext);
  const { primary, secondary } = moneyParts(baseAmount, trip);
  const mainStyle =
    variant === "headline"
      ? styles.moneyHeadline
      : variant === "summary"
        ? styles.moneySummary
        : variant === "small"
          ? styles.moneySmall
          : variant === "row"
            ? styles.moneyRow
            : styles.moneyBody;

  return (
    <View
      style={[
        styles.moneyDisplay,
        align === "right" ? styles.moneyDisplayRight : null,
      ]}
    >
      <Text style={[mainStyle, color ? { color } : null]}>{primary}</Text>
      {showSecondaryCurrency && secondary ? (
        <Text
          style={[
            styles.moneySecondary,
            align === "right" ? styles.moneySecondaryRight : null,
          ]}
        >
          {secondary}
        </Text>
      ) : null}
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(true);
  const [bootError, setBootError] = useState("");

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      tabBarStyle: { display: "none" },
    });
  }, [navigation]);

  useEffect(() => {
    let mounted = true;
    async function prepareSession() {
      try {
        const { data: current, error: currentError } =
          await supabase.auth.getSession();
        if (currentError) throw currentError;
        if (current.session) {
          if (mounted) setSession(current.session);
          return;
        }
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        if (!data.session)
          throw new Error("기기 연결 정보를 만들지 못했습니다.");
        if (mounted) setSession(data.session);
      } catch (error: unknown) {
        if (mounted)
          setBootError(
            error instanceof Error ? error.message : "알 수 없는 오류",
          );
      } finally {
        if (mounted) setBooting(false);
      }
    }
    void prepareSession();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (mounted && nextSession) {
          setSession(nextSession);
          setBootError("");
        }
      },
    );
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return (
      <ConnectionError message=".env 파일의 Supabase URL과 Publishable key를 확인하세요." />
    );
  }
  if (booting) return <LoadingScreen label="여행 그룹을 준비하는 중..." />;
  if (!session)
    return (
      <ConnectionError
        message={bootError || "기기 연결 정보를 만들지 못했습니다."}
      />
    );
  return <TravelBudgetApp userId={session.user.id} />;
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <SafeAreaView style={styles.centerScreen}>
      <StatusBar barStyle="dark-content" />
      <ActivityIndicator size="large" color={colors.amber} />
      <Text style={styles.loadingText}>{label}</Text>
    </SafeAreaView>
  );
}

function ConnectionError({ message }: { message: string }) {
  return (
    <SafeAreaView style={styles.centerScreen}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.errorTitle}>앱 연결을 확인해주세요.</Text>
      <Text style={styles.errorBody}>{message}</Text>
      <Text style={styles.errorHint}>
        Supabase의 Anonymous Sign-ins 설정도 확인하세요.
      </Text>
    </SafeAreaView>
  );
}

function TravelBudgetApp({ userId }: { userId: string }) {
  const [screen, setScreen] = useState<Screen>("groups");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [additionalCharges, setAdditionalCharges] = useState<
    AdditionalCharge[]
  >([]);
  // 개인 소비는 그룹 구성원에게 공유하지 않고, 현재 로그인한 사용자만 볼 수 있습니다.
  const [personalBudget, setPersonalBudget] = useState<PersonalBudget | null>(
    null,
  );
  const [personalBudgetCategories, setPersonalBudgetCategories] = useState<
    PersonalBudgetCategory[]
  >([]);
  const [personalExpenses, setPersonalExpenses] = useState<PersonalExpense[]>(
    [],
  );
  const [fundRounds, setFundRounds] = useState<FundRound[]>([]);
  // null이면 새 회비 추가, 값이 있으면 해당 회차 수정입니다.
  const [editingFundRoundId, setEditingFundRoundId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<ModalName>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("fund");

  const [newTripName, setNewTripName] = useState("");
  // 생성자 본인을 포함한 최대 참여 인원입니다.
  const [newMemberLimit, setNewMemberLimit] = useState("2");
  const [newBaseCurrency, setNewBaseCurrency] = useState<Currency>("KRW");
  const [newSecondaryCurrency, setNewSecondaryCurrency] =
    useState<Currency | null>("JPY");
  const [newFundAmount, setNewFundAmount] = useState("");
  const [newFundCurrency, setNewFundCurrency] = useState<Currency>("KRW");
  const [newCardFundAmount, setNewCardFundAmount] = useState("");
  const [newCardFundCurrency, setNewCardFundCurrency] =
    useState<Currency>("KRW");
  const [newCashFundAmount, setNewCashFundAmount] = useState("");
  const [newCashFundCurrency, setNewCashFundCurrency] =
    useState<Currency>("KRW");
  const [newFundAutoTarget, setNewFundAutoTarget] =
    useState<PaymentMethod>("card");
  const [newGroupRate, setNewGroupRate] = useState<number | null>(null);
  const [joinCode, setJoinCode] = useState("");

  // 회비는 처음 만들 때와 추가할 때 모두 총액을 먼저 정한 뒤 카드·현금으로 배분합니다.
  const [fundAddTotalAmount, setFundAddTotalAmount] = useState("");
  const [fundAddTotalCurrency, setFundAddTotalCurrency] =
    useState<Currency>("KRW");
  const [fundAddCardAmount, setFundAddCardAmount] = useState("");
  const [fundAddCardCurrency, setFundAddCardCurrency] =
    useState<Currency>("KRW");
  const [fundAddCashAmount, setFundAddCashAmount] = useState("");
  const [fundAddCashCurrency, setFundAddCashCurrency] =
    useState<Currency>("KRW");
  const [fundAddAutoTarget, setFundAddAutoTarget] =
    useState<PaymentMethod>("card");

  // 회비 수정에서는 총 회비와 카드·현금 배분을 함께 조정합니다.
  const [fundEditAutoTarget, setFundEditAutoTarget] =
    useState<PaymentMethod>("card");
  const [fundEditCardAmount, setFundEditCardAmount] = useState("");
  const [fundEditCardCurrency, setFundEditCardCurrency] =
    useState<Currency>("KRW");
  const [fundEditCashAmount, setFundEditCashAmount] = useState("");
  const [fundEditCashCurrency, setFundEditCashCurrency] =
    useState<Currency>("KRW");

  const [categoryName, setCategoryName] = useState("");
  const [categoryAmount, setCategoryAmount] = useState("");
  const [categoryCurrency, setCategoryCurrency] = useState<Currency>("KRW");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );

  const [expenseCategoryId, setExpenseCategoryId] = useState("");
  const [expenseMemo, setExpenseMemo] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCurrency, setExpenseCurrency] = useState<Currency>("KRW");
  const [expenseDate, setExpenseDate] = useState(todayLocal());
  const [expensePaymentMethod, setExpensePaymentMethod] =
    useState<PaymentMethod>("card");
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [showExpenseCalendar, setShowExpenseCalendar] = useState(false);
  const [expenseCalendarMonth, setExpenseCalendarMonth] = useState(
    monthKey(todayLocal()),
  );

  const [additionalName, setAdditionalName] = useState("");
  const [additionalAmount, setAdditionalAmount] = useState("");
  const [additionalCurrency, setAdditionalCurrency] = useState<Currency>("KRW");
  const [additionalScope, setAdditionalScope] =
    useState<AdditionalScope>("per_person");
  const [additionalDate, setAdditionalDate] = useState(todayLocal());
  const [editingAdditionalId, setEditingAdditionalId] = useState<string | null>(
    null,
  );
  const [showAdditionalCalendar, setShowAdditionalCalendar] = useState(false);
  const [additionalCalendarMonth, setAdditionalCalendarMonth] = useState(
    monthKey(todayLocal()),
  );

  const [personalBudgetAmount, setPersonalBudgetAmount] = useState("");
  const [personalBudgetCurrency, setPersonalBudgetCurrency] =
    useState<Currency>("KRW");
  const [personalCategoryName, setPersonalCategoryName] = useState("");
  const [personalCategoryBudgetAmount, setPersonalCategoryBudgetAmount] =
    useState("");
  const [personalCategoryBudgetCurrency, setPersonalCategoryBudgetCurrency] =
    useState<Currency>("KRW");
  const [editingPersonalCategoryId, setEditingPersonalCategoryId] = useState<
    string | null
  >(null);
  const [personalExpenseCategoryId, setPersonalExpenseCategoryId] =
    useState("");
  const [personalExpenseName, setPersonalExpenseName] = useState("");
  const [personalExpenseMemo, setPersonalExpenseMemo] = useState("");
  const [personalExpenseAmount, setPersonalExpenseAmount] = useState("");
  const [personalExpenseCurrency, setPersonalExpenseCurrency] =
    useState<Currency>("KRW");
  const [personalExpenseDate, setPersonalExpenseDate] = useState(todayLocal());
  const [editingPersonalExpenseId, setEditingPersonalExpenseId] = useState<
    string | null
  >(null);
  const [showPersonalExpenseCalendar, setShowPersonalExpenseCalendar] =
    useState(false);
  const [personalExpenseCalendarMonth, setPersonalExpenseCalendarMonth] =
    useState(monthKey(todayLocal()));

  const [settingsName, setSettingsName] = useState("");
  const [settingsSecondaryCurrency, setSettingsSecondaryCurrency] =
    useState<Currency | null>("JPY");
  const [inviteCode, setInviteCode] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [ledgerType, setLedgerType] = useState<LedgerType>("all");
  const [ledgerSelectedDate, setLedgerSelectedDate] = useState<string | null>(
    null,
  );
  const [ledgerMonth, setLedgerMonth] = useState(monthKey(todayLocal()));
  const [scheduleStartDate, setScheduleStartDate] = useState("");
  const [scheduleEndDate, setScheduleEndDate] = useState("");
  const [scheduleTarget, setScheduleTarget] = useState<"start" | "end">(
    "start",
  );
  const [scheduleCalendarMonth, setScheduleCalendarMonth] = useState(
    monthKey(todayLocal()),
  );
  const [converterAmount, setConverterAmount] = useState("");
  const [converterFrom, setConverterFrom] = useState<Currency>("KRW");
  const [showSecondaryCurrency, setShowSecondaryCurrency] = useState(true);

  useEffect(() => {
    if (!activeTrip?.id) return;
    let mounted = true;
    setShowSecondaryCurrency(true);

    void (async () => {
      try {
        const saved = await readCurrencyDisplayPreference(
          currencyDisplayPreferenceKey(activeTrip.id),
        );
        if (mounted && saved !== null)
          setShowSecondaryCurrency(saved !== "off");
      } catch {
        // 보기 설정을 불러오지 못해도 기본값(표시)을 유지합니다.
      }
    })();

    return () => {
      mounted = false;
    };
  }, [activeTrip?.id]);

  async function setSecondaryCurrencyVisibility(nextValue: boolean) {
    setShowSecondaryCurrency(nextValue);
    if (!activeTrip) return;
    try {
      await writeCurrencyDisplayPreference(
        currencyDisplayPreferenceKey(activeTrip.id),
        nextValue ? "on" : "off",
      );
    } catch {
      Alert.alert(
        "표시 설정 저장 실패",
        "이번 화면에서는 반영됐지만 기기에 저장하지 못했습니다.",
      );
    }
  }

  const loadGroups = useCallback(async () => {
    const [tripResponse, memberResponse] = await Promise.all([
      supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("trip_members").select("trip_id"),
    ]);
    if (tripResponse.error) throw tripResponse.error;
    setTrips((tripResponse.data ?? []) as Trip[]);
    if (!memberResponse.error) {
      const counts: Record<string, number> = {};
      for (const member of memberResponse.data ?? []) {
        counts[member.trip_id] = (counts[member.trip_id] ?? 0) + 1;
      }
      setMemberCounts(counts);
    }
  }, []);

  const loadGroupDetail = useCallback(
    async (tripId: string) => {
      const [
        tripResponse,
        categoryResponse,
        expenseResponse,
        additionalResponse,
        historyResponse,
        memberResponse,
        personalBudgetResponse,
        personalCategoryResponse,
        personalExpenseResponse,
      ] = await Promise.all([
        supabase.from("trips").select("*").eq("id", tripId).single(),
        supabase
          .from("categories")
          .select("*")
          .eq("trip_id", tripId)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase
          .from("expenses")
          .select("*")
          .eq("trip_id", tripId)
          .order("spent_on", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("additional_charges")
          .select("*")
          .eq("trip_id", tripId)
          .order("created_at", { ascending: false }),
        // 실제로 추가한 회비 회차만 DB에서 불러옵니다.
        // 최초 회비는 trips의 현재 회비에서 별도로 계산하여 회비 내역 첫 줄에 표시합니다.
        supabase
          .from("fund_rounds")
          .select("*")
          .eq("trip_id", tripId)
          .eq("round_origin", "user_add")
          .order("created_at", { ascending: true }),
        supabase.from("trip_members").select("trip_id").eq("trip_id", tripId),
        supabase
          .from("personal_budgets")
          .select("*")
          .eq("trip_id", tripId)
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("personal_budget_categories")
          .select("*")
          .eq("trip_id", tripId)
          .eq("user_id", userId)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase
          .from("personal_expenses")
          .select("*")
          .eq("trip_id", tripId)
          .eq("user_id", userId)
          .order("spent_on", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);
      if (tripResponse.error) throw tripResponse.error;
      if (categoryResponse.error) throw categoryResponse.error;
      if (expenseResponse.error) throw expenseResponse.error;
      if (additionalResponse.error) throw additionalResponse.error;
      if (historyResponse.error) throw historyResponse.error;
      if (memberResponse.error) throw memberResponse.error;
      if (personalBudgetResponse.error) throw personalBudgetResponse.error;
      if (personalCategoryResponse.error) throw personalCategoryResponse.error;
      if (personalExpenseResponse.error) throw personalExpenseResponse.error;

      const trip = tripResponse.data as Trip;
      setActiveTrip(trip);
      setCategories((categoryResponse.data ?? []) as Category[]);
      setExpenses((expenseResponse.data ?? []) as Expense[]);
      setAdditionalCharges(
        (additionalResponse.data ?? []) as AdditionalCharge[],
      );
      setPersonalBudget(
        (personalBudgetResponse.data ?? null) as PersonalBudget | null,
      );
      setPersonalBudgetCategories(
        (personalCategoryResponse.data ?? []) as PersonalBudgetCategory[],
      );
      setPersonalExpenses(
        (personalExpenseResponse.data ?? []) as PersonalExpense[],
      );
      setFundRounds((historyResponse.data ?? []) as FundRound[]);
      setMemberCounts((current) => ({
        ...current,
        [tripId]: (memberResponse.data ?? []).length || 1,
      }));
    },
    [userId],
  );

  useEffect(() => {
    let mounted = true;
    async function start() {
      try {
        await loadGroups();
      } catch (error: unknown) {
        if (mounted)
          Alert.alert(
            "그룹을 불러오지 못했습니다.",
            error instanceof Error ? error.message : "다시 시도해주세요.",
          );
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void start();
    return () => {
      mounted = false;
    };
  }, [loadGroups]);

  useEffect(() => {
    const channel = supabase
      .channel(`travel-groups-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trips" },
        () => {
          void loadGroups();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trip_members" },
        () => {
          void loadGroups();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadGroups, userId]);

  useEffect(() => {
    if (modal !== "createGroup") return;
    let cancelled = false;
    async function loadNewGroupRate() {
      if (!newSecondaryCurrency || newSecondaryCurrency === newBaseCurrency) {
        if (!cancelled) setNewGroupRate(null);
        return;
      }
      try {
        const rate = await fetchRate(newBaseCurrency, newSecondaryCurrency);
        if (!cancelled) setNewGroupRate(rate);
      } catch {
        if (!cancelled) setNewGroupRate(null);
      }
    }
    void loadNewGroupRate();
    return () => {
      cancelled = true;
    };
  }, [modal, newBaseCurrency, newSecondaryCurrency]);

  useEffect(() => {
    if (!activeTrip?.id) return;
    const tripId = activeTrip.id;
    const channel = supabase
      .channel(`travel-group-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trips",
          filter: `id=eq.${tripId}`,
        },
        () => {
          void loadGroupDetail(tripId);
          void loadGroups();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trip_members",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          void loadGroupDetail(tripId);
          void loadGroups();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          void loadGroupDetail(tripId);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          void loadGroupDetail(tripId);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "additional_charges",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          void loadGroupDetail(tripId);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "personal_budgets",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          void loadGroupDetail(tripId);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "personal_budget_categories",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          void loadGroupDetail(tripId);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "personal_expenses",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          void loadGroupDetail(tripId);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fund_rounds",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          void loadGroupDetail(tripId);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [activeTrip?.id, loadGroupDetail, loadGroups]);

  // Realtime 연결이 일시적으로 끊겼거나 브라우저가 백그라운드에 있던 경우에도
  // 다른 참여자가 추가한 회비·지출을 놓치지 않도록 상세 화면에서 주기적으로 동기화합니다.
  useEffect(() => {
    if (!activeTrip?.id || screen !== "detail") return;
    const tripId = activeTrip.id;
    const timer = setInterval(() => {
      void loadGroupDetail(tripId);
      void loadGroups();
    }, 15000);
    return () => clearInterval(timer);
  }, [activeTrip?.id, screen, loadGroupDetail, loadGroups]);

  const memberCount = activeTrip ? (memberCounts[activeTrip.id] ?? 1) : 1;
  const fundPerPersonBase = activeTrip
    ? numberOf(activeTrip.fund_per_person_base_amount)
    : 0;
  const fundTotalBase = fundPerPersonBase * memberCount;
  const totalSpentBase = useMemo(
    () => expenses.reduce((sum, item) => sum + expenseBaseAmount(item), 0),
    [expenses],
  );
  const cardFundPerPersonBase = activeTrip
    ? numberOf(activeTrip.fund_card_per_person_base_amount)
    : 0;
  const cashFundPerPersonBase = activeTrip
    ? numberOf(activeTrip.fund_cash_per_person_base_amount)
    : 0;
  const cardFundTotalBase = cardFundPerPersonBase * memberCount;
  const cashFundTotalBase = cashFundPerPersonBase * memberCount;
  const cardSpentBase = useMemo(
    () =>
      expenses
        .filter((item) => (item.payment_method ?? "card") === "card")
        .reduce((sum, item) => sum + expenseBaseAmount(item), 0),
    [expenses],
  );
  const cashSpentBase = useMemo(
    () =>
      expenses
        .filter((item) => item.payment_method === "cash")
        .reduce((sum, item) => sum + expenseBaseAmount(item), 0),
    [expenses],
  );

  // 회비를 실제로 추가하기 전에는 1회차·2회차가 생기지 않습니다.
  // round_origin이 user_add로 명시된 행만 화면에 표시합니다.
  const visibleFundRounds = useMemo(
    () => fundRounds.filter((round) => round.round_origin === "user_add"),
    [fundRounds],
  );

  // 최초 회비는 별도 “추가 회차”로 저장하지 않습니다.
  // 현재 총 회비에서 실제 추가 회차들의 합계를 빼면, 그룹을 만들 때 설정한 기본 회비를 안전하게 표시할 수 있습니다.
  const initialFundBase = useMemo(() => {
    const addedBase = visibleFundRounds.reduce(
      (sum, round) => sum + numberOf(round.base_amount),
      0,
    );
    return Math.max(0, fundPerPersonBase - addedBase);
  }, [fundPerPersonBase, visibleFundRounds]);
  const hasInitialFundHistory = initialFundBase > FUND_SPLIT_TOLERANCE_BASE;
  const initialFundPaymentSplit = useMemo(() => {
    if (!activeTrip) return { cardBase: 0, cashBase: 0 };
    const addedCardBase = visibleFundRounds.reduce(
      (sum, round) => sum + numberOf(round.card_base_amount),
      0,
    );
    const addedCashBase = visibleFundRounds.reduce(
      (sum, round) => sum + numberOf(round.cash_base_amount),
      0,
    );
    return {
      cardBase: Math.max(
        0,
        numberOf(activeTrip.fund_card_per_person_base_amount) - addedCardBase,
      ),
      cashBase: Math.max(
        0,
        numberOf(activeTrip.fund_cash_per_person_base_amount) - addedCashBase,
      ),
    };
  }, [activeTrip, visibleFundRounds]);
  const fundHistoryCount =
    visibleFundRounds.length + (hasInitialFundHistory ? 1 : 0);

  // 회차 수정·삭제 시 과거 회차별 카드/현금 배분과 현재 전체 배분이 달라도
  // 남은 총 회비 안에서 지출된 카드·현금 금액을 보장하는 안전한 배분값을 만듭니다.
  function paymentSplitForNextFund(
    nextFundBase: number,
    preferredCardBase: number,
  ) {
    if (nextFundBase < -FUND_SPLIT_TOLERANCE_BASE) return null;
    const count = Math.max(memberCount, 1);
    const minCardBase = Math.max(0, cardSpentBase / count);
    const maxCardBase = Math.max(0, nextFundBase - cashSpentBase / count);
    if (minCardBase > maxCardBase + 0.01) return null;

    const cardBase = Math.min(
      Math.max(preferredCardBase, minCardBase),
      maxCardBase,
    );
    return {
      cardBase: Math.max(0, cardBase),
      cashBase: Math.max(0, nextFundBase - cardBase),
    };
  }

  const categoryBudgetTotalBase = useMemo(
    () =>
      categories.reduce(
        (sum, category) => sum + categoryBaseAmount(category),
        0,
      ),
    [categories],
  );
  // 카테고리 현황은 '지출 사용률'이 아니라, 총 공용 회비 중
  // 아직 다른 카테고리에 배정할 수 있는 금액을 보여줍니다.
  const categoryAllocationRemainingBase =
    fundTotalBase - categoryBudgetTotalBase;
  const categoryAllocationPercent =
    fundTotalBase > 0
      ? Math.min((categoryBudgetTotalBase / fundTotalBase) * 100, 100)
      : 0;
  const additionalPerPersonBase = useMemo(() => {
    return additionalCharges.reduce((sum, charge) => {
      const base = numberOf(charge.base_amount_snapshot);
      return (
        sum +
        (charge.charge_scope === "per_person"
          ? base
          : base / Math.max(memberCount, 1))
      );
    }, 0);
  }, [additionalCharges, memberCount]);
  const additionalGroupTotalBase = useMemo(() => {
    return additionalCharges.reduce((sum, charge) => {
      const base = numberOf(charge.base_amount_snapshot);
      return (
        sum + (charge.charge_scope === "per_person" ? base * memberCount : base)
      );
    }, 0);
  }, [additionalCharges, memberCount]);
  // 총 지출 구성 = 공용 회비 지출 + 항공권·숙소 등의 별도 비용(그룹 전체 기준).
  // 별도 비용이 1인 기준으로 저장된 경우에는 참여 인원을 곱해 그룹 전체 지출로 환산합니다.
  const totalTripSpentBase = totalSpentBase + additionalGroupTotalBase;
  const totalTripSpentPerPersonBase =
    totalTripSpentBase / Math.max(memberCount, 1);
  const tripSpendBreakdown = useMemo(() => {
    const fundItems = categories
      .map((category) => {
        const baseAmount = expenses
          .filter((expense) => expense.category_id === category.id)
          .reduce((sum, expense) => sum + expenseBaseAmount(expense), 0);
        return {
          id: `fund-${category.id}`,
          name: category.name,
          kind: "fund" as const,
          baseAmount,
        };
      })
      .filter((item) => item.baseAmount > 0);

    const additionalItems = additionalCharges
      .map((charge) => {
        const base = numberOf(charge.base_amount_snapshot);
        return {
          id: `additional-${charge.id}`,
          name: charge.name || "이름 없는 별도 비용",
          kind: "additional" as const,
          baseAmount:
            charge.charge_scope === "per_person" ? base * memberCount : base,
        };
      })
      .filter((item) => item.baseAmount > 0);

    const items = [...fundItems, ...additionalItems];
    const total = items.reduce((sum, item) => sum + item.baseAmount, 0);
    if (total <= 0) return [];

    return items
      .map((item) => ({ ...item, percent: (item.baseAmount / total) * 100 }))
      .sort((a, b) => b.baseAmount - a.baseAmount);
  }, [categories, expenses, additionalCharges, memberCount]);
  // 전체 예산 = 총 공용 회비 + 항공권·숙소 등의 별도 비용(그룹 전체 환산액).
  // 총 지출은 공용 회비에 이미 포함되므로 전체 예산에 다시 더하지 않고, 1인 지출 현황으로 별도 표시합니다.
  const totalTravelBudgetBase = fundTotalBase + additionalGroupTotalBase;
  const totalTravelRemainingBase = totalTravelBudgetBase - totalTripSpentBase;
  // 개인 소비 카테고리는 공용 회비와 분리해 관리합니다.
  // 개인 예산을 직접 설정하지 않은 경우에는 개인 소비 카테고리 예산 합계를 개인 예산으로 표시합니다.
  const savedPersonalBudgetBase = personalBudget
    ? numberOf(personalBudget.base_amount_snapshot)
    : 0;
  const hasPersonalBudgetSetting = savedPersonalBudgetBase > 0;
  const personalExpenseTotalBase = useMemo(
    () =>
      personalExpenses.reduce(
        (sum, item) => sum + numberOf(item.base_amount_snapshot),
        0,
      ),
    [personalExpenses],
  );
  const personalCategoryBudgetTotalBase = useMemo(
    () =>
      personalBudgetCategories.reduce(
        (sum, category) => sum + numberOf(category.base_amount_snapshot),
        0,
      ),
    [personalBudgetCategories],
  );
  // 개인 예산은 직접 설정값을 우선 사용하고, 없으면 개인 소비 카테고리 예산 합계로 계산합니다.
  const personalBudgetBase = hasPersonalBudgetSetting
    ? savedPersonalBudgetBase
    : personalCategoryBudgetTotalBase;
  // 1인 공용 비용 = 1인 공용 회비 + 1인 기준 그룹 별도 비용입니다.
  const personalSharedCostBase = fundPerPersonBase + additionalPerPersonBase;
  const personalTotalBudgetBase = personalBudgetBase + personalSharedCostBase;
  const personalSpendingAllocatableBase = personalBudgetBase;
  const personalCategoryAllocationRemainingBase =
    personalSpendingAllocatableBase - personalCategoryBudgetTotalBase;
  const personalCategoryAllocationPercent =
    personalSpendingAllocatableBase > 0
      ? Math.min(
          (personalCategoryBudgetTotalBase / personalSpendingAllocatableBase) *
            100,
          100,
        )
      : 0;
  const personalCategoryStats = useMemo(
    () =>
      personalBudgetCategories.map((category) => {
        const budgetBase = numberOf(category.base_amount_snapshot);
        const usedBase = personalExpenses
          .filter((expense) => expense.category_id === category.id)
          .reduce(
            (sum, expense) => sum + numberOf(expense.base_amount_snapshot),
            0,
          );
        const remainingBase = budgetBase - usedBase;
        const percent =
          budgetBase > 0 ? Math.min((usedBase / budgetBase) * 100, 100) : 0;
        return { category, budgetBase, usedBase, remainingBase, percent };
      }),
    [personalBudgetCategories, personalExpenses],
  );
  const uncategorizedPersonalExpenseBase = useMemo(
    () =>
      personalExpenses
        .filter(
          (expense) =>
            !expense.category_id ||
            !personalBudgetCategories.some(
              (category) => category.id === expense.category_id,
            ),
        )
        .reduce(
          (sum, expense) => sum + numberOf(expense.base_amount_snapshot),
          0,
        ),
    [personalExpenses, personalBudgetCategories],
  );
  // 공용 회비 지출은 1인 기준으로 나누어 개인 여행비에도 반영합니다.
  // 예: 2명이 함께 식비 1,000원을 회비로 쓰면 각자의 여행비에는 500원이 반영됩니다.
  const commonFundSpentPerPersonBase =
    totalSpentBase / Math.max(memberCount, 1);
  const additionalActualSpentPerPersonBase =
    additionalGroupTotalBase / Math.max(memberCount, 1);
  const personalActualSpentBase =
    commonFundSpentPerPersonBase +
    additionalActualSpentPerPersonBase +
    personalExpenseTotalBase;
  // 개인 예산 잔액과 사용률은 공용 회비·별도 비용을 제외하고
  // 개인 소비에 실제로 사용한 금액만 기준으로 계산합니다.
  const personalBudgetRemainingBase =
    personalBudgetBase - personalExpenseTotalBase;
  const personalBudgetPercent =
    personalBudgetBase > 0
      ? Math.min((personalExpenseTotalBase / personalBudgetBase) * 100, 100)
      : 0;
  const ledgerEntries = useMemo<LedgerEntry[]>(() => {
    const fundEntries = expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      kind: "fund" as const,
      date: expense.spent_on,
      baseAmount: expenseBaseAmount(expense),
      title: expense.memo || "메모 없음",
      categoryName:
        categories.find((category) => category.id === expense.category_id)
          ?.name ?? "삭제된 카테고리",
      paymentMethod: expense.payment_method ?? "card",
      expense,
    }));
    const extraEntries = additionalCharges.map((charge) => {
      const base = numberOf(charge.base_amount_snapshot);
      return {
        id: `additional-${charge.id}`,
        kind: "additional" as const,
        date: charge.charge_date ?? charge.created_at.slice(0, 10),
        // 1인 기준 별도 비용은 그룹 전체 지출로 환산해 지출 내역 합계·달력·비중 그래프가 일치하도록 합니다.
        baseAmount:
          charge.charge_scope === "per_person" ? base * memberCount : base,
        title: charge.name,
        categoryName: "별도 비용",
        additional: charge,
      };
    });
    return [...fundEntries, ...extraEntries].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
  }, [expenses, additionalCharges, categories, memberCount]);

  const filteredLedgerEntries = useMemo(() => {
    return ledgerEntries.filter((entry) => {
      const typeOk = ledgerType === "all" || entry.kind === ledgerType;
      const categoryOk =
        filterCategory === "all" ||
        (entry.kind === "fund" &&
          entry.expense?.category_id === filterCategory);
      const dateOk = !ledgerSelectedDate || entry.date === ledgerSelectedDate;
      return typeOk && categoryOk && dateOk;
    });
  }, [ledgerEntries, ledgerType, filterCategory, ledgerSelectedDate]);

  const dailyTotals = useMemo(() => {
    return ledgerEntries.reduce<Record<string, number>>((map, entry) => {
      map[entry.date] = (map[entry.date] ?? 0) + entry.baseAmount;
      return map;
    }, {});
  }, [ledgerEntries]);

  const preTripTotalBase = useMemo(() => {
    if (!activeTrip?.travel_start_date) return 0;
    return ledgerEntries
      .filter((entry) => entry.date < activeTrip.travel_start_date!)
      .reduce((sum, entry) => sum + entry.baseAmount, 0);
  }, [activeTrip?.travel_start_date, ledgerEntries]);
  const duringTripTotalBase = useMemo(() => {
    if (!activeTrip?.travel_start_date || !activeTrip.travel_end_date) return 0;
    return ledgerEntries
      .filter((entry) =>
        sameOrBetween(
          entry.date,
          activeTrip.travel_start_date,
          activeTrip.travel_end_date,
        ),
      )
      .reduce((sum, entry) => sum + entry.baseAmount, 0);
  }, [
    activeTrip?.travel_start_date,
    activeTrip?.travel_end_date,
    ledgerEntries,
  ]);

  function closeModal() {
    Keyboard.dismiss();
    setModal(null);
  }

  async function refreshData() {
    setRefreshing(true);
    try {
      await loadGroups();
      if (activeTrip) await loadGroupDetail(activeTrip.id);
    } catch (error: unknown) {
      Alert.alert(
        "새로고침 실패",
        error instanceof Error ? error.message : "다시 시도해주세요.",
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function openTrip(trip: Trip) {
    setLoading(true);
    try {
      await loadGroupDetail(trip.id);
      setScreen("detail");
      setActiveCategoryId(null);
      setDetailTab("fund");
    } catch (error: unknown) {
      Alert.alert(
        "그룹 열기 실패",
        error instanceof Error ? error.message : "다시 시도해주세요.",
      );
    } finally {
      setLoading(false);
    }
  }

  function temporaryTripForNewGroup(
    rate = newGroupRate,
  ): Pick<Trip, "base_currency" | "secondary_currency" | "exchange_rate"> {
    return {
      base_currency: newBaseCurrency,
      secondary_currency: newSecondaryCurrency,
      exchange_rate: rate,
    };
  }

  function inputNumber(value: string) {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  function displayAmountFromBase(
    baseAmount: number,
    currency: Currency,
    trip: Pick<Trip, "base_currency" | "secondary_currency" | "exchange_rate">,
  ) {
    const converted = convertFromBase(baseAmount, currency, trip);
    return converted ? amountInputText(converted.sourceAmount, currency) : null;
  }

  // 개인 소비의 통화 버튼은 단순히 통화 표기만 바꾸지 않고,
  // 현재 입력한 실제 금액을 그룹 환율로 환산해 같은 가치가 유지되게 합니다.
  function convertedPersonalInputText(
    amountText: string,
    fromCurrency: Currency,
    toCurrency: Currency,
  ) {
    if (!activeTrip || !amountText.trim() || fromCurrency === toCurrency)
      return amountText;
    const amount = inputNumber(amountText);
    if (amount === null) return null;
    const conversion = convertToBase(amount, fromCurrency, activeTrip);
    return conversion
      ? displayAmountFromBase(conversion.baseAmount, toCurrency, activeTrip)
      : null;
  }

  function updatePersonalBudgetCurrency(nextCurrency: Currency) {
    const nextAmount = convertedPersonalInputText(
      personalBudgetAmount,
      personalBudgetCurrency,
      nextCurrency,
    );
    if (nextAmount === null) {
      Alert.alert("환율 확인", "선택한 통화의 환율을 확인하세요.");
      return;
    }
    setPersonalBudgetCurrency(nextCurrency);
    setPersonalBudgetAmount(nextAmount);
  }

  function updatePersonalCategoryBudgetCurrency(nextCurrency: Currency) {
    const nextAmount = convertedPersonalInputText(
      personalCategoryBudgetAmount,
      personalCategoryBudgetCurrency,
      nextCurrency,
    );
    if (nextAmount === null) {
      Alert.alert("환율 확인", "선택한 통화의 환율을 확인하세요.");
      return;
    }
    setPersonalCategoryBudgetCurrency(nextCurrency);
    setPersonalCategoryBudgetAmount(nextAmount);
  }

  function updatePersonalExpenseCurrency(nextCurrency: Currency) {
    const nextAmount = convertedPersonalInputText(
      personalExpenseAmount,
      personalExpenseCurrency,
      nextCurrency,
    );
    if (nextAmount === null) {
      Alert.alert("환율 확인", "선택한 통화의 환율을 확인하세요.");
      return;
    }
    setPersonalExpenseCurrency(nextCurrency);
    setPersonalExpenseAmount(nextAmount);
  }

  async function ensureNewGroupDraftTrip() {
    let rate = newGroupRate;
    if (
      newSecondaryCurrency &&
      newSecondaryCurrency !== newBaseCurrency &&
      !rate
    ) {
      rate = await fetchRate(newBaseCurrency, newSecondaryCurrency);
      setNewGroupRate(rate);
    }
    return temporaryTripForNewGroup(rate);
  }

  async function applyNewFundRemainder(
    target: PaymentMethod,
    targetValue: string,
    totalValue = newFundAmount,
    totalCurrency = newFundCurrency,
    cardCurrency = newCardFundCurrency,
    cashCurrency = newCashFundCurrency,
  ) {
    if (!totalValue.trim() || !targetValue.trim()) return;
    const total = inputNumber(totalValue);
    const amount = inputNumber(targetValue);
    if (total === null || total < 0 || amount === null || amount < 0) return;
    try {
      const trip = await ensureNewGroupDraftTrip();
      const totalConversion = convertToBase(total, totalCurrency, trip);
      const targetCurrency = target === "card" ? cardCurrency : cashCurrency;
      const targetConversion = convertToBase(amount, targetCurrency, trip);
      if (!totalConversion || !targetConversion) return;
      const otherCurrency = target === "card" ? cashCurrency : cardCurrency;
      const remainingBase =
        totalConversion.baseAmount - targetConversion.baseAmount;
      const remainderText = displayAmountFromBase(
        Math.max(remainingBase, 0),
        otherCurrency,
        trip,
      );
      if (remainderText === null) return;
      if (target === "card") setNewCashFundAmount(remainderText);
      else setNewCardFundAmount(remainderText);
    } catch {
      // 그룹 생성 전 환율은 저장 단계에서 다시 검증합니다.
    }
  }

  function updateNewFundAmount(value: string) {
    setNewFundAmount(value);
    const manualValue =
      newFundAutoTarget === "card" ? newCardFundAmount : newCashFundAmount;
    void applyNewFundRemainder(newFundAutoTarget, manualValue, value);
  }

  async function updateNewFundCurrency(currency: Currency) {
    const oldCurrency = newFundCurrency;
    let nextValue = newFundAmount;
    try {
      const value = inputNumber(newFundAmount);
      if (value !== null && newFundAmount.trim()) {
        const trip = await ensureNewGroupDraftTrip();
        const oldConversion = convertToBase(value, oldCurrency, trip);
        const converted = oldConversion
          ? displayAmountFromBase(oldConversion.baseAmount, currency, trip)
          : null;
        if (converted !== null) nextValue = converted;
      }
    } catch {
      Alert.alert(
        "환율 확인",
        "통화를 바꾸려면 환율을 불러올 수 있어야 합니다.",
      );
      return;
    }
    setNewFundCurrency(currency);
    setNewFundAmount(nextValue);
    const manualValue =
      newFundAutoTarget === "card" ? newCardFundAmount : newCashFundAmount;
    void applyNewFundRemainder(
      newFundAutoTarget,
      manualValue,
      nextValue,
      currency,
    );
  }

  function updateNewFundAllocationAmount(target: PaymentMethod, value: string) {
    if (target === "card") setNewCardFundAmount(value);
    else setNewCashFundAmount(value);
    setNewFundAutoTarget(target);
    void applyNewFundRemainder(target, value);
  }

  async function updateNewFundAllocationCurrency(
    target: PaymentMethod,
    currency: Currency,
  ) {
    const oldCurrency =
      target === "card" ? newCardFundCurrency : newCashFundCurrency;
    const oldValue = target === "card" ? newCardFundAmount : newCashFundAmount;
    const nextCardCurrency = target === "card" ? currency : newCardFundCurrency;
    const nextCashCurrency = target === "cash" ? currency : newCashFundCurrency;
    try {
      const trip = await ensureNewGroupDraftTrip();
      const oldAmount = inputNumber(oldValue);
      let nextValue = oldValue;
      if (oldAmount !== null && oldValue.trim()) {
        const oldConversion = convertToBase(oldAmount, oldCurrency, trip);
        const converted = oldConversion
          ? displayAmountFromBase(oldConversion.baseAmount, currency, trip)
          : null;
        if (converted !== null) nextValue = converted;
      }
      if (target === "card") {
        setNewCardFundCurrency(currency);
        setNewCardFundAmount(nextValue);
      } else {
        setNewCashFundCurrency(currency);
        setNewCashFundAmount(nextValue);
      }

      if (target === newFundAutoTarget) {
        void applyNewFundRemainder(
          target,
          nextValue,
          newFundAmount,
          newFundCurrency,
          nextCardCurrency,
          nextCashCurrency,
        );
      } else {
        const manualTarget = newFundAutoTarget;
        const manualValue =
          manualTarget === "card" ? newCardFundAmount : newCashFundAmount;
        void applyNewFundRemainder(
          manualTarget,
          manualValue,
          newFundAmount,
          newFundCurrency,
          nextCardCurrency,
          nextCashCurrency,
        );
      }
    } catch {
      Alert.alert(
        "환율 확인",
        "통화를 바꾸려면 환율을 불러올 수 있어야 합니다.",
      );
    }
  }

  async function createGroup() {
    const name = newTripName.trim();
    if (!name) {
      Alert.alert("입력 확인", "여행 그룹 이름을 입력하세요.");
      return;
    }

    const memberLimit = Number(newMemberLimit.trim());
    if (
      !Number.isInteger(memberLimit) ||
      memberLimit < 1 ||
      memberLimit > 100
    ) {
      Alert.alert(
        "참여 인원 확인",
        "최대 참여 인원은 생성자를 포함해 1명부터 100명 사이의 정수로 입력하세요.",
      );
      return;
    }

    const totalAmount = Number(newFundAmount.replace(/,/g, "") || 0);
    const cardText = newCardFundAmount.trim();
    const cashText = newCashFundAmount.trim();
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      Alert.alert("입력 확인", "1인 총 회비를 0원보다 크게 입력하세요.");
      return;
    }
    if (!cardText && !cashText) {
      Alert.alert(
        "배분 입력",
        "카드 또는 현금 회비 중 하나를 입력하세요. 나머지는 자동으로 배분됩니다.",
      );
      return;
    }

    setSaving(true);
    try {
      let groupRate: number | null = null;
      if (newSecondaryCurrency)
        groupRate = await fetchRate(newBaseCurrency, newSecondaryCurrency);
      const tempTrip = {
        ...temporaryTripForNewGroup(),
        exchange_rate: groupRate,
      };
      const totalConversion = convertToBase(
        totalAmount,
        newFundCurrency,
        tempTrip,
      );
      if (!totalConversion)
        throw new Error(
          "총 회비 통화의 환산을 할 수 없습니다. 환율을 다시 확인하세요.",
        );

      let cardAmount = cardText ? Number(cardText.replace(/,/g, "")) : null;
      let cashAmount = cashText ? Number(cashText.replace(/,/g, "")) : null;
      if (
        (cardAmount !== null &&
          (!Number.isFinite(cardAmount) || cardAmount < 0)) ||
        (cashAmount !== null &&
          (!Number.isFinite(cashAmount) || cashAmount < 0))
      ) {
        Alert.alert(
          "입력 확인",
          "카드·현금 회비는 각각 0원 이상으로 입력하세요.",
        );
        return;
      }

      let cardConversion =
        cardAmount === null
          ? null
          : convertToBase(cardAmount, newCardFundCurrency, tempTrip);
      let cashConversion =
        cashAmount === null
          ? null
          : convertToBase(cashAmount, newCashFundCurrency, tempTrip);
      if (
        (cardAmount !== null && !cardConversion) ||
        (cashAmount !== null && !cashConversion)
      ) {
        throw new Error(
          "카드 또는 현금 회비 통화의 환산을 할 수 없습니다. 환율을 다시 확인하세요.",
        );
      }

      if (cardConversion === null) {
        const remainingBase =
          totalConversion.baseAmount - (cashConversion?.baseAmount ?? 0);
        const remaining = convertFromBase(
          remainingBase,
          newCardFundCurrency,
          tempTrip,
        );
        if (!remaining || remainingBase < -0.01) {
          Alert.alert(
            "배분 합계 확인",
            "현금 회비가 1인 총 회비를 초과했습니다.",
          );
          return;
        }
        cardAmount = remaining.sourceAmount;
        cardConversion = {
          baseAmount: Math.max(remainingBase, 0),
          rate: remaining.rate,
        };
      } else if (cashConversion === null) {
        const remainingBase =
          totalConversion.baseAmount - cardConversion.baseAmount;
        const remaining = convertFromBase(
          remainingBase,
          newCashFundCurrency,
          tempTrip,
        );
        if (!remaining || remainingBase < -0.01) {
          Alert.alert(
            "배분 합계 확인",
            "카드 회비가 1인 총 회비를 초과했습니다.",
          );
          return;
        }
        cashAmount = remaining.sourceAmount;
        cashConversion = {
          baseAmount: Math.max(remainingBase, 0),
          rate: remaining.rate,
        };
      } else if (
        Math.abs(
          cardConversion.baseAmount +
            cashConversion.baseAmount -
            totalConversion.baseAmount,
        ) > FUND_SPLIT_TOLERANCE_BASE
      ) {
        Alert.alert(
          "배분 합계 확인",
          "카드·현금 배분 합계는 1인 총 회비와 같아야 합니다.",
        );
        return;
      }

      const { data, error } = await supabase.rpc(
        "create_trip_group_with_fund_v3",
        {
          p_name: name,
          p_member_limit: memberLimit,
          p_base_currency: newBaseCurrency,
          p_secondary_currency: newSecondaryCurrency,
          p_exchange_rate: groupRate,
          p_rate_updated_at: groupRate ? new Date().toISOString() : null,
          p_fund_per_person_amount: totalConversion.baseAmount,
          p_fund_currency: newBaseCurrency,
          p_fund_per_person_base_amount: totalConversion.baseAmount,
          p_fund_exchange_rate: 1,
        },
      );
      if (error) throw error;
      if (!data) throw new Error("그룹 ID를 만들지 못했습니다.");

      const { error: allocationError } = await supabase
        .from("trips")
        .update({
          fund_card_per_person_amount: cardAmount ?? 0,
          fund_cash_per_person_amount: cashAmount ?? 0,
          fund_card_per_person_currency: newCardFundCurrency,
          fund_cash_per_person_currency: newCashFundCurrency,
          fund_card_per_person_base_amount: cardConversion?.baseAmount ?? 0,
          fund_cash_per_person_base_amount: cashConversion?.baseAmount ?? 0,
        })
        .eq("id", data as string);
      if (allocationError) throw allocationError;

      // 최초 회비는 그룹의 기본 회비로만 저장합니다.
      // 회비 내역에는 이후 사용자가 추가한 회비만 1회차부터 기록합니다.

      setNewTripName("");
      setNewMemberLimit("2");
      setNewFundAmount("");
      setNewCardFundAmount("");
      setNewCashFundAmount("");
      setNewBaseCurrency("KRW");
      setNewSecondaryCurrency("JPY");
      setNewFundCurrency("KRW");
      setNewCardFundCurrency("KRW");
      setNewCashFundCurrency("KRW");
      closeModal();
      await loadGroups();
      await openTrip({ id: data as string } as Trip);
    } catch (error: unknown) {
      Alert.alert(
        "그룹 생성 실패",
        error instanceof Error ? error.message : "다시 시도해주세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function joinGroup() {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      Alert.alert("입력 확인", "친구에게 받은 그룹 코드를 입력하세요.");
      return;
    }

    setSaving(true);
    try {
      // 서버 RPC가 현재 기기의 익명 사용자 UUID를 trip_members에 등록합니다.
      const { data: joinedTripId, error } = await supabase.rpc(
        "join_trip_by_code_v3",
        { p_code: code },
      );
      if (error) throw error;

      if (typeof joinedTripId !== "string" || !joinedTripId) {
        throw new Error("그룹 참여 결과를 받지 못했습니다.");
      }

      // RLS 정책 적용 후에도 현재 기기가 정식 멤버인지 한 번 확인합니다.
      const { data: membership, error: membershipError } = await supabase
        .from("trip_members")
        .select("trip_id")
        .eq("trip_id", joinedTripId)
        .eq("user_id", userId)
        .maybeSingle();

      if (membershipError) throw membershipError;
      if (!membership)
        throw new Error(
          "그룹 참여자 등록을 확인하지 못했습니다. 그룹 코드를 다시 입력하세요.",
        );

      setJoinCode("");
      closeModal();
      await loadGroups();
      await openTrip({ id: joinedTripId } as Trip);
    } catch (error: unknown) {
      showAppAlert(
        "그룹 참여 실패",
        error instanceof Error
          ? error.message
          : "코드 또는 Supabase 권한 설정을 확인하세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  function amountInputText(value: number, currency: Currency) {
    return currency === "USD" || currency === "EUR"
      ? value.toFixed(2)
      : String(Math.round(value));
  }

  async function recordFundHistory(entry: {
    tripId: string;
    eventType: FundHistoryEventType;
    amount: number;
    currency: Currency;
    baseAmount: number;
    cardAmount: number;
    cardCurrency: Currency;
    cardBaseAmount: number;
    cashAmount: number;
    cashCurrency: Currency;
    cashBaseAmount: number;
    totalAfterBaseAmount: number;
    cardAfterBaseAmount: number;
    cashAfterBaseAmount: number;
    memberCountAtEvent: number;
  }) {
    const { error } = await supabase.from("fund_history").insert({
      trip_id: entry.tripId,
      event_type: entry.eventType,
      amount: entry.amount,
      currency: entry.currency,
      base_amount: entry.baseAmount,
      card_amount: entry.cardAmount,
      card_currency: entry.cardCurrency,
      card_base_amount: entry.cardBaseAmount,
      cash_amount: entry.cashAmount,
      cash_currency: entry.cashCurrency,
      cash_base_amount: entry.cashBaseAmount,
      total_after_base_amount: entry.totalAfterBaseAmount,
      card_after_base_amount: entry.cardAfterBaseAmount,
      cash_after_base_amount: entry.cashAfterBaseAmount,
      member_count: Math.max(1, entry.memberCountAtEvent),
    });
    if (error) throw error;
  }

  async function insertFundRound(entry: {
    tripId: string;
    amount: number;
    currency: Currency;
    baseAmount: number;
    cardAmount: number;
    cardCurrency: Currency;
    cardBaseAmount: number;
    cashAmount: number;
    cashCurrency: Currency;
    cashBaseAmount: number;
  }) {
    const { error } = await supabase.from("fund_rounds").insert({
      trip_id: entry.tripId,
      amount: entry.amount,
      currency: entry.currency,
      base_amount: entry.baseAmount,
      card_amount: entry.cardAmount,
      card_currency: entry.cardCurrency,
      card_base_amount: entry.cardBaseAmount,
      cash_amount: entry.cashAmount,
      cash_currency: entry.cashCurrency,
      cash_base_amount: entry.cashBaseAmount,
      // “회비 추가”에서 직접 만든 행임을 명확히 남깁니다.
      round_origin: "user_add",
      is_user_added: true,
    });
    if (error) throw error;
  }

  function openFundSettings(target: PaymentMethod = "card") {
    if (!activeTrip) return;
    setFundEditCardAmount(
      amountInputText(
        numberOf(activeTrip.fund_card_per_person_amount),
        cardFundCurrency(activeTrip),
      ),
    );
    setFundEditCardCurrency(cardFundCurrency(activeTrip));
    setFundEditCashAmount(
      amountInputText(
        numberOf(activeTrip.fund_cash_per_person_amount),
        cashFundCurrency(activeTrip),
      ),
    );
    setFundEditCashCurrency(cashFundCurrency(activeTrip));
    setFundEditAutoTarget(target);
    setModal("fundSettings");
  }

  function applyFundEditRemainder(
    target: PaymentMethod,
    targetValue: string,
    cardCurrency = fundEditCardCurrency,
    cashCurrency = fundEditCashCurrency,
  ) {
    if (!activeTrip || !targetValue.trim()) return;
    const amount = inputNumber(targetValue);
    if (amount === null || amount < 0) return;
    const targetCurrency = target === "card" ? cardCurrency : cashCurrency;
    const conversion = convertToBase(amount, targetCurrency, activeTrip);
    if (!conversion) return;
    const remainingBase =
      fundPerPersonBaseAmount(activeTrip) - conversion.baseAmount;
    const otherCurrency = target === "card" ? cashCurrency : cardCurrency;
    const remainderText = displayAmountFromBase(
      Math.max(remainingBase, 0),
      otherCurrency,
      activeTrip,
    );
    if (remainderText === null) return;
    if (target === "card") setFundEditCashAmount(remainderText);
    else setFundEditCardAmount(remainderText);
  }

  function updateFundEditAmount(target: PaymentMethod, value: string) {
    if (target === "card") setFundEditCardAmount(value);
    else setFundEditCashAmount(value);
    setFundEditAutoTarget(target);
    applyFundEditRemainder(target, value);
  }

  function updateFundEditCurrency(target: PaymentMethod, currency: Currency) {
    if (!activeTrip) return;
    const oldCurrency =
      target === "card" ? fundEditCardCurrency : fundEditCashCurrency;
    const oldValue =
      target === "card" ? fundEditCardAmount : fundEditCashAmount;
    const nextCardCurrency =
      target === "card" ? currency : fundEditCardCurrency;
    const nextCashCurrency =
      target === "cash" ? currency : fundEditCashCurrency;
    const oldAmount = inputNumber(oldValue);
    const oldConversion =
      oldAmount === null
        ? null
        : convertToBase(oldAmount, oldCurrency, activeTrip);
    const convertedText = oldConversion
      ? displayAmountFromBase(oldConversion.baseAmount, currency, activeTrip)
      : oldValue;
    if (convertedText === null) {
      Alert.alert("환율 확인", "선택한 통화의 환율을 확인하세요.");
      return;
    }

    if (target === "card") {
      setFundEditCardCurrency(currency);
      setFundEditCardAmount(convertedText);
    } else {
      setFundEditCashCurrency(currency);
      setFundEditCashAmount(convertedText);
    }

    // 사용자가 직접 정한 쪽은 실제 금액을 보존하고, 반대편은 '남은 회비'를 새 통화로 표시합니다.
    if (target === fundEditAutoTarget) {
      applyFundEditRemainder(
        target,
        convertedText,
        nextCardCurrency,
        nextCashCurrency,
      );
    } else {
      const manualValue =
        fundEditAutoTarget === "card" ? fundEditCardAmount : fundEditCashAmount;
      applyFundEditRemainder(
        fundEditAutoTarget,
        manualValue,
        nextCardCurrency,
        nextCashCurrency,
      );
    }
  }

  async function saveFundSettings() {
    if (!activeTrip) return;

    const expectedBase = fundPerPersonBaseAmount(activeTrip);
    const cardText = fundEditCardAmount.trim();
    const cashText = fundEditCashAmount.trim();
    if (!cardText && !cashText) {
      Alert.alert(
        "배분 입력",
        "카드 또는 현금 회비 중 한쪽을 입력하세요. 나머지는 자동으로 배분됩니다.",
      );
      return;
    }

    let cardAmount = cardText ? inputNumber(cardText) : null;
    let cashAmount = cashText ? inputNumber(cashText) : null;
    if (
      (cardAmount !== null && cardAmount < 0) ||
      (cashAmount !== null && cashAmount < 0)
    ) {
      Alert.alert(
        "입력 확인",
        "카드·현금 회비는 각각 0원 이상으로 입력하세요.",
      );
      return;
    }

    let cardConversion =
      cardAmount === null
        ? null
        : convertToBase(cardAmount, fundEditCardCurrency, activeTrip);
    let cashConversion =
      cashAmount === null
        ? null
        : convertToBase(cashAmount, fundEditCashCurrency, activeTrip);
    if (
      (cardAmount !== null && !cardConversion) ||
      (cashAmount !== null && !cashConversion)
    ) {
      showAppAlert(
        "환산 불가",
        "카드 또는 현금 회비 통화의 환율을 확인하세요.",
      );
      return;
    }

    if (cardConversion === null) {
      const remainingBase = expectedBase - (cashConversion?.baseAmount ?? 0);
      const remaining = convertFromBase(
        remainingBase,
        fundEditCardCurrency,
        activeTrip,
      );
      if (!remaining || remainingBase < -FUND_SPLIT_TOLERANCE_BASE) {
        Alert.alert(
          "배분 합계 확인",
          "현금 회비가 현재 총 회비를 초과했습니다.",
        );
        return;
      }
      cardAmount = remaining.sourceAmount;
      cardConversion = {
        baseAmount: Math.max(remainingBase, 0),
        rate: remaining.rate,
      };
    } else if (cashConversion === null) {
      const remainingBase = expectedBase - cardConversion.baseAmount;
      const remaining = convertFromBase(
        remainingBase,
        fundEditCashCurrency,
        activeTrip,
      );
      if (!remaining || remainingBase < -FUND_SPLIT_TOLERANCE_BASE) {
        Alert.alert(
          "배분 합계 확인",
          "카드 회비가 현재 총 회비를 초과했습니다.",
        );
        return;
      }
      cashAmount = remaining.sourceAmount;
      cashConversion = {
        baseAmount: Math.max(remainingBase, 0),
        rate: remaining.rate,
      };
    } else if (
      Math.abs(
        cardConversion.baseAmount + cashConversion.baseAmount - expectedBase,
      ) > FUND_SPLIT_TOLERANCE_BASE
    ) {
      Alert.alert(
        "배분 합계 확인",
        "카드·현금 배분 합계는 현재 총 회비와 같아야 합니다.",
      );
      return;
    }

    const nextTotalGroupBase = expectedBase * memberCount;
    if (
      cardSpentBase > (cardConversion?.baseAmount ?? 0) * memberCount + 0.01 ||
      cashSpentBase > (cashConversion?.baseAmount ?? 0) * memberCount + 0.01
    ) {
      Alert.alert(
        "잔액 확인",
        "이미 등록한 카드 또는 현금 지출보다 작은 금액으로 배분할 수 없습니다.",
      );
      return;
    }
    if (
      totalSpentBase > nextTotalGroupBase + 0.01 ||
      categoryBudgetTotalBase > nextTotalGroupBase + 0.01
    ) {
      Alert.alert(
        "회비 확인",
        "현재 총 회비보다 큰 공용 지출 또는 카테고리 배정이 있습니다.",
      );
      return;
    }

    const allocationChanged =
      Math.abs(
        numberOf(activeTrip.fund_card_per_person_base_amount) -
          (cardConversion?.baseAmount ?? 0),
      ) > FUND_SPLIT_TOLERANCE_BASE ||
      Math.abs(
        numberOf(activeTrip.fund_cash_per_person_base_amount) -
          (cashConversion?.baseAmount ?? 0),
      ) > FUND_SPLIT_TOLERANCE_BASE ||
      cardFundCurrency(activeTrip) !== fundEditCardCurrency ||
      cashFundCurrency(activeTrip) !== fundEditCashCurrency;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("trips")
        .update({
          fund_card_per_person_amount: cardAmount ?? 0,
          fund_cash_per_person_amount: cashAmount ?? 0,
          fund_card_per_person_currency: fundEditCardCurrency,
          fund_cash_per_person_currency: fundEditCashCurrency,
          fund_card_per_person_base_amount: cardConversion?.baseAmount ?? 0,
          fund_cash_per_person_base_amount: cashConversion?.baseAmount ?? 0,
        })
        .eq("id", activeTrip.id);
      if (error) throw error;
      if (allocationChanged) {
        await recordFundHistory({
          tripId: activeTrip.id,
          eventType: "allocation_update",
          amount: 0,
          currency: activeTrip.base_currency,
          baseAmount: 0,
          cardAmount: 0,
          cardCurrency: fundEditCardCurrency,
          cardBaseAmount: 0,
          cashAmount: 0,
          cashCurrency: fundEditCashCurrency,
          cashBaseAmount: 0,
          totalAfterBaseAmount: expectedBase,
          cardAfterBaseAmount: cardConversion?.baseAmount ?? 0,
          cashAfterBaseAmount: cashConversion?.baseAmount ?? 0,
          memberCountAtEvent: memberCount,
        });
      }
      closeModal();
      await loadGroupDetail(activeTrip.id);
      await loadGroups();
    } catch (error: unknown) {
      Alert.alert(
        "배분 수정 실패",
        error instanceof Error
          ? error.message
          : "참여자 권한 또는 Supabase SQL 설정을 확인하세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmResetSharedBudget() {
    if (!activeTrip) return;
    confirmDestructiveAction(
      "전체 공용 예산 초기화",
      "개인 소비를 제외한 공용 예산을 모두 초기화할까요? 공용 회비, 회비 추가 내역, 회비 카테고리, 공용 지출, 별도 비용이 삭제됩니다. 그룹 이름·여행 일정·참여자·초대 코드와 개인 소비는 유지됩니다. 이 작업은 되돌릴 수 없습니다.",
      () => void resetSharedBudget(),
      "전체 초기화",
    );
  }

  async function resetSharedBudget() {
    if (!activeTrip) return;
    setSaving(true);
    try {
      const { error } = await supabase.rpc("reset_trip_shared_budget_v3", {
        p_trip_id: activeTrip.id,
      });
      if (error) throw error;
      await loadGroupDetail(activeTrip.id);
      await loadGroups();
    } catch (error: unknown) {
      showAppAlert(
        "전체 공용 예산 초기화 실패",
        error instanceof Error
          ? error.message
          : "그룹 참여자 권한 또는 Supabase SQL 설정을 확인하세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  function openInitialFundEdit() {
    if (!activeTrip) return;
    const cardCurrency = cardFundCurrency(activeTrip);
    const cashCurrency = cashFundCurrency(activeTrip);
    const cardAmount = convertFromBase(
      initialFundPaymentSplit.cardBase,
      cardCurrency,
      activeTrip,
    );
    const cashAmount = convertFromBase(
      initialFundPaymentSplit.cashBase,
      cashCurrency,
      activeTrip,
    );
    if (!cardAmount || !cashAmount) {
      showAppAlert(
        "환산 불가",
        "기본 회비의 카드·현금 통화와 환율을 확인하세요.",
      );
      return;
    }
    setEditingFundRoundId(INITIAL_FUND_EDIT_ID);
    setFundAddTotalAmount(
      amountInputText(initialFundBase, activeTrip.base_currency),
    );
    setFundAddTotalCurrency(activeTrip.base_currency);
    setFundAddCardAmount(
      amountInputText(cardAmount.sourceAmount, cardCurrency),
    );
    setFundAddCardCurrency(cardCurrency);
    setFundAddCashAmount(
      amountInputText(cashAmount.sourceAmount, cashCurrency),
    );
    setFundAddCashCurrency(cashCurrency);
    setFundAddAutoTarget("card");
    setModal("fundAdd");
  }

  function confirmDeleteInitialFund() {
    if (!activeTrip) return;
    const nextFundBase = Math.max(
      0,
      fundPerPersonBaseAmount(activeTrip) - initialFundBase,
    );
    const preferredCardBase =
      numberOf(activeTrip.fund_card_per_person_base_amount) -
      initialFundPaymentSplit.cardBase;
    const nextSplit = paymentSplitForNextFund(nextFundBase, preferredCardBase);
    const nextGroupTotalBase = nextFundBase * memberCount;
    if (!nextSplit) {
      showAppAlert(
        "기본 회비 삭제 불가",
        "삭제 후에는 이미 사용한 카드·현금 금액을 유지할 수 없습니다.",
      );
      return;
    }
    if (
      totalSpentBase > nextGroupTotalBase + 0.01 ||
      categoryBudgetTotalBase > nextGroupTotalBase + 0.01
    ) {
      showAppAlert(
        "기본 회비 삭제 불가",
        "삭제 후 남는 회비보다 공용 지출 또는 카테고리 예산이 큽니다.",
      );
      return;
    }
    confirmDestructiveAction(
      "1회차 기본 회비 삭제",
      `${formatMoney(initialFundBase, activeTrip.base_currency)} 기본 회비를 삭제할까요? 이후 추가 회비는 유지됩니다.`,
      () => void deleteInitialFund(),
    );
  }

  async function deleteInitialFund() {
    if (!activeTrip) return;
    const nextFundBase = Math.max(
      0,
      fundPerPersonBaseAmount(activeTrip) - initialFundBase,
    );
    const preferredCardBase =
      numberOf(activeTrip.fund_card_per_person_base_amount) -
      initialFundPaymentSplit.cardBase;
    const nextSplit = paymentSplitForNextFund(nextFundBase, preferredCardBase);
    if (!nextSplit) {
      showAppAlert(
        "기본 회비 삭제 불가",
        "삭제 후에는 이미 사용한 카드·현금 금액을 유지할 수 없습니다.",
      );
      return;
    }
    const nextCardCurrency =
      nextSplit.cardBase > FUND_SPLIT_TOLERANCE_BASE
        ? cardFundCurrency(activeTrip)
        : activeTrip.base_currency;
    const nextCashCurrency =
      nextSplit.cashBase > FUND_SPLIT_TOLERANCE_BASE
        ? cashFundCurrency(activeTrip)
        : activeTrip.base_currency;
    const nextCardAmount = convertFromBase(
      nextSplit.cardBase,
      nextCardCurrency,
      activeTrip,
    );
    const nextCashAmount = convertFromBase(
      nextSplit.cashBase,
      nextCashCurrency,
      activeTrip,
    );
    if (!nextCardAmount || !nextCashAmount) {
      showAppAlert(
        "환산 불가",
        "카드 또는 현금 회비 통화의 환율을 확인하세요.",
      );
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("trips")
        .update({
          fund_per_person_amount: nextFundBase,
          fund_currency: activeTrip.base_currency,
          fund_per_person_base_amount: nextFundBase,
          fund_exchange_rate: 1,
          fund_card_per_person_amount: nextCardAmount.sourceAmount,
          fund_cash_per_person_amount: nextCashAmount.sourceAmount,
          fund_card_per_person_currency: nextCardCurrency,
          fund_cash_per_person_currency: nextCashCurrency,
          fund_card_per_person_base_amount: nextSplit.cardBase,
          fund_cash_per_person_base_amount: nextSplit.cashBase,
        })
        .eq("id", activeTrip.id);
      if (error) throw error;
      await loadGroupDetail(activeTrip.id);
      await loadGroups();
    } catch (error: unknown) {
      showAppAlert(
        "기본 회비 삭제 실패",
        error instanceof Error
          ? error.message
          : "그룹 참여자 권한 또는 Supabase SQL 설정을 확인하세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  function openFundRoundEdit(round: FundRound) {
    if (!activeTrip) return;
    if (round.round_origin !== "user_add") {
      Alert.alert(
        "수정할 수 없는 회차",
        "자동 생성된 기준 행은 회비 내역에 포함되지 않습니다.",
      );
      return;
    }
    setEditingFundRoundId(round.id);
    setFundAddTotalAmount(
      amountInputText(numberOf(round.amount), round.currency),
    );
    setFundAddTotalCurrency(round.currency);
    setFundAddCardAmount(
      amountInputText(
        numberOf(round.card_amount),
        round.card_currency ?? activeTrip.base_currency,
      ),
    );
    setFundAddCardCurrency(round.card_currency ?? cardFundCurrency(activeTrip));
    setFundAddCashAmount(
      amountInputText(
        numberOf(round.cash_amount),
        round.cash_currency ?? activeTrip.base_currency,
      ),
    );
    setFundAddCashCurrency(round.cash_currency ?? cashFundCurrency(activeTrip));
    setFundAddAutoTarget("card");
    setModal("fundAdd");
  }

  function confirmDeleteFundRound(round: FundRound, roundNumber: number) {
    if (!activeTrip) return;
    const nextFundBase =
      fundPerPersonBaseAmount(activeTrip) - numberOf(round.base_amount);
    const preferredCardBase =
      numberOf(activeTrip.fund_card_per_person_base_amount) -
      numberOf(round.card_base_amount);
    const nextSplit = paymentSplitForNextFund(nextFundBase, preferredCardBase);
    const nextGroupTotalBase = Math.max(0, nextFundBase) * memberCount;

    if (!nextSplit) {
      showAppAlert(
        "회차 삭제 불가",
        "삭제 후에는 이미 사용한 카드·현금 금액을 유지할 수 없습니다.",
      );
      return;
    }
    if (
      totalSpentBase > nextGroupTotalBase + 0.01 ||
      categoryBudgetTotalBase > nextGroupTotalBase + 0.01
    ) {
      showAppAlert(
        "회차 삭제 불가",
        "삭제 후 남는 회비보다 공용 지출 또는 카테고리 예산이 큽니다.",
      );
      return;
    }

    confirmDestructiveAction(
      `${roundNumber}회차 회비 삭제`,
      `${formatMoney(numberOf(round.amount), round.currency)} 추가 회비를 삭제할까요? 전체 회비와 카드·현금 배분도 함께 조정됩니다.`,
      () => void deleteFundRound(round),
    );
  }

  async function deleteFundRound(round: FundRound) {
    if (!activeTrip) return;
    if (round.round_origin !== "user_add") {
      showAppAlert(
        "삭제할 수 없는 회차",
        "자동 생성된 기준 행은 회비 내역에 포함되지 않습니다.",
      );
      return;
    }
    const nextFundBase = Math.max(
      0,
      fundPerPersonBaseAmount(activeTrip) - numberOf(round.base_amount),
    );
    const preferredCardBase =
      numberOf(activeTrip.fund_card_per_person_base_amount) -
      numberOf(round.card_base_amount);
    const nextSplit = paymentSplitForNextFund(nextFundBase, preferredCardBase);
    if (!nextSplit) {
      showAppAlert(
        "회차 삭제 불가",
        "삭제 후에는 이미 사용한 카드·현금 금액을 유지할 수 없습니다.",
      );
      return;
    }

    const nextCardCurrency =
      nextSplit.cardBase > FUND_SPLIT_TOLERANCE_BASE
        ? cardFundCurrency(activeTrip)
        : (round.card_currency ?? activeTrip.base_currency);
    const nextCashCurrency =
      nextSplit.cashBase > FUND_SPLIT_TOLERANCE_BASE
        ? cashFundCurrency(activeTrip)
        : (round.cash_currency ?? activeTrip.base_currency);
    const nextCardAmount = convertFromBase(
      nextSplit.cardBase,
      nextCardCurrency,
      activeTrip,
    );
    const nextCashAmount = convertFromBase(
      nextSplit.cashBase,
      nextCashCurrency,
      activeTrip,
    );
    if (!nextCardAmount || !nextCashAmount) {
      showAppAlert(
        "환산 불가",
        "카드 또는 현금 회비 통화의 환율을 확인하세요.",
      );
      return;
    }

    setSaving(true);
    try {
      const { error: tripError } = await supabase
        .from("trips")
        .update({
          fund_per_person_amount: nextFundBase,
          fund_currency: activeTrip.base_currency,
          fund_per_person_base_amount: nextFundBase,
          fund_exchange_rate: 1,
          fund_card_per_person_amount: nextCardAmount.sourceAmount,
          fund_cash_per_person_amount: nextCashAmount.sourceAmount,
          fund_card_per_person_currency: nextCardCurrency,
          fund_cash_per_person_currency: nextCashCurrency,
          fund_card_per_person_base_amount: nextSplit.cardBase,
          fund_cash_per_person_base_amount: nextSplit.cashBase,
        })
        .eq("id", activeTrip.id);
      if (tripError) throw tripError;
      const { error: roundError } = await supabase
        .from("fund_rounds")
        .delete()
        .eq("id", round.id)
        .eq("trip_id", activeTrip.id);
      if (roundError) throw roundError;
      await loadGroupDetail(activeTrip.id);
      await loadGroups();
    } catch (error: unknown) {
      showAppAlert(
        "회차 삭제 실패",
        error instanceof Error
          ? error.message
          : "그룹 참여자 권한 또는 Supabase SQL 설정을 확인하세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  function openFundAdd() {
    if (!activeTrip) return;
    setEditingFundRoundId(null);
    setFundAddTotalAmount("");
    setFundAddTotalCurrency(activeTrip.base_currency);
    setFundAddCardAmount("");
    setFundAddCashAmount("");
    setFundAddCardCurrency(cardFundCurrency(activeTrip));
    setFundAddCashCurrency(cashFundCurrency(activeTrip));
    setFundAddAutoTarget("card");
    setModal("fundAdd");
  }

  function applyFundAddRemainder(
    target: PaymentMethod,
    targetValue: string,
    totalValue = fundAddTotalAmount,
    totalCurrency = fundAddTotalCurrency,
    cardCurrency = fundAddCardCurrency,
    cashCurrency = fundAddCashCurrency,
  ) {
    if (!activeTrip || !totalValue.trim() || !targetValue.trim()) return;
    const total = inputNumber(totalValue);
    const amount = inputNumber(targetValue);
    if (total === null || total < 0 || amount === null || amount < 0) return;
    const totalConversion = convertToBase(total, totalCurrency, activeTrip);
    const targetCurrency = target === "card" ? cardCurrency : cashCurrency;
    const targetConversion = convertToBase(amount, targetCurrency, activeTrip);
    if (!totalConversion || !targetConversion) return;
    const otherCurrency = target === "card" ? cashCurrency : cardCurrency;
    const remainingText = displayAmountFromBase(
      Math.max(totalConversion.baseAmount - targetConversion.baseAmount, 0),
      otherCurrency,
      activeTrip,
    );
    if (remainingText === null) return;
    if (target === "card") setFundAddCashAmount(remainingText);
    else setFundAddCardAmount(remainingText);
  }

  function updateFundAddAmount(target: PaymentMethod, value: string) {
    if (target === "card") setFundAddCardAmount(value);
    else setFundAddCashAmount(value);
    setFundAddAutoTarget(target);
    applyFundAddRemainder(target, value);
  }

  function updateFundAddTotalAmount(value: string) {
    setFundAddTotalAmount(value);
    const manualValue =
      fundAddAutoTarget === "card" ? fundAddCardAmount : fundAddCashAmount;
    applyFundAddRemainder(fundAddAutoTarget, manualValue, value);
  }

  function updateFundAddTotalCurrency(currency: Currency) {
    if (!activeTrip) return;
    const oldAmount = inputNumber(fundAddTotalAmount);
    const oldConversion =
      oldAmount === null
        ? null
        : convertToBase(oldAmount, fundAddTotalCurrency, activeTrip);
    const nextValue = oldConversion
      ? displayAmountFromBase(oldConversion.baseAmount, currency, activeTrip)
      : fundAddTotalAmount;
    if (nextValue === null) {
      Alert.alert("환율 확인", "선택한 통화의 환율을 확인하세요.");
      return;
    }
    setFundAddTotalCurrency(currency);
    setFundAddTotalAmount(nextValue);
    const manualValue =
      fundAddAutoTarget === "card" ? fundAddCardAmount : fundAddCashAmount;
    applyFundAddRemainder(fundAddAutoTarget, manualValue, nextValue, currency);
  }

  function updateFundAddCurrency(target: PaymentMethod, currency: Currency) {
    if (!activeTrip) return;
    const oldCurrency =
      target === "card" ? fundAddCardCurrency : fundAddCashCurrency;
    const oldValue = target === "card" ? fundAddCardAmount : fundAddCashAmount;
    const nextCardCurrency = target === "card" ? currency : fundAddCardCurrency;
    const nextCashCurrency = target === "cash" ? currency : fundAddCashCurrency;
    const oldAmount = inputNumber(oldValue);
    const oldConversion =
      oldAmount === null
        ? null
        : convertToBase(oldAmount, oldCurrency, activeTrip);
    const nextValue = oldConversion
      ? displayAmountFromBase(oldConversion.baseAmount, currency, activeTrip)
      : oldValue;
    if (nextValue === null) {
      Alert.alert("환율 확인", "선택한 통화의 환율을 확인하세요.");
      return;
    }
    if (target === "card") {
      setFundAddCardCurrency(currency);
      setFundAddCardAmount(nextValue);
    } else {
      setFundAddCashCurrency(currency);
      setFundAddCashAmount(nextValue);
    }
    if (target === fundAddAutoTarget) {
      applyFundAddRemainder(
        target,
        nextValue,
        fundAddTotalAmount,
        fundAddTotalCurrency,
        nextCardCurrency,
        nextCashCurrency,
      );
    } else {
      const manualValue =
        fundAddAutoTarget === "card" ? fundAddCardAmount : fundAddCashAmount;
      applyFundAddRemainder(
        fundAddAutoTarget,
        manualValue,
        fundAddTotalAmount,
        fundAddTotalCurrency,
        nextCardCurrency,
        nextCashCurrency,
      );
    }
  }

  async function saveFundAdd() {
    if (!activeTrip) return;

    const isEditingInitialFund = editingFundRoundId === INITIAL_FUND_EDIT_ID;
    const editingRound =
      editingFundRoundId && !isEditingInitialFund
        ? (fundRounds.find((round) => round.id === editingFundRoundId) ?? null)
        : null;
    if (editingFundRoundId && !isEditingInitialFund && !editingRound) {
      showAppAlert(
        "회비 내역 확인",
        "수정할 회비 회차를 찾지 못했습니다. 새로고침 후 다시 시도하세요.",
      );
      return;
    }

    const totalAmount = Number(fundAddTotalAmount.replace(/,/g, "") || 0);
    const cardText = fundAddCardAmount.trim();
    const cashText = fundAddCashAmount.trim();
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      Alert.alert("입력 확인", "회비 금액을 0원보다 크게 입력하세요.");
      return;
    }
    if (!cardText && !cashText) {
      Alert.alert(
        "배분 입력",
        "카드 또는 현금 회비 중 하나를 입력하세요. 나머지는 자동으로 배분됩니다.",
      );
      return;
    }

    const totalConversion = convertToBase(
      totalAmount,
      fundAddTotalCurrency,
      activeTrip,
    );
    let roundCardAmount = cardText ? Number(cardText.replace(/,/g, "")) : null;
    let roundCashAmount = cashText ? Number(cashText.replace(/,/g, "")) : null;
    if (
      !totalConversion ||
      (roundCardAmount !== null &&
        (!Number.isFinite(roundCardAmount) || roundCardAmount < 0)) ||
      (roundCashAmount !== null &&
        (!Number.isFinite(roundCashAmount) || roundCashAmount < 0))
    ) {
      Alert.alert("입력 확인", "회비 금액과 통화를 확인하세요.");
      return;
    }

    let roundCardConversion =
      roundCardAmount === null
        ? null
        : convertToBase(roundCardAmount, fundAddCardCurrency, activeTrip);
    let roundCashConversion =
      roundCashAmount === null
        ? null
        : convertToBase(roundCashAmount, fundAddCashCurrency, activeTrip);
    if (
      (roundCardAmount !== null && !roundCardConversion) ||
      (roundCashAmount !== null && !roundCashConversion)
    ) {
      showAppAlert(
        "환산 불가",
        "카드 또는 현금 회비 통화의 환율을 확인하세요.",
      );
      return;
    }

    if (roundCardConversion === null) {
      const remainingBase =
        totalConversion.baseAmount - (roundCashConversion?.baseAmount ?? 0);
      const remaining = convertFromBase(
        remainingBase,
        fundAddCardCurrency,
        activeTrip,
      );
      if (!remaining || remainingBase < -FUND_SPLIT_TOLERANCE_BASE) {
        Alert.alert(
          "배분 합계 확인",
          "현금 회비가 이번 회차 금액을 초과했습니다.",
        );
        return;
      }
      roundCardAmount = remaining.sourceAmount;
      roundCardConversion = {
        baseAmount: Math.max(remainingBase, 0),
        rate: remaining.rate,
      };
    } else if (roundCashConversion === null) {
      const remainingBase =
        totalConversion.baseAmount - roundCardConversion.baseAmount;
      const remaining = convertFromBase(
        remainingBase,
        fundAddCashCurrency,
        activeTrip,
      );
      if (!remaining || remainingBase < -FUND_SPLIT_TOLERANCE_BASE) {
        Alert.alert(
          "배분 합계 확인",
          "카드 회비가 이번 회차 금액을 초과했습니다.",
        );
        return;
      }
      roundCashAmount = remaining.sourceAmount;
      roundCashConversion = {
        baseAmount: Math.max(remainingBase, 0),
        rate: remaining.rate,
      };
    } else if (
      Math.abs(
        roundCardConversion.baseAmount +
          roundCashConversion.baseAmount -
          totalConversion.baseAmount,
      ) > FUND_SPLIT_TOLERANCE_BASE
    ) {
      Alert.alert(
        "배분 합계 확인",
        "카드·현금 배분 합계는 이번 회차 회비와 같아야 합니다.",
      );
      return;
    }

    const oldRoundBase = isEditingInitialFund
      ? initialFundBase
      : editingRound
        ? numberOf(editingRound.base_amount)
        : 0;
    const oldRoundCardBase = isEditingInitialFund
      ? initialFundPaymentSplit.cardBase
      : editingRound
        ? numberOf(editingRound.card_base_amount)
        : 0;
    const nextFundBase =
      fundPerPersonBaseAmount(activeTrip) -
      oldRoundBase +
      totalConversion.baseAmount;
    const preferredCardBase =
      numberOf(activeTrip.fund_card_per_person_base_amount) -
      oldRoundCardBase +
      (roundCardConversion?.baseAmount ?? 0);
    const nextSplit = paymentSplitForNextFund(nextFundBase, preferredCardBase);
    const nextGroupTotalBase = nextFundBase * memberCount;

    if (!nextSplit) {
      Alert.alert(
        "회비 수정 불가",
        "수정 후에는 이미 사용한 카드·현금 금액을 유지할 수 없습니다.",
      );
      return;
    }
    const nextCardBase = nextSplit.cardBase;
    const nextCashBase = nextSplit.cashBase;
    if (
      totalSpentBase > nextGroupTotalBase + 0.01 ||
      categoryBudgetTotalBase > nextGroupTotalBase + 0.01
    ) {
      Alert.alert(
        "회비 수정 불가",
        "수정 후 회비보다 공용 지출 또는 카테고리 예산이 커집니다.",
      );
      return;
    }
    if (
      cardSpentBase > nextCardBase * memberCount + 0.01 ||
      cashSpentBase > nextCashBase * memberCount + 0.01
    ) {
      Alert.alert(
        "회비 수정 불가",
        "수정 후 카드 또는 현금 회비가 이미 사용한 금액보다 작아집니다.",
      );
      return;
    }

    // 현재 사용 중인 배분 통화는 유지하고, 수단이 새로 생기는 경우에만 이번 회차의 입력 통화를 사용합니다.
    const nextCardCurrency =
      numberOf(activeTrip.fund_card_per_person_base_amount) >
      FUND_SPLIT_TOLERANCE_BASE
        ? cardFundCurrency(activeTrip)
        : fundAddCardCurrency;
    const nextCashCurrency =
      numberOf(activeTrip.fund_cash_per_person_base_amount) >
      FUND_SPLIT_TOLERANCE_BASE
        ? cashFundCurrency(activeTrip)
        : fundAddCashCurrency;
    const nextCardConversion = convertFromBase(
      nextCardBase,
      nextCardCurrency,
      activeTrip,
    );
    const nextCashConversion = convertFromBase(
      nextCashBase,
      nextCashCurrency,
      activeTrip,
    );
    if (!nextCardConversion || !nextCashConversion) {
      Alert.alert(
        "환산 불가",
        "기존 카드 또는 현금 회비 통화의 환율을 확인하세요.",
      );
      return;
    }

    setSaving(true);
    try {
      const { error: tripError } = await supabase
        .from("trips")
        .update({
          fund_per_person_amount: nextFundBase,
          fund_currency: activeTrip.base_currency,
          fund_per_person_base_amount: nextFundBase,
          fund_exchange_rate: 1,
          fund_card_per_person_amount: nextCardConversion.sourceAmount,
          fund_cash_per_person_amount: nextCashConversion.sourceAmount,
          fund_card_per_person_currency: nextCardCurrency,
          fund_cash_per_person_currency: nextCashCurrency,
          fund_card_per_person_base_amount: nextCardBase,
          fund_cash_per_person_base_amount: nextCashBase,
        })
        .eq("id", activeTrip.id);
      if (tripError) throw tripError;

      const roundPayload = {
        amount: totalAmount,
        currency: fundAddTotalCurrency,
        base_amount: totalConversion.baseAmount,
        card_amount: roundCardAmount ?? 0,
        card_currency: fundAddCardCurrency,
        card_base_amount: roundCardConversion?.baseAmount ?? 0,
        cash_amount: roundCashAmount ?? 0,
        cash_currency: fundAddCashCurrency,
        cash_base_amount: roundCashConversion?.baseAmount ?? 0,
        round_origin: "user_add",
        is_user_added: true,
        updated_at: new Date().toISOString(),
      };
      if (editingRound) {
        const { error: roundError } = await supabase
          .from("fund_rounds")
          .update(roundPayload)
          .eq("id", editingRound.id)
          .eq("trip_id", activeTrip.id);
        if (roundError) throw roundError;
      } else if (!isEditingInitialFund) {
        await insertFundRound({
          tripId: activeTrip.id,
          amount: totalAmount,
          currency: fundAddTotalCurrency,
          baseAmount: totalConversion.baseAmount,
          cardAmount: roundCardAmount ?? 0,
          cardCurrency: fundAddCardCurrency,
          cardBaseAmount: roundCardConversion?.baseAmount ?? 0,
          cashAmount: roundCashAmount ?? 0,
          cashCurrency: fundAddCashCurrency,
          cashBaseAmount: roundCashConversion?.baseAmount ?? 0,
        });
      }
      setFundAddTotalAmount("");
      setFundAddCardAmount("");
      setFundAddCashAmount("");
      setEditingFundRoundId(null);
      closeModal();
      await loadGroupDetail(activeTrip.id);
      await loadGroups();
    } catch (error: unknown) {
      showAppAlert(
        isEditingInitialFund
          ? "기본 회비 수정 실패"
          : editingRound
            ? "회비 회차 수정 실패"
            : "회비 추가 실패",
        error instanceof Error
          ? error.message
          : "참여자 권한 또는 Supabase SQL 설정을 확인하세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  function openNewCategory() {
    if (!activeTrip) return;
    setEditingCategoryId(null);
    setCategoryName("");
    setCategoryAmount("");
    setCategoryCurrency(activeTrip.base_currency);
    setModal("category");
  }

  function openEditCategory(category: Category) {
    if (!activeTrip) return;
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategoryAmount(String(categorySourceAmount(category)));
    setCategoryCurrency(categorySourceCurrency(category, activeTrip));
    setModal("category");
  }

  function openCategoryDetail(category: Category) {
    setActiveCategoryId(category.id);
    setDetailTab("fund");
    setScreen("categoryDetail");
  }

  function closeCategoryDetail() {
    setActiveCategoryId(null);
    setScreen("detail");
    setDetailTab("fund");
  }

  async function saveCategory() {
    if (!activeTrip) return;
    const name = categoryName.trim();
    const amount = Number(categoryAmount.replace(/,/g, ""));
    if (!name || !amount || amount <= 0) {
      Alert.alert(
        "입력 확인",
        "카테고리 이름과 0원보다 큰 그룹 예산을 입력하세요.",
      );
      return;
    }

    const converted = convertToBase(amount, categoryCurrency, activeTrip);
    if (!converted) {
      Alert.alert("환산 불가", "선택한 통화의 환율을 확인하세요.");
      return;
    }

    const otherAllocated = categories
      .filter((category) => category.id !== editingCategoryId)
      .reduce((sum, category) => sum + categoryBaseAmount(category), 0);
    const nextAllocated = otherAllocated + converted.baseAmount;
    const totalFund =
      numberOf(activeTrip.fund_per_person_base_amount) *
      (memberCounts[activeTrip.id] ?? 1);

    if (totalFund <= 0) {
      Alert.alert("회비 설정 필요", "먼저 1인 회비를 설정하세요.");
      return;
    }
    if (nextAllocated > totalFund + 0.01) {
      Alert.alert(
        "회비 배정 초과",
        `카테고리 총예산이 총 회비 ${formatMoney(totalFund, activeTrip.base_currency)}를 넘을 수 없습니다.`,
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        // 기존 budget 칼럼은 호환성을 위해 기준 통화 금액도 함께 저장합니다.
        budget: converted.baseAmount,
        group_budget_amount: amount,
        group_budget_currency: categoryCurrency,
        group_budget_base_amount: converted.baseAmount,
        group_budget_exchange_rate: converted.rate,
      };

      if (editingCategoryId) {
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingCategoryId)
          .eq("trip_id", activeTrip.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert({
          trip_id: activeTrip.id,
          ...payload,
          sort_order: categories.length,
        });
        if (error) throw error;
      }
      closeModal();
      await loadGroupDetail(activeTrip.id);
    } catch (error: unknown) {
      Alert.alert(
        "카테고리 저장 실패",
        error instanceof Error ? error.message : "다시 시도해주세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmDeleteCategory(category: Category) {
    confirmDestructiveAction(
      "카테고리 삭제",
      `“${category.name}” 카테고리와 연결된 지출 내역도 함께 삭제됩니다.`,
      () => void deleteCategory(category),
    );
  }

  async function deleteCategory(category: Category) {
    if (!activeTrip) return;
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", category.id)
        .eq("trip_id", activeTrip.id);
      if (error) throw error;
      if (activeCategoryId === category.id) {
        setActiveCategoryId(null);
        setScreen("detail");
        setDetailTab("fund");
      }
      await loadGroupDetail(activeTrip.id);
    } catch (error: unknown) {
      showAppAlert(
        "카테고리 삭제 실패",
        error instanceof Error ? error.message : "다시 시도해주세요.",
      );
    }
  }

  function openExpenseModal(preferredCategoryId?: string) {
    if (!activeTrip) return;

    // 웹앱/PWA에서는 React Native Alert가 표시되지 않는 경우가 있어
    // showAppAlert를 사용합니다. 버튼을 비활성화하지 않고 안내문을 보여줍니다.
    if (!categories.length) {
      showAppAlert(
        "카테고리 먼저 추가",
        "공용 회비 지출을 기록하려면 먼저 회비 카테고리를 추가하세요.",
      );
      return;
    }

    const targetCategoryId =
      preferredCategoryId &&
      categories.some((category) => category.id === preferredCategoryId)
        ? preferredCategoryId
        : categories[0].id;

    setEditingExpenseId(null);
    setExpenseCategoryId(targetCategoryId);
    setExpenseMemo("");
    setExpenseAmount("");
    setExpenseCurrency(activeTrip.base_currency);
    setExpenseDate(todayLocal());
    setExpensePaymentMethod("card");
    setShowExpenseCalendar(false);
    setExpenseCalendarMonth(monthKey(todayLocal()));
    setModal("expense");
  }

  function openEditExpense(expense: Expense) {
    if (!activeTrip) return;

    setEditingExpenseId(expense.id);
    setExpenseCategoryId(expense.category_id);
    setExpenseMemo(expense.memo ?? "");
    setExpenseAmount(String(expenseSourceAmount(expense)));
    setExpenseCurrency(expenseSourceCurrency(expense, activeTrip));
    setExpenseDate(expense.spent_on);
    setExpensePaymentMethod(expense.payment_method ?? "card");
    setShowExpenseCalendar(false);
    setExpenseCalendarMonth(monthKey(expense.spent_on));
    setModal("expense");
  }

  async function saveExpense() {
    if (!activeTrip) return;

    const amount = Number(expenseAmount.replace(/,/g, ""));
    if (!expenseCategoryId || !amount || amount <= 0) {
      Alert.alert("입력 확인", "카테고리와 0원보다 큰 지출 금액을 입력하세요.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expenseDate)) {
      Alert.alert("입력 확인", "사용일은 YYYY-MM-DD 형식으로 입력하세요.");
      return;
    }

    const converted = convertToBase(amount, expenseCurrency, activeTrip);
    if (!converted) {
      Alert.alert("환산 불가", "선택한 통화의 환율을 확인하세요.");
      return;
    }

    const selectedCategory = categories.find(
      (category) => category.id === expenseCategoryId,
    );
    if (!selectedCategory) {
      Alert.alert("카테고리 확인", "선택한 회비 카테고리를 찾을 수 없습니다.");
      return;
    }

    // 예산·카드·현금 잔액은 각 기기에서 계산하지 않습니다.
    // 참여자마다 조회 가능한 멤버 수가 달라 화면 값이 다를 수 있으므로,
    // 서버 RPC가 현재 DB 기준으로 한 번만 검증합니다.

    const payload = {
      category_id: expenseCategoryId,
      amount: converted.baseAmount,
      source_amount: amount,
      source_currency: expenseCurrency,
      base_amount_snapshot: converted.baseAmount,
      exchange_rate_snapshot: converted.rate,
      payment_source: "common_fund",
      payment_method: expensePaymentMethod,
      memo: expenseMemo.trim(),
      spent_on: expenseDate,
    };

    setSaving(true);
    try {
      // 공용 지출은 멤버 확인을 하는 RPC로 저장합니다.
      // 기존 RLS 정책 충돌이 있어도 그룹 참여자는 저장할 수 있습니다.
      const { data, error } = await supabase.rpc("save_shared_expense_v2", {
        p_expense_id: editingExpenseId,
        p_trip_id: activeTrip.id,
        p_category_id: payload.category_id,
        p_amount: payload.amount,
        p_source_amount: payload.source_amount,
        p_source_currency: payload.source_currency,
        p_base_amount_snapshot: payload.base_amount_snapshot,
        p_exchange_rate_snapshot: payload.exchange_rate_snapshot,
        p_payment_method: payload.payment_method,
        p_memo: payload.memo,
        p_spent_on: payload.spent_on,
      });
      if (error) throw error;
      if (!data) throw new Error("저장된 공용 지출을 받지 못했습니다.");

      const saved = data as Expense;
      if (editingExpenseId) {
        setExpenses((current) =>
          current.map((item) => (item.id === saved.id ? saved : item)),
        );
      } else {
        setExpenses((current) => [saved, ...current]);
      }

      closeModal();
      setEditingExpenseId(null);
      // 서버의 다른 변경 사항도 동기화하되, 이미 저장한 지출을 실패로 보이지 않게 합니다.
      void loadGroupDetail(activeTrip.id).catch(() => undefined);
    } catch (error: unknown) {
      // iPhone 웹앱에서도 실제 서버 오류를 반드시 보이게 합니다.
      showAppAlert(
        editingExpenseId ? "지출 수정 실패" : "지출 저장 실패",
        error instanceof Error ? error.message : "다시 시도해주세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmDeleteExpense(expense: Expense) {
    confirmDestructiveAction(
      "지출 삭제",
      "이 공용 회비 지출을 삭제할까요?",
      () => void deleteExpense(expense),
    );
  }

  async function deleteExpense(expense: Expense) {
    if (!activeTrip) return;
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expense.id)
        .eq("trip_id", activeTrip.id);
      if (error) throw error;
      await loadGroupDetail(activeTrip.id);
    } catch (error: unknown) {
      showAppAlert(
        "지출 삭제 실패",
        error instanceof Error ? error.message : "다시 시도해주세요.",
      );
    }
  }

  function openAdditionalModal() {
    if (!activeTrip) return;
    setEditingAdditionalId(null);
    setAdditionalName("");
    setAdditionalAmount("");
    setAdditionalCurrency(activeTrip.base_currency);
    setAdditionalScope("per_person");
    setAdditionalDate(todayLocal());
    setShowAdditionalCalendar(false);
    setAdditionalCalendarMonth(monthKey(todayLocal()));
    setModal("additional");
  }

  function openEditAdditional(charge: AdditionalCharge) {
    if (!activeTrip) return;
    setEditingAdditionalId(charge.id);
    setAdditionalName(charge.name);
    setAdditionalAmount(String(numberOf(charge.source_amount)));
    setAdditionalCurrency(charge.source_currency);
    setAdditionalScope(charge.charge_scope);
    const date = charge.charge_date ?? charge.created_at.slice(0, 10);
    setAdditionalDate(date);
    setShowAdditionalCalendar(false);
    setAdditionalCalendarMonth(monthKey(date));
    setModal("additional");
  }

  async function saveAdditionalCharge() {
    if (!activeTrip) return;
    const name = additionalName.trim();
    const amount = Number(additionalAmount.replace(/,/g, ""));
    if (!name || !amount || amount <= 0) {
      Alert.alert("입력 확인", "비용 이름과 0원보다 큰 금액을 입력하세요.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(additionalDate)) {
      Alert.alert("입력 확인", "사용일을 달력에서 선택하세요.");
      return;
    }
    const converted = convertToBase(amount, additionalCurrency, activeTrip);
    if (!converted) {
      Alert.alert("환산 불가", "선택한 통화의 환율을 확인하세요.");
      return;
    }
    const payload = {
      name,
      charge_scope: additionalScope,
      source_amount: amount,
      source_currency: additionalCurrency,
      base_amount_snapshot: converted.baseAmount,
      exchange_rate_snapshot: converted.rate,
      charge_date: additionalDate,
    };
    setSaving(true);
    try {
      if (editingAdditionalId) {
        const { error } = await supabase
          .from("additional_charges")
          .update(payload)
          .eq("id", editingAdditionalId)
          .eq("trip_id", activeTrip.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("additional_charges").insert({
          trip_id: activeTrip.id,
          ...payload,
          created_by: userId,
        });
        if (error) throw error;
      }
      closeModal();
      setEditingAdditionalId(null);
      await loadGroupDetail(activeTrip.id);
    } catch (error: unknown) {
      Alert.alert(
        editingAdditionalId ? "별도 비용 수정 실패" : "별도 비용 저장 실패",
        error instanceof Error ? error.message : "다시 시도해주세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmDeleteAdditional(charge: AdditionalCharge) {
    confirmDestructiveAction(
      "별도 비용 삭제",
      `“${charge.name}” 별도 비용을 삭제할까요?`,
      () => void deleteAdditional(charge),
    );
  }

  async function deleteAdditional(charge: AdditionalCharge) {
    if (!activeTrip) return;
    try {
      const { error } = await supabase
        .from("additional_charges")
        .delete()
        .eq("id", charge.id)
        .eq("trip_id", activeTrip.id);
      if (error) throw error;
      await loadGroupDetail(activeTrip.id);
    } catch (error: unknown) {
      showAppAlert(
        "별도 비용 삭제 실패",
        error instanceof Error ? error.message : "다시 시도해주세요.",
      );
    }
  }

  function openNewPersonalCategory() {
    if (!activeTrip) return;
    setEditingPersonalCategoryId(null);
    setPersonalCategoryName("");
    setPersonalCategoryBudgetAmount("");
    setPersonalCategoryBudgetCurrency(activeTrip.base_currency);
    setModal("personalCategory");
  }

  function openEditPersonalCategory(category: PersonalBudgetCategory) {
    setEditingPersonalCategoryId(category.id);
    setPersonalCategoryName(category.name);
    setPersonalCategoryBudgetAmount(String(numberOf(category.source_amount)));
    setPersonalCategoryBudgetCurrency(category.source_currency);
    setModal("personalCategory");
  }

  async function savePersonalCategory() {
    if (!activeTrip) return;
    const name = personalCategoryName.trim();
    const amount = Number(personalCategoryBudgetAmount.replace(/,/g, ""));
    if (!name || !Number.isFinite(amount) || amount <= 0) {
      showAppAlert(
        "입력 확인",
        "카테고리 이름과 0원보다 큰 예산을 입력하세요.",
      );
      return;
    }
    const converted = convertToBase(
      amount,
      personalCategoryBudgetCurrency,
      activeTrip,
    );
    if (!converted) {
      showAppAlert("환산 불가", "선택한 통화의 환율을 확인하세요.");
      return;
    }

    // 개인 예산을 직접 설정한 경우에만 카테고리 예산 합계를 그 범위 안으로 제한합니다.
    // 개인 예산이 아직 없더라도 카테고리부터 만들 수 있습니다.
    const allocatedByOtherCategories = personalBudgetCategories
      .filter((category) => category.id !== editingPersonalCategoryId)
      .reduce(
        (sum, category) => sum + numberOf(category.base_amount_snapshot),
        0,
      );

    if (hasPersonalBudgetSetting) {
      const remainingBeforeThisCategory =
        personalBudgetBase - allocatedByOtherCategories;
      if (converted.baseAmount > remainingBeforeThisCategory + 0.01) {
        showAppAlert(
          "개인 예산 배정 초과",
          `개인 소비 카테고리에 더 배정할 수 있는 금액은 ${formatMoney(Math.max(remainingBeforeThisCategory, 0), activeTrip.base_currency)}입니다. 개인 예산을 늘리거나 다른 카테고리 예산을 줄여주세요.`,
        );
        return;
      }
    }

    const payload = {
      name,
      source_amount: amount,
      source_currency: personalCategoryBudgetCurrency,
      base_amount_snapshot: converted.baseAmount,
      exchange_rate_snapshot: converted.rate,
      updated_at: new Date().toISOString(),
    };

    setSaving(true);
    try {
      let saved: PersonalBudgetCategory | null = null;

      if (editingPersonalCategoryId) {
        const { data, error } = await supabase
          .from("personal_budget_categories")
          .update(payload)
          .eq("id", editingPersonalCategoryId)
          .eq("trip_id", activeTrip.id)
          .eq("user_id", userId)
          .select("*")
          .single();
        if (error) throw error;
        saved = data as PersonalBudgetCategory;
        setPersonalBudgetCategories((current) =>
          current.map((item) => (item.id === saved!.id ? saved! : item)),
        );
      } else {
        const { data, error } = await supabase
          .from("personal_budget_categories")
          .insert({
            trip_id: activeTrip.id,
            user_id: userId,
            ...payload,
            sort_order: personalBudgetCategories.length,
          })
          .select("*")
          .single();
        if (error) throw error;
        saved = data as PersonalBudgetCategory;
        setPersonalBudgetCategories((current) => [...current, saved!]);
      }

      closeModal();
      setEditingPersonalCategoryId(null);

      // 저장 자체는 성공했는데 다른 조회가 실패해도, 방금 저장한 카테고리는 화면에 바로 남깁니다.
      void loadGroupDetail(activeTrip.id).catch(() => undefined);
    } catch (error: unknown) {
      // Safari PWA·Expo Go에서도 실제 Supabase 오류를 반드시 확인할 수 있게 표시합니다.
      showAppAlert(
        editingPersonalCategoryId
          ? "개인 소비 카테고리 수정 실패"
          : "개인 소비 카테고리 저장 실패",
        error instanceof Error ? error.message : "다시 시도해주세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmDeletePersonalCategory(category: PersonalBudgetCategory) {
    confirmDestructiveAction(
      "개인 소비 카테고리 삭제",
      `“${category.name}” 예산 카테고리를 삭제할까요? 연결된 개인 소비는 미분류로 남습니다.`,
      () => void deletePersonalCategory(category),
    );
  }

  async function deletePersonalCategory(category: PersonalBudgetCategory) {
    if (!activeTrip) return;
    try {
      const { error } = await supabase
        .from("personal_budget_categories")
        .delete()
        .eq("id", category.id)
        .eq("trip_id", activeTrip.id)
        .eq("user_id", userId);
      if (error) throw error;
      await loadGroupDetail(activeTrip.id);
    } catch (error: unknown) {
      showAppAlert(
        "개인 소비 카테고리 삭제 실패",
        error instanceof Error ? error.message : "다시 시도해주세요.",
      );
    }
  }

  function openPersonalBudgetModal() {
    if (!activeTrip) return;
    setPersonalBudgetAmount(
      personalBudget ? String(numberOf(personalBudget.source_amount)) : "",
    );
    setPersonalBudgetCurrency(
      personalBudget?.source_currency ?? activeTrip.base_currency,
    );
    setModal("personalBudget");
  }

  async function savePersonalBudget() {
    if (!activeTrip) return;
    const amount = Number(personalBudgetAmount.replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) {
      showAppAlert("입력 확인", "0원보다 큰 개인 예산을 입력하세요.");
      return;
    }
    const converted = convertToBase(amount, personalBudgetCurrency, activeTrip);
    if (!converted) {
      showAppAlert("환산 불가", "선택한 통화의 환율을 확인하세요.");
      return;
    }
    const minimumRequiredBase = personalCategoryBudgetTotalBase;
    if (converted.baseAmount + 0.01 < minimumRequiredBase) {
      showAppAlert(
        "개인 예산 부족",
        `이미 개인 소비 카테고리에 ${formatMoney(minimumRequiredBase, activeTrip.base_currency)}이 배정되어 있습니다. 개인 예산을 늘리거나 카테고리 예산을 줄여주세요.`,
      );
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("personal_budgets")
        .upsert(
          {
            trip_id: activeTrip.id,
            user_id: userId,
            source_amount: amount,
            source_currency: personalBudgetCurrency,
            base_amount_snapshot: converted.baseAmount,
            exchange_rate_snapshot: converted.rate,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "trip_id,user_id" },
        )
        .select("*")
        .single();
      if (error) throw error;

      setPersonalBudget(data as PersonalBudget);
      closeModal();
      // 저장은 즉시 화면에 반영하고, 나머지 데이터는 백그라운드에서 다시 동기화합니다.
      void loadGroupDetail(activeTrip.id).catch(() => undefined);
    } catch (error: unknown) {
      showAppAlert(
        "개인 예산 저장 실패",
        error instanceof Error ? error.message : "다시 시도해주세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  function openPersonalExpenseModal() {
    if (!activeTrip) return;
    if (personalBudgetCategories.length === 0) {
      showAppAlert(
        "카테고리 먼저 설정",
        "개인 소비를 기록하려면 먼저 개인 소비 예산 카테고리를 추가하세요.",
      );
      return;
    }
    setEditingPersonalExpenseId(null);
    setPersonalExpenseCategoryId(personalBudgetCategories[0]?.id ?? "");
    setPersonalExpenseName("");
    setPersonalExpenseMemo("");
    setPersonalExpenseAmount("");
    setPersonalExpenseCurrency(activeTrip.base_currency);
    setPersonalExpenseDate(todayLocal());
    setShowPersonalExpenseCalendar(false);
    setPersonalExpenseCalendarMonth(monthKey(todayLocal()));
    setModal("personalExpense");
  }

  function openEditPersonalExpense(expense: PersonalExpense) {
    if (!activeTrip) return;
    setEditingPersonalExpenseId(expense.id);
    setPersonalExpenseCategoryId(
      expense.category_id ?? personalBudgetCategories[0]?.id ?? "",
    );
    setPersonalExpenseName(expense.name);
    setPersonalExpenseMemo(expense.memo ?? "");
    setPersonalExpenseAmount(String(numberOf(expense.source_amount)));
    setPersonalExpenseCurrency(expense.source_currency);
    setPersonalExpenseDate(expense.spent_on);
    setShowPersonalExpenseCalendar(false);
    setPersonalExpenseCalendarMonth(monthKey(expense.spent_on));
    setModal("personalExpense");
  }

  async function savePersonalExpense() {
    if (!activeTrip) return;
    const name = personalExpenseName.trim();
    const amount = Number(personalExpenseAmount.replace(/,/g, ""));
    if (
      !personalExpenseCategoryId ||
      !name ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      Alert.alert(
        "입력 확인",
        "개인 소비 카테고리, 이름과 0원보다 큰 금액을 입력하세요.",
      );
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(personalExpenseDate)) {
      Alert.alert("입력 확인", "사용일을 달력에서 선택하세요.");
      return;
    }
    const converted = convertToBase(
      amount,
      personalExpenseCurrency,
      activeTrip,
    );
    if (!converted) {
      Alert.alert("환산 불가", "선택한 통화의 환율을 확인하세요.");
      return;
    }

    const selectedPersonalCategory = personalBudgetCategories.find(
      (category) => category.id === personalExpenseCategoryId,
    );
    if (!selectedPersonalCategory) {
      Alert.alert(
        "카테고리 확인",
        "선택한 개인 소비 카테고리를 찾을 수 없습니다.",
      );
      return;
    }
    const spentBeforeThisEntry = personalExpenses
      .filter(
        (expense) =>
          expense.category_id === personalExpenseCategoryId &&
          expense.id !== editingPersonalExpenseId,
      )
      .reduce(
        (sum, expense) => sum + numberOf(expense.base_amount_snapshot),
        0,
      );
    const categoryRemainingBeforeThisEntry =
      numberOf(selectedPersonalCategory.base_amount_snapshot) -
      spentBeforeThisEntry;
    if (converted.baseAmount > categoryRemainingBeforeThisEntry + 0.01) {
      Alert.alert(
        "개인 소비 예산 초과",
        `“${selectedPersonalCategory.name}” 카테고리에 남은 금액은 ${formatMoney(Math.max(categoryRemainingBeforeThisEntry, 0), activeTrip.base_currency)}입니다. 예산을 수정하거나 소비 금액을 줄여주세요.`,
      );
      return;
    }

    const payload = {
      category_id: personalExpenseCategoryId,
      name,
      memo: personalExpenseMemo.trim(),
      source_amount: amount,
      source_currency: personalExpenseCurrency,
      base_amount_snapshot: converted.baseAmount,
      exchange_rate_snapshot: converted.rate,
      spent_on: personalExpenseDate,
      updated_at: new Date().toISOString(),
    };
    setSaving(true);
    try {
      if (editingPersonalExpenseId) {
        const { error } = await supabase
          .from("personal_expenses")
          .update(payload)
          .eq("id", editingPersonalExpenseId)
          .eq("trip_id", activeTrip.id)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("personal_expenses").insert({
          trip_id: activeTrip.id,
          user_id: userId,
          ...payload,
        });
        if (error) throw error;
      }
      closeModal();
      setEditingPersonalExpenseId(null);
      await loadGroupDetail(activeTrip.id);
    } catch (error: unknown) {
      Alert.alert(
        editingPersonalExpenseId
          ? "개인 소비 수정 실패"
          : "개인 소비 저장 실패",
        error instanceof Error ? error.message : "다시 시도해주세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmDeletePersonalExpense(expense: PersonalExpense) {
    confirmDestructiveAction(
      "개인 소비 삭제",
      `“${expense.name}” 내역을 삭제할까요?`,
      () => void deletePersonalExpense(expense),
    );
  }

  async function deletePersonalExpense(expense: PersonalExpense) {
    if (!activeTrip) return;
    try {
      const { error } = await supabase
        .from("personal_expenses")
        .delete()
        .eq("id", expense.id)
        .eq("trip_id", activeTrip.id)
        .eq("user_id", userId);
      if (error) throw error;
      await loadGroupDetail(activeTrip.id);
    } catch (error: unknown) {
      showAppAlert(
        "개인 소비 삭제 실패",
        error instanceof Error ? error.message : "다시 시도해주세요.",
      );
    }
  }

  function openScheduleSettings() {
    if (!activeTrip) return;
    const start = activeTrip.travel_start_date ?? todayLocal();
    const end = activeTrip.travel_end_date ?? start;
    setScheduleStartDate(start);
    setScheduleEndDate(end);
    setScheduleTarget("start");
    setScheduleCalendarMonth(monthKey(start));
    setModal("schedule");
  }

  async function saveScheduleSettings() {
    if (!activeTrip) return;
    if (!scheduleStartDate || !scheduleEndDate) {
      Alert.alert("일정 입력", "출발일과 귀국일을 모두 선택하세요.");
      return;
    }
    if (scheduleStartDate > scheduleEndDate) {
      Alert.alert("일정 확인", "귀국일은 출발일보다 빠를 수 없습니다.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("trips")
        .update({
          travel_start_date: scheduleStartDate,
          travel_end_date: scheduleEndDate,
        })
        .eq("id", activeTrip.id);
      if (error) throw error;
      closeModal();
      await loadGroupDetail(activeTrip.id);
      await loadGroups();
    } catch (error: unknown) {
      Alert.alert(
        "여행 일정 저장 실패",
        error instanceof Error
          ? error.message
          : "참여자 권한 또는 Supabase SQL 설정을 확인하세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  function openSettings() {
    if (!activeTrip) return;
    setSettingsName(activeTrip.name);
    setSettingsSecondaryCurrency(activeTrip.secondary_currency);
    setModal("settings");
  }

  async function saveSettings() {
    if (!activeTrip) return;
    const name = settingsName.trim();
    if (!name) {
      Alert.alert("입력 확인", "여행 그룹 이름을 입력하세요.");
      return;
    }
    setSaving(true);
    try {
      let rate: number | null = null;
      if (settingsSecondaryCurrency)
        rate = await fetchRate(
          activeTrip.base_currency,
          settingsSecondaryCurrency,
        );
      const { error } = await supabase
        .from("trips")
        .update({
          name,
          secondary_currency: settingsSecondaryCurrency,
          exchange_rate: rate,
          rate_updated_at: rate ? new Date().toISOString() : null,
        })
        .eq("id", activeTrip.id);
      if (error) throw error;
      closeModal();
      await loadGroupDetail(activeTrip.id);
      await loadGroups();
    } catch (error: unknown) {
      Alert.alert(
        "그룹 설정 저장 실패",
        error instanceof Error
          ? error.message
          : "참여자 권한 또는 Supabase SQL 설정을 확인하세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function refreshRate() {
    if (!activeTrip?.secondary_currency) return;
    setSaving(true);
    try {
      const rate = await fetchRate(
        activeTrip.base_currency,
        activeTrip.secondary_currency,
      );
      const { error } = await supabase
        .from("trips")
        .update({
          exchange_rate: rate,
          rate_updated_at: new Date().toISOString(),
        })
        .eq("id", activeTrip.id);
      if (error) throw error;
      await loadGroupDetail(activeTrip.id);
    } catch (error: unknown) {
      Alert.alert(
        "환율 갱신 실패",
        error instanceof Error
          ? error.message
          : "그룹 만든 사람만 갱신할 수 있습니다.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function createInvite() {
    if (!activeTrip) return;
    setSaving(true);
    try {
      let code = "";
      let lastError: unknown = null;
      for (let index = 0; index < 5; index += 1) {
        code = makeGroupCode();
        const { error } = await supabase.from("trip_invites").insert({
          code,
          trip_id: activeTrip.id,
          created_by: userId,
        });
        if (!error) {
          lastError = null;
          break;
        }
        code = "";
        lastError = error;
      }
      if (!code) throw lastError ?? new Error("코드를 만들지 못했습니다.");
      setInviteCode(code);
      setModal("invite");
    } catch (error: unknown) {
      Alert.alert(
        "초대 코드 생성 실패",
        error instanceof Error
          ? error.message
          : "참여자 권한 또는 Supabase SQL 설정을 확인하세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function shareInvite() {
    if (!activeTrip || !inviteCode) return;
    try {
      await Share.share({
        message: `[${activeTrip.name}] 여행 경비 그룹 코드: ${inviteCode}\n앱에서 “그룹 코드로 참여”를 누른 후 코드를 입력하세요.`,
      });
    } catch {
      // 공유 취소는 별도 안내가 필요하지 않습니다.
    }
  }

  function confirmDeleteTrip() {
    if (!activeTrip) return;
    const message = `“${activeTrip.name}” 그룹의 회비·별도 비용·지출 내역을 모두 삭제할까요? 되돌릴 수 없습니다.`;

    // 웹에서는 React Native Alert가 기기별로 동작하지 않을 수 있어 브라우저 확인창을 사용합니다.
    if (Platform.OS === "web" && typeof window !== "undefined") {
      if (window.confirm(`그룹 삭제\n\n${message}`)) void deleteTrip();
      return;
    }

    Alert.alert("그룹 삭제", message, [
      { text: "취소", style: "cancel" },
      {
        text: "그룹 삭제",
        style: "destructive",
        onPress: () => void deleteTrip(),
      },
    ]);
  }

  async function deleteTrip() {
    if (!activeTrip) return;
    setSaving(true);
    try {
      // 서버에서도 생성자만 삭제할 수 있도록 다시 검증합니다.
      const { error } = await supabase.rpc("delete_trip_group_v4", {
        p_trip_id: activeTrip.id,
      });
      if (error) throw error;
      setActiveTrip(null);
      setScreen("groups");
      await loadGroups();
    } catch (error: unknown) {
      showAppAlert(
        "그룹 삭제 실패",
        error instanceof Error
          ? error.message
          : "그룹을 만든 사람만 삭제할 수 있습니다. SQL 설정을 확인하세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmLeaveTrip() {
    if (!activeTrip) return;
    const message = `“${activeTrip.name}” 그룹에서 나갈까요? 공용 회비·카테고리·지출 기록은 그룹에 그대로 유지됩니다.`;

    if (Platform.OS === "web" && typeof window !== "undefined") {
      if (window.confirm(`그룹 나가기\n\n${message}`)) void leaveTrip();
      return;
    }

    Alert.alert("그룹 나가기", message, [
      { text: "취소", style: "cancel" },
      { text: "나가기", style: "destructive", onPress: () => void leaveTrip() },
    ]);
  }

  async function leaveTrip() {
    if (!activeTrip) return;
    setSaving(true);
    try {
      // 생성자는 서버에서 차단되며, 일반 참여자 본인의 trip_members 행만 삭제합니다.
      const { error } = await supabase.rpc("leave_trip_group_v4", {
        p_trip_id: activeTrip.id,
      });
      if (error) throw error;
      setActiveTrip(null);
      setScreen("groups");
      await loadGroups();
    } catch (error: unknown) {
      showAppAlert(
        "그룹 나가기 실패",
        error instanceof Error
          ? error.message
          : "그룹 참여 상태 또는 Supabase SQL 설정을 확인하세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingScreen label="여행 그룹을 불러오는 중..." />;

  const isOwner = activeTrip?.created_by === userId;
  const fundRemainingBase = fundTotalBase - totalSpentBase;
  const cardRemainingBase = cardFundTotalBase - cardSpentBase;
  const cashRemainingBase = cashFundTotalBase - cashSpentBase;
  const totalPercent =
    fundTotalBase > 0
      ? Math.min((totalSpentBase / fundTotalBase) * 100, 100)
      : 0;
  const cardPercent =
    cardFundTotalBase > 0
      ? Math.min((cardSpentBase / cardFundTotalBase) * 100, 100)
      : 0;
  const cashPercent =
    cashFundTotalBase > 0
      ? Math.min((cashSpentBase / cashFundTotalBase) * 100, 100)
      : 0;
  const converterTo =
    activeTrip?.secondary_currency &&
    converterFrom === activeTrip.secondary_currency
      ? activeTrip.base_currency
      : activeTrip?.secondary_currency;
  const converterResult =
    activeTrip && converterTo
      ? converterFrom === activeTrip.base_currency
        ? numberOf(converterAmount) * numberOf(activeTrip.exchange_rate)
        : numberOf(converterAmount) / numberOf(activeTrip.exchange_rate)
      : null;
  const activeCategory = activeCategoryId
    ? (categories.find((category) => category.id === activeCategoryId) ?? null)
    : null;
  const activeCategoryExpenses = activeCategory
    ? expenses.filter((expense) => expense.category_id === activeCategory.id)
    : [];
  const activeCategorySpentBase = activeCategoryExpenses.reduce(
    (sum, expense) => sum + expenseBaseAmount(expense),
    0,
  );
  const activeCategoryBudgetBase = activeCategory
    ? categoryBaseAmount(activeCategory)
    : 0;
  const activeCategoryRemainingBase =
    activeCategoryBudgetBase - activeCategorySpentBase;
  const activeCategoryPercent =
    activeCategoryBudgetBase > 0
      ? Math.min(
          (activeCategorySpentBase / activeCategoryBudgetBase) * 100,
          100,
        )
      : 0;

  return (
    <CurrencyDisplayContext.Provider value={showSecondaryCurrency}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar barStyle="dark-content" />

        {screen === "groups" ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.page}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void refreshData()}
                tintColor={colors.amber}
              />
            }
          >
            <View style={styles.groupsHero}>
              <View style={styles.groupsHeroTop}>
                <Text style={styles.groupsHeroEyebrow}>노는게 제일 좋아</Text>
                <View style={styles.groupsHeroBadge}>
                  <Text style={styles.groupsHeroBadgeText}>
                    {trips.length} GROUPS
                  </Text>
                </View>
              </View>
              <Text style={styles.groupsHeroTitle}>여행을 떠나자</Text>
              <Text style={styles.groupsHeroDescription}>
                우리 모두 거지가 되지 않게 노력해봐요
              </Text>
              <View style={styles.groupsHeroRule} />
            </View>

            {trips.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  아직 참여한 여행이 없어요.
                </Text>
                <Text style={styles.emptyBody}>
                  새 그룹을 만들거나 친구에게 코드를 받아 참여하세요.
                </Text>
              </View>
            ) : (
              <View style={styles.groupListSection}>
                <View style={styles.groupListHeader}>
                  <Text style={styles.groupListTitle}>내 여행</Text>
                  <Text style={styles.groupListCount}>{trips.length}개</Text>
                </View>
                <View style={styles.stack}>
                  {trips.map((trip) => {
                    const count = memberCounts[trip.id] ?? 1;
                    const totalFund =
                      numberOf(trip.fund_per_person_base_amount) * count;
                    return (
                      <Pressable
                        key={trip.id}
                        style={styles.groupCard}
                        onPress={() => void openTrip(trip)}
                      >
                        <View style={styles.groupCardAccent} />
                        <View style={styles.groupCardTop}>
                          <View style={styles.groupTextArea}>
                            <Text style={styles.groupName}>{trip.name}</Text>
                            <Text
                              style={styles.groupMembers}
                            >{`현재 참여 ${count}명${numberOf(trip.member_limit) > 0 ? ` / 최대 ${numberOf(trip.member_limit)}명` : " · 제한 없음"}`}</Text>
                          </View>
                          <Text style={styles.arrow}>›</Text>
                        </View>
                        <View style={styles.groupFundBlock}>
                          <Text style={styles.currencyText}>총 공용 회비</Text>
                          <MoneyDisplay
                            baseAmount={totalFund}
                            trip={trip}
                            variant="small"
                          />
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={styles.actionStack}>
              <PrimaryButton
                label="＋ 새 여행 그룹 만들기"
                onPress={() => setModal("createGroup")}
              />
              <SecondaryButton
                label="그룹 코드로 참여"
                onPress={() => setModal("joinGroup")}
              />
            </View>
          </ScrollView>
        ) : null}

        {screen === "detail" && activeTrip ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.page}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void refreshData()}
                tintColor={colors.amber}
              />
            }
          >
            <View style={styles.detailTopRow}>
              <Pressable
                style={styles.backButton}
                onPress={() => {
                  setScreen("groups");
                  setActiveTrip(null);
                  setActiveCategoryId(null);
                  setDetailTab("fund");
                }}
              >
                <Text style={styles.backButtonText}>‹ 목록</Text>
              </Pressable>
              <View style={styles.headerActions}>
                <Pressable
                  style={styles.headerButton}
                  onPress={() => setModal("converter")}
                >
                  <Text style={styles.headerButtonText}>환율</Text>
                </Pressable>
                {activeTrip.secondary_currency ? (
                  <Pressable
                    style={styles.headerButton}
                    onPress={() =>
                      void setSecondaryCurrencyVisibility(
                        !showSecondaryCurrency,
                      )
                    }
                    accessibilityRole="switch"
                    accessibilityState={{ checked: showSecondaryCurrency }}
                  >
                    <Text
                      style={styles.headerButtonText}
                    >{`${activeTrip.secondary_currency} ${showSecondaryCurrency ? "ON" : "OFF"}`}</Text>
                  </Pressable>
                ) : null}
                <Pressable style={styles.headerButton} onPress={openSettings}>
                  <Text style={styles.headerButtonText}>설정</Text>
                </Pressable>
                <Pressable
                  style={styles.headerButton}
                  onPress={() => void createInvite()}
                >
                  <Text style={styles.headerButtonText}>초대</Text>
                </Pressable>
                <Pressable
                  style={styles.headerDangerButton}
                  onPress={confirmResetSharedBudget}
                >
                  <Text style={styles.headerDangerButtonText}>전체 초기화</Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.eyebrow}>GROUP</Text>
            <Text style={styles.pageTitle}>{activeTrip.name}</Text>
            <Text
              style={styles.pageDescription}
            >{`현재 참여 ${memberCount}명${numberOf(activeTrip.member_limit) > 0 ? ` / 최대 ${numberOf(activeTrip.member_limit)}명` : " · 제한 없음"} · 기준 ${symbolOf(activeTrip.base_currency)} ${activeTrip.base_currency}`}</Text>

            <Pressable
              style={styles.scheduleTabButton}
              onPress={openScheduleSettings}
            >
              <View style={styles.scheduleTabInfo}>
                <Text style={styles.scheduleTabLabel}>여행 일정</Text>
                <Text style={styles.scheduleTabDate}>
                  {activeTrip.travel_start_date && activeTrip.travel_end_date
                    ? formatSchedule(
                        activeTrip.travel_start_date,
                        activeTrip.travel_end_date,
                      )
                    : "여행 일정 설정"}
                </Text>
              </View>
              <Text style={styles.scheduleTabChevron}>›</Text>
            </Pressable>

            <View style={styles.tabBar}>
              <DetailTabButton
                label="회비"
                active={detailTab === "fund"}
                onPress={() => setDetailTab("fund")}
              />
              <DetailTabButton
                label="별도 비용"
                active={detailTab === "additional"}
                onPress={() => setDetailTab("additional")}
              />
              <DetailTabButton
                label="지출 내역"
                active={detailTab === "ledger"}
                onPress={() => setDetailTab("ledger")}
              />
              <DetailTabButton
                label="개인 소비"
                active={detailTab === "personal"}
                onPress={() => setDetailTab("personal")}
              />
            </View>

            {detailTab === "fund" ? (
              <View style={styles.totalBudgetCard}>
                <View style={styles.summaryHeader}>
                  <View style={styles.totalBudgetTitleArea}>
                    <Text style={styles.summaryLabel}>여행 전체 예산</Text>
                    <Text style={styles.totalBudgetHint}>
                      총 공용 회비와 별도 비용을 합산한 그룹 전체 예산입니다.
                    </Text>
                  </View>
                  <MoneyDisplay
                    baseAmount={totalTravelBudgetBase}
                    trip={activeTrip}
                    variant="headline"
                    color={colors.amber}
                    align="right"
                  />
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.travelBudgetMetricGrid}>
                  <View style={styles.travelBudgetMetric}>
                    <SummaryNumber
                      label="총 공용 회비"
                      moneyBaseAmount={fundTotalBase}
                      trip={activeTrip}
                    />
                  </View>
                  <View style={styles.travelBudgetMetric}>
                    <SummaryNumber
                      label="별도 비용"
                      moneyBaseAmount={additionalGroupTotalBase}
                      trip={activeTrip}
                    />
                  </View>
                  <View style={styles.travelBudgetMetric}>
                    <SummaryNumber
                      label="총 지출"
                      moneyBaseAmount={totalTripSpentBase}
                      trip={activeTrip}
                      valueColor={colors.amber}
                    />
                  </View>
                  <View style={styles.travelBudgetMetric}>
                    <SummaryNumber
                      label="잔액"
                      moneyBaseAmount={totalTravelRemainingBase}
                      trip={activeTrip}
                      valueColor={
                        totalTravelRemainingBase < 0 ? colors.red : colors.green
                      }
                    />
                  </View>
                </View>
                <View style={styles.perPersonBudgetRows}>
                  <PerPersonBudgetRow
                    label="1인 별도 비용"
                    baseAmount={additionalPerPersonBase}
                    trip={activeTrip}
                  />
                  <View style={styles.perPersonSpendDivider} />
                  <PerPersonBudgetRow
                    label="1인 총 지출"
                    baseAmount={totalTripSpentPerPersonBase}
                    trip={activeTrip}
                    color={colors.amber}
                  />
                </View>
              </View>
            ) : null}

            {detailTab === "fund" ? (
              <>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <Text style={styles.summaryLabel}>공용 회비</Text>
                    <View style={styles.fundHeaderActions}>
                      <View
                        style={[
                          styles.statusBadge,
                          fundRemainingBase < 0
                            ? styles.statusOver
                            : styles.statusNormal,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            fundRemainingBase < 0
                              ? styles.statusTextOver
                              : styles.statusTextNormal,
                          ]}
                        >
                          {fundRemainingBase < 0
                            ? "회비 초과"
                            : fundTotalBase === 0
                              ? "회비 미설정"
                              : "정상"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.summaryNumbers}>
                    <SummaryNumber
                      label="1인 회비"
                      moneyBaseAmount={fundPerPersonBase}
                      trip={activeTrip}
                    />
                    <SummaryNumber
                      label="참여 인원"
                      value={`${memberCount}명`}
                    />
                    <SummaryNumber
                      label="총 공용 회비"
                      moneyBaseAmount={fundTotalBase}
                      trip={activeTrip}
                      valueColor={colors.amber}
                    />
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryNumbers}>
                    <SummaryNumber
                      label="총 지출"
                      moneyBaseAmount={totalSpentBase}
                      trip={activeTrip}
                    />
                    <SummaryNumber
                      label="회비 잔액"
                      moneyBaseAmount={fundRemainingBase}
                      trip={activeTrip}
                      valueColor={
                        fundRemainingBase < 0 ? colors.red : colors.green
                      }
                    />
                  </View>
                  <ProgressLine
                    label="전체 회비 사용률"
                    percent={totalPercent}
                    usedBase={totalSpentBase}
                    remainingBase={fundRemainingBase}
                    trip={activeTrip}
                  />
                  <View style={styles.paymentBalanceRow}>
                    <PaymentBalanceCard
                      label="카드 회비"
                      totalBase={cardFundTotalBase}
                      spentBase={cardSpentBase}
                      remainingBase={cardRemainingBase}
                      percent={cardPercent}
                      trip={activeTrip}
                      onPress={() => openFundSettings("card")}
                      allocationPending={
                        cardFundTotalBase === 0 &&
                        cashFundTotalBase === 0 &&
                        fundTotalBase > 0
                      }
                      actionHint="탭하여 전체 카드·현금 배분을 수정하세요."
                    />
                    <PaymentBalanceCard
                      label="현금 회비"
                      totalBase={cashFundTotalBase}
                      spentBase={cashSpentBase}
                      remainingBase={cashRemainingBase}
                      percent={cashPercent}
                      trip={activeTrip}
                      onPress={() => openFundSettings("cash")}
                      allocationPending={
                        cardFundTotalBase === 0 &&
                        cashFundTotalBase === 0 &&
                        fundTotalBase > 0
                      }
                      actionHint="탭하여 전체 카드·현금 배분을 수정하세요."
                    />
                  </View>
                  {showSecondaryCurrency ? (
                    <View style={styles.rateRow}>
                      <Text style={styles.rateText}>
                        {activeTrip.secondary_currency &&
                        activeTrip.exchange_rate
                          ? `1 ${activeTrip.base_currency} ≈ ${formatRate(activeTrip.exchange_rate)} ${activeTrip.secondary_currency}`
                          : "환산 통화를 설정하면 KRW·JPY 혼합 입력이 가능합니다."}
                      </Text>
                    </View>
                  ) : null}
                  <Text style={styles.fundRoundGuide}>
                    기본 회비부터 이후 추가한 회비까지 모두 표시합니다. 회비
                    추가·수정·삭제·초기화는 모든 참여자가 할 수 있습니다.
                  </Text>
                  <View style={styles.summaryDivider} />
                  <View style={styles.sectionTitleRow}>
                    <View>
                      <Text style={styles.sectionTitle}>회비 내역</Text>
                      <Text style={styles.subSectionText}>
                        그룹을 만들 때 설정한 기본 회비와 이후 추가 회비입니다.
                      </Text>
                    </View>
                    <Text style={styles.countText}>{fundHistoryCount}회</Text>
                  </View>
                  {fundHistoryCount === 0 ? (
                    <View style={styles.fundHistoryEmpty}>
                      <Text style={styles.noneText}>
                        설정된 회비가 없습니다. 회비를 추가하면 이곳에
                        표시됩니다.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.fundHistoryCard}>
                      {hasInitialFundHistory ? (
                        <View style={styles.fundHistoryItem}>
                          <View style={styles.fundHistoryTopRow}>
                            <View style={styles.fundHistoryTitleArea}>
                              <Text style={styles.fundHistoryTitle}>
                                1회차 기본 회비
                              </Text>
                              <Text style={styles.fundHistoryDate}>
                                {formatHistoryDate(activeTrip.created_at)}
                              </Text>
                            </View>
                            <Text
                              style={[
                                styles.fundHistoryAmount,
                                { color: colors.amber },
                              ]}
                            >
                              {formatMoney(
                                initialFundBase,
                                activeTrip.base_currency,
                              )}
                            </Text>
                          </View>
                          <Text style={styles.fundHistoryMeta}>
                            그룹 생성 시 설정한 1인 회비
                          </Text>
                          <View style={styles.fundRoundActionRow}>
                            <Pressable
                              style={styles.fundRoundEditButton}
                              onPress={openInitialFundEdit}
                            >
                              <Text style={styles.fundRoundEditButtonText}>
                                수정
                              </Text>
                            </Pressable>
                            <Pressable
                              style={styles.fundRoundDeleteButton}
                              onPress={confirmDeleteInitialFund}
                            >
                              <Text style={styles.fundRoundDeleteButtonText}>
                                삭제
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      ) : null}
                      {visibleFundRounds.map((round, index) => {
                        const roundCurrency =
                          round.currency ?? activeTrip.base_currency;
                        const roundNumber =
                          index + (hasInitialFundHistory ? 2 : 1);
                        return (
                          <View
                            key={round.id}
                            style={[
                              styles.fundHistoryItem,
                              index > 0 || hasInitialFundHistory
                                ? styles.fundHistoryItemBorder
                                : null,
                            ]}
                          >
                            <View style={styles.fundHistoryTopRow}>
                              <View style={styles.fundHistoryTitleArea}>
                                <Text
                                  style={styles.fundHistoryTitle}
                                >{`${roundNumber}회차 추가`}</Text>
                                <Text style={styles.fundHistoryDate}>
                                  {formatHistoryDate(round.created_at)}
                                </Text>
                              </View>
                              <Text
                                style={[
                                  styles.fundHistoryAmount,
                                  { color: colors.amber },
                                ]}
                              >
                                {formatMoney(
                                  numberOf(round.amount),
                                  roundCurrency,
                                )}
                              </Text>
                            </View>
                            <View style={styles.fundRoundActionRow}>
                              <Pressable
                                style={styles.fundRoundEditButton}
                                onPress={() => openFundRoundEdit(round)}
                              >
                                <Text style={styles.fundRoundEditButtonText}>
                                  수정
                                </Text>
                              </Pressable>
                              <Pressable
                                style={styles.fundRoundDeleteButton}
                                onPress={() =>
                                  confirmDeleteFundRound(round, roundNumber)
                                }
                              >
                                <Text style={styles.fundRoundDeleteButtonText}>
                                  삭제
                                </Text>
                              </Pressable>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>

                <SecondaryButton label="＋ 회비 추가" onPress={openFundAdd} />
                <PrimaryButton
                  label="＋ 공용 회비 지출 추가"
                  onPress={openExpenseModal}
                />

                <View style={styles.sectionTitleRow}>
                  <View>
                    <Text style={styles.sectionTitle}>회비 카테고리</Text>
                    <Text style={styles.subSectionText}>
                      총 공용 회비 안에서 그룹 전체 예산을 나눕니다.
                    </Text>
                  </View>
                  <Text style={styles.countText}>{categories.length}개</Text>
                </View>

                <View style={styles.categoryUsageCard}>
                  <View style={styles.categoryUsageHeader}>
                    <Text style={styles.categoryUsageTitle}>
                      카테고리 배정 현황
                    </Text>
                    <Text
                      style={[
                        styles.categoryUsagePercent,
                        categoryAllocationRemainingBase < 0
                          ? styles.redText
                          : null,
                      ]}
                    >
                      {Math.round(categoryAllocationPercent)}% 배정
                    </Text>
                  </View>
                  <View style={styles.categoryUsageNumbers}>
                    <View>
                      <Text style={styles.categoryTotalLabel}>
                        카테고리 배정 합계
                      </Text>
                      <MoneyDisplay
                        baseAmount={categoryBudgetTotalBase}
                        trip={activeTrip}
                        variant="small"
                      />
                    </View>
                    <View style={styles.categoryTotalRight}>
                      <Text
                        style={[
                          styles.categoryTotalLabel,
                          categoryAllocationRemainingBase < 0
                            ? styles.redText
                            : styles.greenText,
                        ]}
                      >
                        추가 배정 가능 회비
                      </Text>
                      <MoneyDisplay
                        baseAmount={categoryAllocationRemainingBase}
                        trip={activeTrip}
                        variant="small"
                        color={
                          categoryAllocationRemainingBase < 0
                            ? colors.red
                            : colors.green
                        }
                        align="right"
                      />
                    </View>
                  </View>
                  <View style={styles.progressTrackSmallWide}>
                    <View
                      style={[
                        styles.progressValue,
                        { width: `${categoryAllocationPercent}%` },
                        categoryAllocationRemainingBase < 0
                          ? styles.progressOver
                          : styles.progressNormal,
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryUsageCaption}>
                    총 공용 회비{" "}
                    {formatMoney(fundTotalBase, activeTrip.base_currency)}{" "}
                    안에서 아직 다른 카테고리에 배정할 수 있는 금액입니다.
                  </Text>
                </View>

                {categories.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>
                      회비를 카테고리로 나눠보세요.
                    </Text>
                    <Text style={styles.emptyBody}>
                      예: 총 회비 60만 원이라면 식비 20만 원, 관광 20만 원, 기타
                      20만 원처럼 배정하세요.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.stack}>
                    {categories.map((category) => {
                      const categoryExpenses = expenses.filter(
                        (expense) => expense.category_id === category.id,
                      );
                      const categorySpent = categoryExpenses.reduce(
                        (sum, item) => sum + expenseBaseAmount(item),
                        0,
                      );
                      const groupBudget = categoryBaseAmount(category);
                      const remaining = groupBudget - categorySpent;
                      const percent =
                        groupBudget > 0
                          ? Math.min((categorySpent / groupBudget) * 100, 100)
                          : 0;
                      return (
                        <Pressable
                          key={category.id}
                          style={styles.categoryCard}
                          onPress={() => openCategoryDetail(category)}
                        >
                          <View style={styles.categoryHeader}>
                            <View style={styles.categoryTitleArea}>
                              <Text style={styles.categoryName}>
                                {category.name}
                              </Text>
                              <Text style={styles.categoryBudget}>
                                그룹 예산
                              </Text>
                              <MoneyDisplay
                                baseAmount={groupBudget}
                                trip={activeTrip}
                                variant="small"
                              />
                            </View>
                            <Text style={styles.categoryToggle}>›</Text>
                          </View>
                          <View style={styles.progressTrackSmall}>
                            <View
                              style={[
                                styles.progressValue,
                                { width: `${percent}%` },
                                remaining < 0
                                  ? styles.progressOver
                                  : styles.progressNormal,
                              ]}
                            />
                          </View>
                          <View style={styles.categoryTotals}>
                            <View>
                              <Text
                                style={[
                                  styles.categoryTotalLabel,
                                  remaining < 0 ? styles.redText : null,
                                ]}
                              >
                                {Math.round(percent)}% 사용
                              </Text>
                              <MoneyDisplay
                                baseAmount={categorySpent}
                                trip={activeTrip}
                                variant="small"
                              />
                            </View>
                            <View style={styles.categoryTotalRight}>
                              <Text
                                style={[
                                  styles.categoryTotalLabel,
                                  remaining < 0
                                    ? styles.redText
                                    : styles.greenText,
                                ]}
                              >
                                잔액
                              </Text>
                              <MoneyDisplay
                                baseAmount={remaining}
                                trip={activeTrip}
                                variant="small"
                                color={
                                  remaining < 0 ? colors.red : colors.green
                                }
                                align="right"
                              />
                            </View>
                          </View>
                          <Text style={styles.categoryOpenHint}>
                            탭하여 상세 보기
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
                <SecondaryButton
                  label="＋ 회비 카테고리 추가"
                  onPress={openNewCategory}
                />
                {isOwner ? (
                  <Pressable
                    style={styles.deleteGroupLink}
                    onPress={confirmDeleteTrip}
                  >
                    <Text style={styles.deleteGroupText}>이 그룹 삭제</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={styles.deleteGroupLink}
                    onPress={confirmLeaveTrip}
                  >
                    <Text style={styles.deleteGroupText}>이 그룹 나가기</Text>
                  </Pressable>
                )}
              </>
            ) : null}

            {detailTab === "additional" ? (
              <>
                <View style={styles.sectionTitleRow}>
                  <View>
                    <Text style={styles.sectionTitle}>별도 비용</Text>
                    <Text style={styles.subSectionText}>
                      1인 금액은 그대로, 그룹 전체 금액은 참여 인원으로 나누어
                      1인 여행비에 반영합니다.
                    </Text>
                  </View>
                  <Text style={styles.countText}>
                    {additionalCharges.length}건
                  </Text>
                </View>
                <View style={styles.additionalTotalCard}>
                  <View style={styles.additionalTotalTitleArea}>
                    <Text style={styles.additionalTotalLabel}>
                      별도 비용 그룹 총액
                    </Text>
                    <Text style={styles.additionalTotalHint}>
                      항공권·숙소 등 공용 회비에 포함하지 않는 비용
                    </Text>
                  </View>
                  <MoneyDisplay
                    baseAmount={additionalGroupTotalBase}
                    trip={activeTrip}
                    variant="headline"
                    color={colors.amber}
                    align="right"
                  />
                </View>
                <View style={styles.additionalPerPersonCard}>
                  <Text style={styles.additionalSummaryText}>
                    1인 별도 비용
                  </Text>
                  <MoneyDisplay
                    baseAmount={additionalPerPersonBase}
                    trip={activeTrip}
                    variant="body"
                    align="right"
                  />
                </View>
                {additionalCharges.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>별도 비용이 없습니다.</Text>
                    <Text style={styles.emptyBody}>
                      항공권, 숙소, 여행자보험 등 회비에 포함하지 않을 비용을
                      추가하세요.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.stack}>
                    {additionalCharges.map((charge) => {
                      const base = numberOf(charge.base_amount_snapshot);
                      const perPerson =
                        charge.charge_scope === "per_person"
                          ? base
                          : base / Math.max(memberCount, 1);
                      const groupTotal =
                        charge.charge_scope === "per_person"
                          ? base * memberCount
                          : base;
                      return (
                        <View key={charge.id} style={styles.additionalCard}>
                          <View style={styles.additionalCardHeader}>
                            <View style={styles.additionalTop}>
                              <Text style={styles.additionalName}>
                                {charge.name}
                              </Text>
                              <Text style={styles.additionalScope}>
                                {charge.charge_scope === "per_person"
                                  ? "1인 금액"
                                  : `${memberCount}명 분할`}
                              </Text>
                            </View>
                            <View style={styles.cardActionRow}>
                              <Pressable
                                style={styles.cardEditButton}
                                onPress={() => openEditAdditional(charge)}
                              >
                                <Text style={styles.cardEditButtonText}>
                                  수정
                                </Text>
                              </Pressable>
                              <Pressable
                                style={styles.cardDeleteButton}
                                onPress={() => confirmDeleteAdditional(charge)}
                              >
                                <Text style={styles.cardDeleteButtonText}>
                                  삭제
                                </Text>
                              </Pressable>
                            </View>
                          </View>
                          <Text style={styles.additionalDateText}>
                            {charge.charge_date ??
                              charge.created_at.slice(0, 10)}
                          </Text>
                          <MoneyDisplay
                            baseAmount={base}
                            trip={activeTrip}
                            variant="body"
                          />
                          <View style={styles.additionalBottom}>
                            <View>
                              <Text style={styles.categoryTotalLabel}>1인</Text>
                              <MoneyDisplay
                                baseAmount={perPerson}
                                trip={activeTrip}
                                variant="small"
                              />
                            </View>
                            <View style={styles.categoryTotalRight}>
                              <Text style={styles.categoryTotalLabel}>
                                전체
                              </Text>
                              <MoneyDisplay
                                baseAmount={groupTotal}
                                trip={activeTrip}
                                variant="small"
                                align="right"
                              />
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
                <PrimaryButton
                  label="＋ 별도 비용 추가"
                  onPress={openAdditionalModal}
                />
              </>
            ) : null}

            {detailTab === "personal" ? (
              <>
                <View style={styles.sectionTitleRow}>
                  <View>
                    <Text style={styles.sectionTitle}>개인 소비</Text>
                    <Text style={styles.subSectionText}>
                      개인 소비는 나만 보며, 카테고리는 개인 예산을 설정하지
                      않아도 바로 추가할 수 있습니다.
                    </Text>
                  </View>
                  <Text style={styles.countText}>
                    {personalExpenses.length}건
                  </Text>
                </View>

                <View style={styles.totalBudgetCard}>
                  <View style={styles.summaryHeader}>
                    <View style={styles.totalBudgetTitleArea}>
                      <Text style={styles.summaryLabel}>나의 전체 여행비</Text>
                      <Text style={styles.totalBudgetHint}>
                        개인 예산과 1인 공용 비용을 합산해 전체 여행 예산을
                        계산합니다.
                      </Text>
                    </View>
                    <Pressable
                      style={styles.headerButton}
                      onPress={openPersonalBudgetModal}
                    >
                      <Text style={styles.headerButtonText}>
                        {hasPersonalBudgetSetting
                          ? "개인 예산 수정"
                          : "개인 예산 설정"}
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.travelBudgetMetricGrid}>
                    <View style={styles.travelBudgetMetric}>
                      <SummaryNumber
                        label="개인 예산"
                        moneyBaseAmount={personalBudgetBase}
                        trip={activeTrip}
                        valueColor={colors.amber}
                        secondary={
                          hasPersonalBudgetSetting
                            ? "직접 설정"
                            : "카테고리 예산 합계"
                        }
                      />
                    </View>
                    <View style={styles.travelBudgetMetric}>
                      <SummaryNumber
                        label="공용 회비"
                        moneyBaseAmount={personalSharedCostBase}
                        trip={activeTrip}
                        secondary="1인 별도 비용 포함"
                      />
                    </View>
                    <View style={styles.travelBudgetMetric}>
                      <SummaryNumber
                        label="전체 예산"
                        moneyBaseAmount={personalTotalBudgetBase}
                        trip={activeTrip}
                        valueColor={colors.amber}
                      />
                    </View>
                    <View style={styles.travelBudgetMetric}>
                      <SummaryNumber
                        label="개인 예산 잔액"
                        moneyBaseAmount={
                          personalBudgetBase > 0
                            ? personalBudgetRemainingBase
                            : 0
                        }
                        trip={activeTrip}
                        valueColor={
                          personalBudgetBase > 0 &&
                          personalBudgetRemainingBase < 0
                            ? colors.red
                            : colors.green
                        }
                      />
                    </View>
                  </View>
                  {personalBudgetBase > 0 ? (
                    <ProgressLine
                      label="개인 예산 사용 현황"
                      percent={personalBudgetPercent}
                      usedBase={personalExpenseTotalBase}
                      remainingBase={personalBudgetRemainingBase}
                      trip={activeTrip}
                    />
                  ) : (
                    <Text style={styles.helperText}>
                      개인 소비 카테고리를 추가하거나 개인 예산을 설정하면 개인
                      예산 사용 현황과 잔액을 확인할 수 있습니다.
                    </Text>
                  )}
                  <View style={styles.perPersonBudgetRows}>
                    <PerPersonBudgetRow
                      label="공용 회비 실제 사용액 (1인 분담)"
                      baseAmount={commonFundSpentPerPersonBase}
                      trip={activeTrip}
                    />
                    <PerPersonBudgetRow
                      label="그룹 별도 비용 실제 사용액 (1인 분담)"
                      baseAmount={additionalActualSpentPerPersonBase}
                      trip={activeTrip}
                    />
                    <PerPersonBudgetRow
                      label="개인 소비 실제 사용액"
                      baseAmount={personalExpenseTotalBase}
                      trip={activeTrip}
                    />
                    <View style={styles.perPersonSpendDivider} />
                    <PerPersonBudgetRow
                      label="전체 실제 사용액"
                      baseAmount={personalActualSpentBase}
                      trip={activeTrip}
                      color={colors.amber}
                    />
                    <Text style={styles.helperText}>
                      공용 회비에는 1인 공용 회비와 1인 기준 그룹 별도 비용이
                      포함됩니다.
                    </Text>
                  </View>
                </View>

                <View style={styles.sectionTitleRow}>
                  <View>
                    <Text style={styles.sectionTitle}>개인 소비 예산</Text>
                    <Text style={styles.subSectionText}>
                      개인 예산을 먼저 설정하지 않아도 카테고리별 예산을 바로
                      추가할 수 있습니다.
                    </Text>
                  </View>
                  <Text style={styles.countText}>
                    {personalBudgetCategories.length}개
                  </Text>
                </View>
                {uncategorizedPersonalExpenseBase > 0 ? (
                  <Text style={styles.helperText}>
                    미분류 개인 소비{" "}
                    {formatMoney(
                      uncategorizedPersonalExpenseBase,
                      activeTrip.base_currency,
                    )}
                    이 포함되어 있습니다. 기존 내역은 카테고리를 선택해
                    정리하세요.
                  </Text>
                ) : null}
                {personalCategoryStats.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>
                      개인 소비 예산을 카테고리로 나눠보세요.
                    </Text>
                    <Text style={styles.emptyBody}>
                      개인 예산을 별도로 설정하지 않아도 쇼핑·개인 식비·교통비
                      카테고리를 바로 추가할 수 있습니다.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.stack}>
                    {personalCategoryStats.map(
                      ({
                        category,
                        budgetBase,
                        usedBase,
                        remainingBase,
                        percent,
                      }) => (
                        <View
                          key={category.id}
                          style={styles.personalCategoryCard}
                        >
                          <View style={styles.personalCategoryHeader}>
                            <View style={styles.personalCategoryTitleArea}>
                              <Text style={styles.categoryName}>
                                {category.name}
                              </Text>
                              <Text style={styles.categoryBudget}>
                                개인 소비 예산
                              </Text>
                            </View>
                            <View style={styles.cardActionRow}>
                              <Pressable
                                style={styles.cardEditButton}
                                onPress={() =>
                                  openEditPersonalCategory(category)
                                }
                              >
                                <Text style={styles.cardEditButtonText}>
                                  수정
                                </Text>
                              </Pressable>
                              <Pressable
                                style={styles.cardDeleteButton}
                                onPress={() =>
                                  confirmDeletePersonalCategory(category)
                                }
                              >
                                <Text style={styles.cardDeleteButtonText}>
                                  삭제
                                </Text>
                              </Pressable>
                            </View>
                          </View>
                          <View style={styles.personalCategoryBudgetRow}>
                            <Text style={styles.personalCategoryBudgetLabel}>
                              카테고리 예산
                            </Text>
                            <MoneyDisplay
                              baseAmount={budgetBase}
                              trip={activeTrip}
                              variant="body"
                              align="right"
                            />
                          </View>
                          <View style={styles.progressTrackSmall}>
                            <View
                              style={[
                                styles.progressValue,
                                { width: `${percent}%` },
                                remainingBase < 0
                                  ? styles.progressOver
                                  : styles.progressNormal,
                              ]}
                            />
                          </View>
                          <View style={styles.personalCategoryTotals}>
                            <View style={styles.personalCategoryMetric}>
                              <Text
                                style={[
                                  styles.categoryTotalLabel,
                                  remainingBase < 0 ? styles.redText : null,
                                ]}
                              >
                                {Math.round(percent)}% 사용
                              </Text>
                              <MoneyDisplay
                                baseAmount={usedBase}
                                trip={activeTrip}
                                variant="small"
                              />
                            </View>
                            <View
                              style={[
                                styles.personalCategoryMetric,
                                styles.categoryTotalRight,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.categoryTotalLabel,
                                  remainingBase < 0
                                    ? styles.redText
                                    : styles.greenText,
                                ]}
                              >
                                남은 예산
                              </Text>
                              <MoneyDisplay
                                baseAmount={remainingBase}
                                trip={activeTrip}
                                variant="small"
                                color={
                                  remainingBase < 0 ? colors.red : colors.green
                                }
                                align="right"
                              />
                            </View>
                          </View>
                        </View>
                      ),
                    )}
                  </View>
                )}
                <SecondaryButton
                  label="＋ 개인 소비 예산 카테고리 추가"
                  onPress={openNewPersonalCategory}
                />

                <View style={styles.sectionTitleRow}>
                  <View>
                    <Text style={styles.sectionTitle}>내 개인 소비 내역</Text>
                    <Text style={styles.subSectionText}>
                      탭하여 수정하고, 오른쪽 삭제 버튼으로 삭제할 수 있습니다.
                    </Text>
                  </View>
                  <Text style={styles.countText}>
                    {personalExpenses.length}건
                  </Text>
                </View>
                {personalExpenses.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>
                      아직 개인 소비가 없습니다.
                    </Text>
                    <Text style={styles.emptyBody}>
                      쇼핑, 개인 식비, 개인 교통비처럼 회비와 별도로 낸 비용을
                      기록하세요.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.stack}>
                    {personalExpenses.map((expense) => (
                      <PersonalExpenseRow
                        key={expense.id}
                        expense={expense}
                        trip={activeTrip}
                        categoryName={
                          personalBudgetCategories.find(
                            (category) => category.id === expense.category_id,
                          )?.name ?? "미분류"
                        }
                        onPress={() => openEditPersonalExpense(expense)}
                        onDelete={() => confirmDeletePersonalExpense(expense)}
                      />
                    ))}
                  </View>
                )}
                <PrimaryButton
                  label="＋ 개인 소비 추가"
                  onPress={openPersonalExpenseModal}
                />
              </>
            ) : null}

            {detailTab === "ledger" ? (
              <>
                <View style={styles.sectionTitleRow}>
                  <View>
                    <Text style={styles.sectionTitle}>지출 내역</Text>
                    <Text style={styles.subSectionText}>
                      달력에서 날짜를 누르면 하루 총 사용 금액과 내역을 확인할
                      수 있습니다.
                    </Text>
                  </View>
                  <Text style={styles.countText}>{ledgerEntries.length}건</Text>
                </View>

                <View style={styles.travelPhaseCard}>
                  <View style={styles.travelPhaseHeader}>
                    <Text style={styles.travelPhaseTitle}>
                      여행 전 · 여행 중 비용
                    </Text>
                    <Text style={styles.travelPhaseDate}>
                      {activeTrip.travel_start_date
                        ? formatSchedule(
                            activeTrip.travel_start_date,
                            activeTrip.travel_end_date,
                          )
                        : "일정 미설정"}
                    </Text>
                  </View>
                  {activeTrip.travel_start_date &&
                  activeTrip.travel_end_date ? (
                    <View style={styles.travelPhaseNumbers}>
                      <SummaryNumber
                        label="여행 전"
                        moneyBaseAmount={preTripTotalBase}
                        trip={activeTrip}
                      />
                      <SummaryNumber
                        label="여행 중"
                        moneyBaseAmount={duringTripTotalBase}
                        trip={activeTrip}
                      />
                    </View>
                  ) : (
                    <Text style={styles.travelPhaseHint}>
                      탭 위의 여행 일정 영역을 누르면 출발일과 귀국일을 설정할
                      수 있습니다.
                    </Text>
                  )}
                </View>

                <View style={styles.usageStatsCard}>
                  <Text style={styles.usageStatsTitle}>사용률 통계</Text>
                  <ProgressLine
                    label="전체 공용 회비"
                    percent={totalPercent}
                    usedBase={totalSpentBase}
                    remainingBase={fundRemainingBase}
                    trip={activeTrip}
                    compact
                  />
                  <View style={styles.usageStatsDivider} />
                  {categories.length === 0 ? (
                    <Text style={styles.noneText}>
                      카테고리를 설정하면 항목별 사용률을 볼 수 있습니다.
                    </Text>
                  ) : (
                    categories.map((category) => {
                      const budget = categoryBaseAmount(category);
                      const spent = expenses
                        .filter(
                          (expense) => expense.category_id === category.id,
                        )
                        .reduce(
                          (sum, expense) => sum + expenseBaseAmount(expense),
                          0,
                        );
                      const percent =
                        budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
                      return (
                        <ProgressLine
                          key={category.id}
                          label={category.name}
                          percent={percent}
                          usedBase={spent}
                          remainingBase={budget - spent}
                          trip={activeTrip}
                          compact
                        />
                      );
                    })
                  )}
                </View>

                <View style={styles.categorySpendChartCard}>
                  <View style={styles.categorySpendChartHeader}>
                    <View>
                      <Text style={styles.usageStatsTitle}>총 지출 구성</Text>
                      <Text style={styles.categorySpendChartHint}>
                        그룹 전체 기준으로 공용 회비 카테고리와 항공권·숙소 등의
                        별도 비용을 함께 비교합니다.
                      </Text>
                    </View>
                    <View style={styles.categorySpendTotalArea}>
                      <Text style={styles.categorySpendTotalLabel}>
                        그룹 총 지출
                      </Text>
                      <MoneyDisplay
                        baseAmount={totalTripSpentBase}
                        trip={activeTrip}
                        variant="body"
                        color={colors.amber}
                        align="right"
                      />
                    </View>
                  </View>
                  {tripSpendBreakdown.length === 0 ? (
                    <Text style={styles.noneText}>
                      공용 회비 지출 또는 별도 비용을 추가하면 전체 지출 구성을
                      원형 그래프로 볼 수 있습니다.
                    </Text>
                  ) : (
                    <CategorySpendDonutChart
                      items={tripSpendBreakdown}
                      totalBase={totalTripSpentBase}
                      trip={activeTrip}
                    />
                  )}
                </View>

                <View style={styles.ledgerCard}>
                  <View style={styles.ledgerBody}>
                    <Text style={styles.inputLabel}>표시할 내역</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.chipRow}
                    >
                      <ChoiceChip
                        label="전체"
                        selected={ledgerType === "all"}
                        onPress={() => setLedgerType("all")}
                      />
                      <ChoiceChip
                        label="회비 지출"
                        selected={ledgerType === "fund"}
                        onPress={() => setLedgerType("fund")}
                      />
                      <ChoiceChip
                        label="별도 비용"
                        selected={ledgerType === "additional"}
                        onPress={() => setLedgerType("additional")}
                      />
                    </ScrollView>
                    <Text style={styles.inputLabel}>카테고리</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.chipRow}
                    >
                      <ChoiceChip
                        label="전체"
                        selected={filterCategory === "all"}
                        onPress={() => setFilterCategory("all")}
                      />
                      {categories.map((category) => (
                        <ChoiceChip
                          key={category.id}
                          label={category.name}
                          selected={filterCategory === category.id}
                          onPress={() => setFilterCategory(category.id)}
                        />
                      ))}
                    </ScrollView>

                    <MonthSpendCalendar
                      month={ledgerMonth}
                      onMonthChange={setLedgerMonth}
                      selectedDate={ledgerSelectedDate}
                      onSelectDate={(date) =>
                        setLedgerSelectedDate((current) =>
                          current === date ? null : date,
                        )
                      }
                      dailyTotals={dailyTotals}
                      trip={activeTrip}
                    />

                    <View style={styles.ledgerSummary}>
                      <View>
                        <Text style={styles.countText}>
                          {ledgerSelectedDate
                            ? `${ledgerSelectedDate.replaceAll("-", ".")} 선택`
                            : "전체 기간"}
                        </Text>
                        <Text style={styles.ledgerSelectedHint}>
                          {ledgerSelectedDate
                            ? "날짜를 다시 누르면 전체 보기"
                            : "달력에서 날짜를 선택하세요"}
                        </Text>
                      </View>
                      <View style={styles.ledgerTotalArea}>
                        <Text style={styles.countText}>
                          {filteredLedgerEntries.length}건 · 합계
                        </Text>
                        <MoneyDisplay
                          baseAmount={filteredLedgerEntries.reduce(
                            (sum, item) => sum + item.baseAmount,
                            0,
                          )}
                          trip={activeTrip}
                          variant="small"
                          align="right"
                        />
                      </View>
                    </View>
                    {filteredLedgerEntries.length === 0 ? (
                      <Text style={styles.noneText}>
                        선택한 조건에 맞는 내역이 없습니다.
                      </Text>
                    ) : (
                      filteredLedgerEntries.map((entry) => (
                        <LedgerRow
                          key={entry.id}
                          entry={entry}
                          trip={activeTrip}
                          onPress={() =>
                            entry.expense
                              ? openEditExpense(entry.expense)
                              : entry.additional
                                ? openEditAdditional(entry.additional)
                                : undefined
                          }
                          onDelete={() =>
                            entry.expense
                              ? confirmDeleteExpense(entry.expense)
                              : entry.additional
                                ? confirmDeleteAdditional(entry.additional)
                                : undefined
                          }
                        />
                      ))
                    )}
                  </View>
                </View>
              </>
            ) : null}
          </ScrollView>
        ) : null}

        {screen === "categoryDetail" && activeTrip ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.page}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void refreshData()}
                tintColor={colors.amber}
              />
            }
          >
            <View style={styles.detailTopRow}>
              <Pressable
                style={styles.backButton}
                onPress={closeCategoryDetail}
              >
                <Text style={styles.backButtonText}>‹ 회비</Text>
              </Pressable>
              {activeCategory ? (
                <View style={styles.headerActions}>
                  <Pressable
                    style={styles.headerButton}
                    onPress={() => openEditCategory(activeCategory)}
                  >
                    <Text style={styles.headerButtonText}>예산 수정</Text>
                  </Pressable>
                  <Pressable
                    style={styles.categoryDeleteHeaderButton}
                    onPress={() => confirmDeleteCategory(activeCategory)}
                  >
                    <Text style={styles.categoryDeleteHeaderText}>삭제</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>

            {activeCategory ? (
              <>
                <Text style={styles.eyebrow}>FUND CATEGORY</Text>
                <Text style={styles.pageTitle}>{activeCategory.name}</Text>
                <Text style={styles.pageDescription}>
                  이 카테고리의 공용 회비 지출과 잔액을 확인하세요.
                </Text>

                <View style={styles.categoryDetailSummaryCard}>
                  <View style={styles.summaryHeader}>
                    <Text style={styles.summaryLabel}>카테고리 현황</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        activeCategoryRemainingBase < 0
                          ? styles.statusOver
                          : styles.statusNormal,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          activeCategoryRemainingBase < 0
                            ? styles.statusTextOver
                            : styles.statusTextNormal,
                        ]}
                      >
                        {activeCategoryRemainingBase < 0
                          ? "예산 초과"
                          : activeCategoryBudgetBase === 0
                            ? "예산 없음"
                            : "정상"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.summaryNumbers}>
                    <SummaryNumber
                      label="그룹 예산"
                      moneyBaseAmount={activeCategoryBudgetBase}
                      trip={activeTrip}
                    />
                    <SummaryNumber
                      label="지출"
                      moneyBaseAmount={activeCategorySpentBase}
                      trip={activeTrip}
                    />
                    <SummaryNumber
                      label="잔액"
                      moneyBaseAmount={activeCategoryRemainingBase}
                      trip={activeTrip}
                      valueColor={
                        activeCategoryRemainingBase < 0
                          ? colors.red
                          : colors.green
                      }
                    />
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressValue,
                        { width: `${activeCategoryPercent}%` },
                        activeCategoryRemainingBase < 0
                          ? styles.progressOver
                          : styles.progressNormal,
                      ]}
                    />
                  </View>
                  <Text style={styles.percentText}>
                    {Math.round(activeCategoryPercent)}% 사용
                  </Text>
                </View>

                <View style={styles.sectionTitleRow}>
                  <View>
                    <Text style={styles.sectionTitle}>지출 내역</Text>
                    <Text style={styles.subSectionText}>
                      지출을 탭하면 수정하고, 오른쪽 삭제 버튼으로 삭제할 수
                      있습니다.
                    </Text>
                  </View>
                  <Text style={styles.countText}>
                    {activeCategoryExpenses.length}건
                  </Text>
                </View>

                {activeCategoryExpenses.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>
                      아직 등록한 지출이 없습니다.
                    </Text>
                    <Text style={styles.emptyBody}>
                      이 카테고리에서 사용한 공용 회비를 추가하세요.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.stack}>
                    {activeCategoryExpenses.map((expense) => (
                      <ExpenseRow
                        key={expense.id}
                        expense={expense}
                        trip={activeTrip}
                        onPress={() => openEditExpense(expense)}
                        onDelete={() => confirmDeleteExpense(expense)}
                      />
                    ))}
                  </View>
                )}

                <PrimaryButton
                  label={`＋ ${activeCategory.name} 지출 추가`}
                  onPress={() => openExpenseModal(activeCategory.id)}
                />
              </>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  카테고리를 찾을 수 없습니다.
                </Text>
                <Text style={styles.emptyBody}>
                  회비 화면으로 돌아가 다시 선택하세요.
                </Text>
                <SecondaryButton
                  label="회비로 돌아가기"
                  onPress={closeCategoryDetail}
                />
              </View>
            )}
          </ScrollView>
        ) : null}

        <SheetModal
          visible={modal === "createGroup"}
          title="새 여행 그룹 만들기"
          onClose={closeModal}
        >
          <Text style={styles.inputLabel}>여행 그룹 이름</Text>
          <TextInput
            value={newTripName}
            onChangeText={setNewTripName}
            style={styles.input}
            placeholder="예: 치앙마이 여행"
            placeholderTextColor={colors.dim}
          />
          <Text style={styles.inputLabel}>최대 참여 인원</Text>
          <TextInput
            value={newMemberLimit}
            onChangeText={(value) =>
              setNewMemberLimit(value.replace(/[^0-9]/g, ""))
            }
            style={styles.input}
            placeholder="예: 2"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.helperText}>
            생성자를 포함한 최대 인원입니다. 그룹 생성 후에는 변경할 수
            없습니다.
          </Text>
          <Text style={styles.inputLabel}>기준 통화</Text>
          <CurrencyChoices
            value={newBaseCurrency}
            onChange={(value) => {
              if (!value) return;
              const nextCurrencies = Array.from(
                new Set(
                  [value, newSecondaryCurrency].filter(Boolean) as Currency[],
                ),
              );
              setNewBaseCurrency(value);
              if (value === newSecondaryCurrency) setNewSecondaryCurrency(null);
              if (!nextCurrencies.includes(newFundCurrency))
                setNewFundCurrency(value);
              if (!nextCurrencies.includes(newCardFundCurrency))
                setNewCardFundCurrency(value);
              if (!nextCurrencies.includes(newCashFundCurrency))
                setNewCashFundCurrency(value);
            }}
          />
          <Text style={styles.inputLabel}>환산 통화</Text>
          <CurrencyChoices
            value={newSecondaryCurrency}
            allowNone
            disabledCurrency={newBaseCurrency}
            onChange={(value) => {
              setNewSecondaryCurrency(value);
              const nextCurrencies = Array.from(
                new Set([newBaseCurrency, value].filter(Boolean) as Currency[]),
              );
              if (!nextCurrencies.includes(newFundCurrency))
                setNewFundCurrency(newBaseCurrency);
              if (!nextCurrencies.includes(newCardFundCurrency))
                setNewCardFundCurrency(newBaseCurrency);
              if (!nextCurrencies.includes(newCashFundCurrency))
                setNewCashFundCurrency(newBaseCurrency);
            }}
          />
          <Text style={styles.inputLabel}>1인 총 회비</Text>
          <TextInput
            value={newFundAmount}
            onChangeText={updateNewFundAmount}
            style={styles.input}
            placeholder="예: 300000 또는 30000"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
          />
          <CurrencyChoices
            value={newFundCurrency}
            currencies={Array.from(
              new Set(
                [newBaseCurrency, newSecondaryCurrency].filter(
                  Boolean,
                ) as Currency[],
              ),
            )}
            onChange={(value) => value && void updateNewFundCurrency(value)}
          />
          <Text style={styles.inputLabel}>1인 카드 회비</Text>
          <TextInput
            value={newCardFundAmount}
            onChangeText={(value) =>
              updateNewFundAllocationAmount("card", value)
            }
            style={styles.input}
            placeholder="예: 200000 또는 20000"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
          />
          <CurrencyChoices
            value={newCardFundCurrency}
            currencies={Array.from(
              new Set(
                [newBaseCurrency, newSecondaryCurrency].filter(
                  Boolean,
                ) as Currency[],
              ),
            )}
            onChange={(value) =>
              value && void updateNewFundAllocationCurrency("card", value)
            }
          />
          <Text style={styles.inputLabel}>1인 현금 회비</Text>
          <TextInput
            value={newCashFundAmount}
            onChangeText={(value) =>
              updateNewFundAllocationAmount("cash", value)
            }
            style={styles.input}
            placeholder="예: 100000 또는 10000"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
          />
          <CurrencyChoices
            value={newCashFundCurrency}
            currencies={Array.from(
              new Set(
                [newBaseCurrency, newSecondaryCurrency].filter(
                  Boolean,
                ) as Currency[],
              ),
            )}
            onChange={(value) =>
              value && void updateNewFundAllocationCurrency("cash", value)
            }
          />
          <Text style={styles.helperText}>
            총 회비를 먼저 입력한 뒤 카드 또는 현금 한쪽을 입력하세요. 다른
            수단에는 남은 금액이 선택한 통화로 자동 배분됩니다.
          </Text>
          <ModalActions
            onCancel={closeModal}
            onSave={() => void createGroup()}
            saveLabel="그룹 만들기"
            saving={saving}
          />
        </SheetModal>

        <SheetModal
          visible={modal === "joinGroup"}
          title="그룹 코드로 참여"
          onClose={closeModal}
        >
          <Text style={styles.modalDescription}>
            친구가 만든 8자리 그룹 코드를 입력하세요.
          </Text>
          <TextInput
            value={joinCode}
            onChangeText={(value) => setJoinCode(value.toUpperCase())}
            style={styles.input}
            placeholder="예: A7K9M2QX"
            placeholderTextColor={colors.dim}
            autoCapitalize="characters"
            maxLength={12}
          />
          <ModalActions
            onCancel={closeModal}
            onSave={() => void joinGroup()}
            saveLabel="참여하기"
            saving={saving}
          />
        </SheetModal>

        <SheetModal
          visible={modal === "fundAdd"}
          title={
            editingFundRoundId === INITIAL_FUND_EDIT_ID
              ? "1회차 기본 회비 수정"
              : editingFundRoundId
                ? `${Math.max(1, visibleFundRounds.findIndex((round) => round.id === editingFundRoundId) + (hasInitialFundHistory ? 2 : 1))}회차 회비 수정`
                : "회비 추가"
          }
          onClose={closeModal}
        >
          <Text style={styles.modalDescription}>
            {editingFundRoundId === INITIAL_FUND_EDIT_ID
              ? "그룹을 만들 때 설정한 1인 기본 회비를 수정합니다. 이후 추가 회비는 그대로 유지됩니다."
              : editingFundRoundId
                ? "이 회차의 추가 회비 금액을 수정합니다. 전체 회비와 카드·현금 배분은 차이만큼 자동 조정됩니다."
                : "이번에 추가할 1인 회비를 입력한 뒤 카드 또는 현금에 배정하세요. 한쪽을 입력하면 남은 금액은 다른 수단에 자동 배분됩니다."}
          </Text>
          <Text style={styles.inputLabel}>
            {editingFundRoundId ? "1인 회비 금액" : "1인 추가 회비"}
          </Text>
          <TextInput
            value={fundAddTotalAmount}
            onChangeText={updateFundAddTotalAmount}
            style={styles.input}
            placeholder="예: 50000 또는 5000"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
          />
          {activeTrip ? (
            <CurrencyChoices
              value={fundAddTotalCurrency}
              currencies={availableCurrencies(activeTrip)}
              onChange={(value) => value && updateFundAddTotalCurrency(value)}
            />
          ) : null}
          <Text style={styles.inputLabel}>
            {editingFundRoundId ? "이번 회차 카드 회비" : "이번 추가 카드 회비"}
          </Text>
          <TextInput
            value={fundAddCardAmount}
            onChangeText={(value) => updateFundAddAmount("card", value)}
            style={styles.input}
            placeholder="예: 50000 또는 5000"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
          />
          {activeTrip ? (
            <CurrencyChoices
              value={fundAddCardCurrency}
              currencies={availableCurrencies(activeTrip)}
              onChange={(value) =>
                value && updateFundAddCurrency("card", value)
              }
            />
          ) : null}
          <Text style={styles.inputLabel}>
            {editingFundRoundId ? "이번 회차 현금 회비" : "이번 추가 현금 회비"}
          </Text>
          <TextInput
            value={fundAddCashAmount}
            onChangeText={(value) => updateFundAddAmount("cash", value)}
            style={styles.input}
            placeholder="예: 50000 또는 5000"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
          />
          {activeTrip ? (
            <CurrencyChoices
              value={fundAddCashCurrency}
              currencies={availableCurrencies(activeTrip)}
              onChange={(value) =>
                value && updateFundAddCurrency("cash", value)
              }
            />
          ) : null}
          <Text style={styles.helperText}>
            한쪽 금액을 입력하면 남은 금액은 다른 수단의 선택 통화로 자동
            배분됩니다. 통화를 바꿔도 실제 배정액은 환산되어 유지됩니다.
          </Text>
          <ModalActions
            onCancel={closeModal}
            onSave={() => void saveFundAdd()}
            saveLabel={editingFundRoundId ? "회차 수정 저장" : "회비 추가"}
            saving={saving}
          />
        </SheetModal>

        <SheetModal
          visible={modal === "fundSettings"}
          title="카드·현금 배분 수정"
          onClose={closeModal}
        >
          <Text style={styles.modalDescription}>
            현재 총 회비 안에서 카드·현금 배분만 수정합니다. 총 회비 금액은 그룹
            생성 또는 회비 추가에서 정합니다. 한쪽 금액을 입력하면 나머지는
            선택한 통화로 자동 계산됩니다.
          </Text>
          {activeTrip ? (
            <View style={styles.fundSplitTotalBox}>
              <Text style={styles.fundSplitTotalLabel}>현재 1인 총 회비</Text>
              <MoneyDisplay
                baseAmount={fundPerPersonBaseAmount(activeTrip)}
                trip={activeTrip}
                variant="body"
                align="right"
                color={colors.amber}
              />
            </View>
          ) : null}
          <Text style={styles.inputLabel}>1인 카드 회비</Text>
          <TextInput
            value={fundEditCardAmount}
            onChangeText={(value) => updateFundEditAmount("card", value)}
            style={styles.input}
            placeholder="예: 200000 또는 20000"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
          />
          {activeTrip ? (
            <CurrencyChoices
              value={fundEditCardCurrency}
              currencies={availableCurrencies(activeTrip)}
              onChange={(value) =>
                value && updateFundEditCurrency("card", value)
              }
            />
          ) : null}
          <Text style={styles.inputLabel}>1인 현금 회비</Text>
          <TextInput
            value={fundEditCashAmount}
            onChangeText={(value) => updateFundEditAmount("cash", value)}
            style={styles.input}
            placeholder="예: 100000 또는 10000"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
          />
          {activeTrip ? (
            <CurrencyChoices
              value={fundEditCashCurrency}
              currencies={availableCurrencies(activeTrip)}
              onChange={(value) =>
                value && updateFundEditCurrency("cash", value)
              }
            />
          ) : null}
          {activeTrip
            ? (() => {
                const cardAmount = inputNumber(fundEditCardAmount) ?? 0;
                const cashAmount = inputNumber(fundEditCashAmount) ?? 0;
                const cardBase =
                  convertToBase(cardAmount, fundEditCardCurrency, activeTrip)
                    ?.baseAmount ?? 0;
                const cashBase =
                  convertToBase(cashAmount, fundEditCashCurrency, activeTrip)
                    ?.baseAmount ?? 0;
                return (
                  <View style={styles.fundSplitSummaryBox}>
                    <View style={styles.fundSplitSummaryRow}>
                      <Text style={styles.fundSplitTotalLabel}>
                        카드·현금 배분 합계
                      </Text>
                      <Text style={styles.fundSplitSummaryValue}>
                        {formatMoney(
                          cardBase + cashBase,
                          activeTrip.base_currency,
                        )}
                      </Text>
                    </View>
                    <View style={styles.fundSplitSummaryRow}>
                      <Text style={styles.fundSplitTotalLabel}>배분 차이</Text>
                      <Text
                        style={[
                          styles.fundSplitSummaryValue,
                          {
                            color:
                              Math.abs(
                                cardBase +
                                  cashBase -
                                  fundPerPersonBaseAmount(activeTrip),
                              ) <= FUND_SPLIT_TOLERANCE_BASE
                                ? colors.green
                                : colors.red,
                          },
                        ]}
                      >
                        {formatMoney(
                          fundPerPersonBaseAmount(activeTrip) -
                            cardBase -
                            cashBase,
                          activeTrip.base_currency,
                        )}
                      </Text>
                    </View>
                  </View>
                );
              })()
            : null}
          <Text style={styles.helperText}>
            통화를 바꾸면 같은 배정액을 선택한 통화로 환산해 표시합니다. 숫자만
            그대로 바뀌지 않습니다.
          </Text>
          <ModalActions
            onCancel={closeModal}
            onSave={() => void saveFundSettings()}
            saveLabel="배분 저장"
            saving={saving}
          />
        </SheetModal>

        <SheetModal
          visible={modal === "category"}
          title={
            editingCategoryId ? "회비 카테고리 수정" : "회비 카테고리 추가"
          }
          onClose={closeModal}
        >
          <Text style={styles.inputLabel}>카테고리 이름</Text>
          <TextInput
            value={categoryName}
            onChangeText={setCategoryName}
            style={styles.input}
            placeholder="예: 식비"
            placeholderTextColor={colors.dim}
          />
          <Text style={styles.inputLabel}>그룹 전체 예산</Text>
          <TextInput
            value={categoryAmount}
            onChangeText={setCategoryAmount}
            style={styles.input}
            placeholder="예: 200000 또는 20000"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
          />
          {activeTrip ? (
            <CurrencyChoices
              value={categoryCurrency}
              currencies={availableCurrencies(activeTrip)}
              onChange={(value) => value && setCategoryCurrency(value)}
            />
          ) : null}
          <Text style={styles.helperText}>
            총 공용 회비 안에서 배정하는 그룹 전체 예산입니다.
          </Text>
          <ModalActions
            onCancel={closeModal}
            onSave={() => void saveCategory()}
            saveLabel="저장"
            saving={saving}
          />
        </SheetModal>

        <SheetModal
          visible={modal === "expense"}
          title={
            editingExpenseId ? "공용 회비 지출 수정" : "공용 회비 지출 추가"
          }
          onClose={closeModal}
        >
          <Text style={styles.modalDescription}>
            {editingExpenseId
              ? "카테고리, 금액, 통화, 날짜를 수정할 수 있습니다."
              : "여행 중 공용 회비에서 사용한 돈만 등록하세요."}
          </Text>
          <Text style={styles.inputLabel}>카테고리</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {categories.map((category) => (
              <ChoiceChip
                key={category.id}
                label={category.name}
                selected={expenseCategoryId === category.id}
                onPress={() => setExpenseCategoryId(category.id)}
              />
            ))}
          </ScrollView>
          <Text style={styles.inputLabel}>내용</Text>
          <TextInput
            value={expenseMemo}
            onChangeText={setExpenseMemo}
            style={styles.input}
            placeholder="예: 저녁 식사"
            placeholderTextColor={colors.dim}
          />
          <Text style={styles.inputLabel}>지출 금액</Text>
          <TextInput
            value={expenseAmount}
            onChangeText={setExpenseAmount}
            style={styles.input}
            placeholder="예: 25000 또는 3000"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
          />
          {activeTrip ? (
            <CurrencyChoices
              value={expenseCurrency}
              currencies={availableCurrencies(activeTrip)}
              onChange={(value) => value && setExpenseCurrency(value)}
            />
          ) : null}
          <Text style={styles.inputLabel}>결제 수단</Text>
          <View style={styles.scopeRow}>
            <ChoiceChip
              label="카드"
              selected={expensePaymentMethod === "card"}
              onPress={() => setExpensePaymentMethod("card")}
            />
            <ChoiceChip
              label="현금"
              selected={expensePaymentMethod === "cash"}
              onPress={() => setExpensePaymentMethod("cash")}
            />
          </View>
          <Text style={styles.inputLabel}>사용일</Text>
          <Pressable
            style={styles.datePickerButton}
            onPress={() => {
              setShowExpenseCalendar((value) => !value);
              setExpenseCalendarMonth(monthKey(expenseDate));
            }}
          >
            <Text style={styles.datePickerButtonText}>
              {expenseDate.replaceAll("-", ".")}
            </Text>
            <Text style={styles.datePickerIcon}>▾</Text>
          </Pressable>
          {showExpenseCalendar ? (
            <InlineCalendar
              month={expenseCalendarMonth}
              onMonthChange={setExpenseCalendarMonth}
              selectedDate={expenseDate}
              onSelectDate={(date) => {
                setExpenseDate(date);
                setShowExpenseCalendar(false);
              }}
            />
          ) : null}
          <ModalActions
            onCancel={closeModal}
            onSave={() => void saveExpense()}
            saveLabel={editingExpenseId ? "수정 저장" : "저장"}
            saving={saving}
          />
        </SheetModal>

        <SheetModal
          visible={modal === "additional"}
          title={editingAdditionalId ? "별도 비용 수정" : "별도 비용 추가"}
          onClose={closeModal}
        >
          <Text style={styles.modalDescription}>
            항공권·숙소처럼 공용 회비와 카테고리 예산에 포함하지 않을
            금액입니다. 그룹 전체 금액은 현재 참여 인원으로 나눕니다.
          </Text>
          <Text style={styles.inputLabel}>비용 이름</Text>
          <TextInput
            value={additionalName}
            onChangeText={setAdditionalName}
            style={styles.input}
            placeholder="예: 항공권 또는 숙소"
            placeholderTextColor={colors.dim}
          />
          <Text style={styles.inputLabel}>금액 기준</Text>
          <View style={styles.scopeRow}>
            <ChoiceChip
              label="1인 금액"
              selected={additionalScope === "per_person"}
              onPress={() => setAdditionalScope("per_person")}
            />
            <ChoiceChip
              label="그룹 총액 · N분할"
              selected={additionalScope === "group_total"}
              onPress={() => setAdditionalScope("group_total")}
            />
          </View>
          <Text style={styles.inputLabel}>
            {additionalScope === "per_person"
              ? "1인 별도 비용"
              : "그룹 전체 별도 비용"}
          </Text>
          <Text style={styles.helperText}>
            {additionalScope === "per_person"
              ? `입력 금액이 각 참여자에게 동일하게 반영됩니다. 현재 ${memberCount}명 기준으로 그룹 전체 금액이 계산됩니다.`
              : `입력한 그룹 전체 금액을 현재 ${memberCount}명으로 나누어 1인 여행비에 반영합니다. 참여자가 1명이면 입력 금액 그대로 반영됩니다.`}
          </Text>
          <TextInput
            value={additionalAmount}
            onChangeText={setAdditionalAmount}
            style={styles.input}
            placeholder="예: 250000 또는 30000"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
          />
          {activeTrip ? (
            <CurrencyChoices
              value={additionalCurrency}
              currencies={availableCurrencies(activeTrip)}
              onChange={(value) => value && setAdditionalCurrency(value)}
            />
          ) : null}
          <Text style={styles.inputLabel}>비용 발생일</Text>
          <Pressable
            style={styles.datePickerButton}
            onPress={() => {
              setShowAdditionalCalendar((value) => !value);
              setAdditionalCalendarMonth(monthKey(additionalDate));
            }}
          >
            <Text style={styles.datePickerButtonText}>
              {additionalDate.replaceAll("-", ".")}
            </Text>
            <Text style={styles.datePickerIcon}>▾</Text>
          </Pressable>
          {showAdditionalCalendar ? (
            <InlineCalendar
              month={additionalCalendarMonth}
              onMonthChange={setAdditionalCalendarMonth}
              selectedDate={additionalDate}
              onSelectDate={(date) => {
                setAdditionalDate(date);
                setShowAdditionalCalendar(false);
              }}
            />
          ) : null}
          <ModalActions
            onCancel={closeModal}
            onSave={() => void saveAdditionalCharge()}
            saveLabel={editingAdditionalId ? "수정 저장" : "저장"}
            saving={saving}
          />
        </SheetModal>

        <SheetModal
          visible={modal === "personalBudget"}
          title="개인 예산"
          onClose={closeModal}
        >
          <Text style={styles.modalDescription}>
            개인 소비에 사용할 총 예산입니다. 설정하지 않아도 개인 소비
            카테고리는 바로 추가할 수 있습니다.
          </Text>
          <Text style={styles.inputLabel}>개인 예산</Text>
          <TextInput
            value={personalBudgetAmount}
            onChangeText={setPersonalBudgetAmount}
            style={styles.input}
            placeholder="예: 500000 또는 50000"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
          />
          {activeTrip ? (
            <CurrencyChoices
              value={personalBudgetCurrency}
              currencies={availableCurrencies(activeTrip)}
              onChange={(value) => value && updatePersonalBudgetCurrency(value)}
            />
          ) : null}
          <Text style={styles.helperText}>
            개인 예산을 설정하면 개인 소비 카테고리 예산 합계가 이 금액을 넘지
            않도록 관리합니다. 공용 회비와 별도 비용은 전체 예산에 자동
            합산됩니다.
          </Text>
          <ModalActions
            onCancel={closeModal}
            onSave={() => void savePersonalBudget()}
            saveLabel="예산 저장"
            saving={saving}
          />
        </SheetModal>

        <SheetModal
          visible={modal === "personalCategory"}
          title={
            editingPersonalCategoryId
              ? "개인 소비 예산 수정"
              : "개인 소비 예산 카테고리 추가"
          }
          onClose={closeModal}
        >
          <Text style={styles.modalDescription}>
            개인 소비에만 적용되는 예산입니다. 개인 예산을 설정하지 않아도
            카테고리를 바로 추가할 수 있습니다.
          </Text>
          {activeTrip && hasPersonalBudgetSetting ? (
            <Text style={styles.helperText}>
              현재 카테고리에 더 배정 가능한 금액:{" "}
              {formatMoney(
                Math.max(
                  personalSpendingAllocatableBase -
                    personalBudgetCategories
                      .filter(
                        (category) => category.id !== editingPersonalCategoryId,
                      )
                      .reduce(
                        (sum, category) =>
                          sum + numberOf(category.base_amount_snapshot),
                        0,
                      ),
                  0,
                ),
                activeTrip.base_currency,
              )}
            </Text>
          ) : (
            <Text style={styles.helperText}>
              개인 예산을 설정하지 않으면 카테고리 예산 합계가 개인 예산으로
              표시됩니다.
            </Text>
          )}
          <Text style={styles.inputLabel}>카테고리 이름</Text>
          <TextInput
            value={personalCategoryName}
            onChangeText={setPersonalCategoryName}
            style={styles.input}
            placeholder="예: 쇼핑, 개인 식비, 개인 교통비"
            placeholderTextColor={colors.dim}
          />
          <Text style={styles.inputLabel}>카테고리 예산</Text>
          <TextInput
            value={personalCategoryBudgetAmount}
            onChangeText={setPersonalCategoryBudgetAmount}
            style={styles.input}
            placeholder="예: 200000 또는 20000"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
          />
          {activeTrip ? (
            <CurrencyChoices
              value={personalCategoryBudgetCurrency}
              currencies={availableCurrencies(activeTrip)}
              onChange={(value) =>
                value && updatePersonalCategoryBudgetCurrency(value)
              }
            />
          ) : null}
          <Text style={styles.helperText}>
            통화를 바꾸면 입력한 실제 예산 금액을 그룹 환율로 환산해 표시합니다.
          </Text>
          <ModalActions
            onCancel={closeModal}
            onSave={() => void savePersonalCategory()}
            saveLabel={editingPersonalCategoryId ? "수정 저장" : "저장"}
            saving={saving}
          />
        </SheetModal>

        <SheetModal
          visible={modal === "personalExpense"}
          title={editingPersonalExpenseId ? "개인 소비 수정" : "개인 소비 추가"}
          onClose={closeModal}
        >
          <Text style={styles.modalDescription}>
            이 내역은 현재 사용자에게만 보이며 그룹 친구와 공유되지 않습니다.
          </Text>
          <Text style={styles.inputLabel}>개인 소비 카테고리</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {personalBudgetCategories.map((category) => (
              <ChoiceChip
                key={category.id}
                label={category.name}
                selected={personalExpenseCategoryId === category.id}
                onPress={() => setPersonalExpenseCategoryId(category.id)}
              />
            ))}
          </ScrollView>
          <Text style={styles.inputLabel}>소비 이름</Text>
          <TextInput
            value={personalExpenseName}
            onChangeText={setPersonalExpenseName}
            style={styles.input}
            placeholder="예: 쇼핑, 개인 식사, 교통비"
            placeholderTextColor={colors.dim}
          />
          <Text style={styles.inputLabel}>금액</Text>
          <TextInput
            value={personalExpenseAmount}
            onChangeText={setPersonalExpenseAmount}
            style={styles.input}
            placeholder="예: 25000 또는 3000"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
          />
          {activeTrip ? (
            <CurrencyChoices
              value={personalExpenseCurrency}
              currencies={availableCurrencies(activeTrip)}
              onChange={(value) =>
                value && updatePersonalExpenseCurrency(value)
              }
            />
          ) : null}
          <Text style={styles.helperText}>
            통화를 바꾸면 입력한 실제 소비 금액을 그룹 환율로 환산해 표시합니다.
          </Text>
          <Text style={styles.inputLabel}>메모 (선택)</Text>
          <TextInput
            value={personalExpenseMemo}
            onChangeText={setPersonalExpenseMemo}
            style={styles.input}
            placeholder="예: 기념품"
            placeholderTextColor={colors.dim}
          />
          <Text style={styles.inputLabel}>사용일</Text>
          <Pressable
            style={styles.datePickerButton}
            onPress={() => {
              setShowPersonalExpenseCalendar((value) => !value);
              setPersonalExpenseCalendarMonth(monthKey(personalExpenseDate));
            }}
          >
            <Text style={styles.datePickerButtonText}>
              {personalExpenseDate.replaceAll("-", ".")}
            </Text>
            <Text style={styles.datePickerIcon}>▾</Text>
          </Pressable>
          {showPersonalExpenseCalendar ? (
            <InlineCalendar
              month={personalExpenseCalendarMonth}
              onMonthChange={setPersonalExpenseCalendarMonth}
              selectedDate={personalExpenseDate}
              onSelectDate={(date) => {
                setPersonalExpenseDate(date);
                setShowPersonalExpenseCalendar(false);
              }}
            />
          ) : null}
          <ModalActions
            onCancel={closeModal}
            onSave={() => void savePersonalExpense()}
            saveLabel={editingPersonalExpenseId ? "수정 저장" : "저장"}
            saving={saving}
          />
        </SheetModal>

        <SheetModal
          visible={modal === "schedule"}
          title="여행 일정 수정"
          onClose={closeModal}
        >
          <Text style={styles.modalDescription}>
            출발일과 귀국일을 달력에서 선택하면 지출 내역에서 여행 전·여행 중
            비용과 하루 사용 금액을 정리합니다.
          </Text>
          <View style={styles.scheduleChoiceRow}>
            <ChoiceChip
              label={`출발 ${scheduleStartDate ? scheduleStartDate.replaceAll("-", ".") : "선택"}`}
              selected={scheduleTarget === "start"}
              onPress={() => {
                setScheduleTarget("start");
                setScheduleCalendarMonth(
                  monthKey(scheduleStartDate || todayLocal()),
                );
              }}
            />
            <ChoiceChip
              label={`귀국 ${scheduleEndDate ? scheduleEndDate.replaceAll("-", ".") : "선택"}`}
              selected={scheduleTarget === "end"}
              onPress={() => {
                setScheduleTarget("end");
                setScheduleCalendarMonth(
                  monthKey(
                    scheduleEndDate || scheduleStartDate || todayLocal(),
                  ),
                );
              }}
            />
          </View>
          <InlineCalendar
            month={scheduleCalendarMonth}
            onMonthChange={setScheduleCalendarMonth}
            selectedDate={
              scheduleTarget === "start" ? scheduleStartDate : scheduleEndDate
            }
            rangeStart={scheduleStartDate}
            rangeEnd={scheduleEndDate}
            onSelectDate={(date) => {
              if (scheduleTarget === "start") {
                setScheduleStartDate(date);
                if (scheduleEndDate && date > scheduleEndDate)
                  setScheduleEndDate(date);
                setScheduleTarget("end");
              } else {
                setScheduleEndDate(
                  date < scheduleStartDate ? scheduleStartDate : date,
                );
              }
            }}
          />
          <ModalActions
            onCancel={closeModal}
            onSave={() => void saveScheduleSettings()}
            saveLabel="일정 저장"
            saving={saving}
          />
        </SheetModal>

        <SheetModal
          visible={modal === "settings"}
          title="그룹 설정"
          onClose={closeModal}
        >
          <Text style={styles.inputLabel}>여행 그룹 이름</Text>
          <TextInput
            value={settingsName}
            onChangeText={setSettingsName}
            style={styles.input}
            placeholder="예: 치앙마이 여행"
            placeholderTextColor={colors.dim}
          />
          <Text style={styles.inputLabel}>환산 통화</Text>
          {activeTrip ? (
            <CurrencyChoices
              value={settingsSecondaryCurrency}
              allowNone
              disabledCurrency={activeTrip.base_currency}
              onChange={setSettingsSecondaryCurrency}
            />
          ) : null}
          <Text style={styles.helperText}>
            기준 통화는 기록의 일관성을 위해 그룹 생성 후 바꾸지 않습니다.
          </Text>
          <ModalActions
            onCancel={closeModal}
            onSave={() => void saveSettings()}
            saveLabel="저장"
            saving={saving}
          />
        </SheetModal>

        <SheetModal
          visible={modal === "invite"}
          title="그룹 코드"
          onClose={closeModal}
        >
          <Text style={styles.modalDescription}>
            이 코드를 친구에게 보내세요. 코드는 7일 동안 사용할 수 있습니다.
          </Text>
          <View style={styles.inviteCodeBox}>
            <Text style={styles.inviteCodeText}>{inviteCode}</Text>
          </View>
          <PrimaryButton label="공유하기" onPress={() => void shareInvite()} />
          <SecondaryButton label="닫기" onPress={closeModal} />
        </SheetModal>

        <SheetModal
          visible={modal === "converter"}
          title="환율 계산"
          onClose={closeModal}
        >
          {activeTrip?.secondary_currency && activeTrip.exchange_rate ? (
            <>
              <Text
                style={styles.modalDescription}
              >{`1 ${activeTrip.base_currency} ≈ ${formatRate(activeTrip.exchange_rate)} ${activeTrip.secondary_currency}`}</Text>
              <Text style={styles.inputLabel}>금액</Text>
              <TextInput
                value={converterAmount}
                onChangeText={setConverterAmount}
                style={styles.input}
                placeholder="예: 300000"
                placeholderTextColor={colors.dim}
                keyboardType="numeric"
              />
              <CurrencyChoices
                value={converterFrom}
                currencies={availableCurrencies(activeTrip)}
                onChange={(value) => value && setConverterFrom(value)}
              />
              {converterTo && converterResult !== null ? (
                <View style={styles.converterResult}>
                  <Text
                    style={styles.converterResultText}
                  >{`${formatMoney(numberOf(converterAmount), converterFrom)} ≈ ${formatMoney(converterResult, converterTo)}`}</Text>
                </View>
              ) : null}
              <SecondaryButton
                label="환율 갱신"
                onPress={() => void refreshRate()}
              />
            </>
          ) : (
            <Text style={styles.noneText}>
              먼저 그룹 설정에서 환산 통화를 선택하세요.
            </Text>
          )}
        </SheetModal>
      </SafeAreaView>
    </CurrencyDisplayContext.Provider>
  );
}

function SummaryNumber({
  label,
  value,
  secondary,
  valueColor,
  moneyBaseAmount,
  trip,
}: {
  label: string;
  value?: string;
  secondary?: string;
  valueColor?: string;
  moneyBaseAmount?: number | string | null;
  trip?: Pick<Trip, "base_currency" | "secondary_currency" | "exchange_rate">;
}) {
  return (
    <View style={styles.summaryNumber}>
      <Text style={styles.summaryNumberLabel}>{label}</Text>
      {moneyBaseAmount !== undefined && trip ? (
        <MoneyDisplay
          baseAmount={moneyBaseAmount}
          trip={trip}
          variant="summary"
          color={valueColor}
        />
      ) : (
        <Text
          style={[
            styles.summaryNumberValue,
            valueColor ? { color: valueColor } : null,
          ]}
        >
          {value}
        </Text>
      )}
      {secondary ? (
        <Text style={styles.summarySecondary} numberOfLines={2}>
          {secondary}
        </Text>
      ) : null}
    </View>
  );
}

function PerPersonBudgetRow({
  label,
  baseAmount,
  trip,
  color,
}: {
  label: string;
  baseAmount: number;
  trip: Trip;
  color?: string;
}) {
  return (
    <View style={styles.perPersonBudgetRow}>
      <Text style={[styles.perPersonBudgetLabel, color ? { color } : null]}>
        {label}
      </Text>
      <MoneyDisplay
        baseAmount={baseAmount}
        trip={trip}
        variant="small"
        color={color}
        align="right"
      />
    </View>
  );
}

function ExpenseRow({
  expense,
  trip,
  categoryName,
  onPress,
  onDelete,
}: {
  expense: Expense;
  trip: Trip;
  categoryName?: string;
  onPress: () => void;
  onDelete: () => void;
}) {
  const baseAmount = expenseBaseAmount(expense);

  return (
    <View style={styles.expenseRow}>
      <Pressable style={styles.expenseMainPress} onPress={onPress}>
        <View style={styles.expenseTextArea}>
          <Text style={styles.expenseMemo} numberOfLines={1}>
            {expense.memo || "메모 없음"}
          </Text>
          <Text
            style={styles.expenseMeta}
          >{`${expense.spent_on}${categoryName ? ` · ${categoryName}` : ""}`}</Text>
        </View>
        <View style={styles.expenseAmountArea}>
          <MoneyDisplay
            baseAmount={baseAmount}
            trip={trip}
            variant="row"
            align="right"
          />
          <Text style={styles.expenseOriginal}>탭하여 수정</Text>
        </View>
      </Pressable>
      <Pressable style={styles.rowDeleteButton} onPress={onDelete}>
        <Text style={styles.rowDeleteButtonText}>삭제</Text>
      </Pressable>
    </View>
  );
}

function PersonalExpenseRow({
  expense,
  trip,
  categoryName,
  onPress,
  onDelete,
}: {
  expense: PersonalExpense;
  trip: Trip;
  categoryName: string;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.expenseRow}>
      <Pressable style={styles.expenseMainPress} onPress={onPress}>
        <View style={styles.expenseTextArea}>
          <Text style={styles.expenseMemo} numberOfLines={1}>
            {expense.name}
          </Text>
          <Text
            style={styles.expenseMeta}
            numberOfLines={1}
          >{`${expense.spent_on} · ${categoryName}${expense.memo ? ` · ${expense.memo}` : ""}`}</Text>
        </View>
        <View style={styles.expenseAmountArea}>
          <MoneyDisplay
            baseAmount={numberOf(expense.base_amount_snapshot)}
            trip={trip}
            variant="row"
            align="right"
          />
          <Text style={styles.expenseOriginal}>탭하여 수정</Text>
        </View>
      </Pressable>
      <Pressable style={styles.rowDeleteButton} onPress={onDelete}>
        <Text style={styles.rowDeleteButtonText}>삭제</Text>
      </Pressable>
    </View>
  );
}

function ProgressLine({
  label,
  percent,
  usedBase,
  remainingBase,
  trip,
  compact = false,
}: {
  label: string;
  percent: number;
  usedBase: number;
  remainingBase: number;
  trip: Trip;
  compact?: boolean;
}) {
  const over = remainingBase < 0;
  return (
    <View
      style={[styles.progressLine, compact ? styles.progressLineCompact : null]}
    >
      <View style={styles.progressLineHeader}>
        <Text style={styles.progressLineLabel}>{label}</Text>
        <View
          style={[styles.percentPill, over ? styles.percentPillOver : null]}
        >
          <Text
            style={[
              styles.percentPillText,
              over ? styles.percentPillTextOver : null,
            ]}
          >
            {Math.round(percent)}%
          </Text>
        </View>
      </View>
      <View style={styles.progressTrackSmallWide}>
        <View
          style={[
            styles.progressValue,
            { width: `${percent}%` },
            over ? styles.progressOver : styles.progressNormal,
          ]}
        />
      </View>
      <View style={styles.progressLineMoney}>
        <Text style={styles.progressLineCaption}>사용</Text>
        <MoneyDisplay baseAmount={usedBase} trip={trip} variant="small" />
        <Text
          style={[styles.progressLineCaption, styles.progressLineRemaining]}
        >
          잔액
        </Text>
        <MoneyDisplay
          baseAmount={remainingBase}
          trip={trip}
          variant="small"
          color={over ? colors.red : colors.green}
          align="right"
        />
      </View>
    </View>
  );
}

function PaymentBalanceCard({
  label,
  totalBase,
  spentBase,
  remainingBase,
  percent,
  trip,
  onPress,
  actionHint,
  allocationPending = false,
}: {
  label: string;
  totalBase: number;
  spentBase: number;
  remainingBase: number;
  percent: number;
  trip: Trip;
  onPress?: () => void;
  actionHint?: string;
  allocationPending?: boolean;
}) {
  const showSecondaryCurrency = useContext(CurrencyDisplayContext);
  const over = remainingBase < 0;
  const content = (
    <>
      <View style={styles.paymentBalanceTitleRow}>
        <Text style={styles.paymentBalanceLabel}>{label}</Text>
        <Text
          style={[styles.paymentBalancePercent, over ? styles.redText : null]}
        >
          {allocationPending ? "배분 전" : `${Math.round(percent)}% 사용`}
        </Text>
      </View>
      {allocationPending ? (
        <>
          <Text style={styles.paymentBalancePendingText}>금액 미설정</Text>
          <Text style={styles.paymentBalanceHint}>
            탭하여 회비 안에서 금액을 배분하세요.
          </Text>
          <View style={styles.paymentTrack}>
            <View
              style={[
                styles.progressValue,
                { width: "0%" },
                styles.progressNormal,
              ]}
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.paymentBalanceMetrics}>
            <View style={styles.paymentBalanceMetric}>
              <Text style={styles.paymentBalanceMetricLabel}>배정 총액</Text>
              <MoneyDisplay
                baseAmount={totalBase}
                trip={trip}
                variant="small"
              />
            </View>
            <View style={styles.paymentBalanceMetricRight}>
              <Text style={styles.paymentBalanceMetricLabel}>사용 금액</Text>
              <MoneyDisplay
                baseAmount={spentBase}
                trip={trip}
                variant="small"
                align="right"
              />
            </View>
          </View>
          <View style={styles.paymentBalanceRemainingRow}>
            <Text
              style={[
                styles.paymentBalanceRemainingLabel,
                over ? styles.redText : styles.greenText,
              ]}
            >
              남은 잔액
            </Text>
            <View style={styles.paymentBalanceCurrencyLines}>
              <Text
                style={[
                  styles.paymentBalanceCurrencyPrimary,
                  { color: over ? colors.red : colors.green },
                ]}
              >{`${trip.base_currency} ${formatMoney(remainingBase, trip.base_currency)}`}</Text>
              {showSecondaryCurrency &&
              trip.secondary_currency &&
              numberOf(trip.exchange_rate) > 0 ? (
                <Text
                  style={[
                    styles.paymentBalanceCurrencySecondary,
                    { color: over ? colors.red : colors.green },
                  ]}
                >{`${trip.secondary_currency} ${formatMoney(remainingBase * numberOf(trip.exchange_rate), trip.secondary_currency)}`}</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.paymentTrack}>
            <View
              style={[
                styles.progressValue,
                { width: `${percent}%` },
                over ? styles.progressOver : styles.progressNormal,
              ]}
            />
          </View>
        </>
      )}
      {actionHint ? (
        <Text style={styles.paymentBalanceActionHint}>{actionHint}</Text>
      ) : null}
    </>
  );

  return onPress ? (
    <Pressable
      style={({ pressed }) => [
        styles.paymentBalanceCard,
        styles.paymentBalanceCardPressable,
        pressed ? styles.paymentBalanceCardPressed : null,
      ]}
      onPress={onPress}
    >
      {content}
    </Pressable>
  ) : (
    <View style={styles.paymentBalanceCard}>{content}</View>
  );
}

const CATEGORY_CHART_COLORS = [
  "#D18A3C",
  "#5274B8",
  "#3B876A",
  "#7A73A8",
  "#B8756B",
  "#A78C49",
  "#4D8179",
];

function CategorySpendDonutChart({
  items,
  totalBase,
  trip,
}: {
  items: Array<{
    id: string;
    name: string;
    kind: "fund" | "additional";
    baseAmount: number;
    percent: number;
  }>;
  totalBase: number;
  trip: Trip;
}) {
  const size = 164;
  const center = size / 2;
  const radius = 56;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View style={styles.categoryDonutContent}>
      <View style={styles.categoryDonutWrap}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colors.line}
            strokeWidth={strokeWidth}
          />
          {items.map((item, index) => {
            const segmentLength = (item.baseAmount / totalBase) * circumference;
            const gap = items.length > 1 ? 3 : 0;
            const dash = Math.max(segmentLength - gap, 0);
            const dashOffset = -offset;
            offset += segmentLength;
            return (
              <Circle
                key={item.id}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={
                  CATEGORY_CHART_COLORS[index % CATEGORY_CHART_COLORS.length]
                }
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                rotation="-90"
                origin={`${center}, ${center}`}
              />
            );
          })}
        </Svg>
        <View style={styles.categoryDonutCenter}>
          <Text style={styles.categoryDonutCenterLabel}>그룹 총 지출</Text>
          <Text style={styles.categoryDonutCenterValue}>
            {formatMoney(totalBase, trip.base_currency)}
          </Text>
        </View>
      </View>
      <View style={styles.categorySpendLegend}>
        {items.map((item, index) => (
          <View key={item.id} style={styles.categorySpendLegendRow}>
            <View
              style={[
                styles.categorySpendLegendDot,
                {
                  backgroundColor:
                    CATEGORY_CHART_COLORS[index % CATEGORY_CHART_COLORS.length],
                },
              ]}
            />
            <View style={styles.categorySpendLegendTextArea}>
              <Text style={styles.categorySpendLegendName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.categorySpendLegendMoney}>
                {item.kind === "fund" ? "공용 회비" : "별도 비용"} ·{" "}
                {formatMoney(item.baseAmount, trip.base_currency)}
              </Text>
            </View>
            <Text style={styles.categorySpendLegendPercent}>
              {Math.round(item.percent)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function InlineCalendar({
  month,
  onMonthChange,
  selectedDate,
  onSelectDate,
  rangeStart,
  rangeEnd,
}: {
  month: string;
  onMonthChange: (value: string) => void;
  selectedDate: string;
  onSelectDate: (value: string) => void;
  rangeStart?: string;
  rangeEnd?: string;
}) {
  const weeks = calendarWeeks(month);
  return (
    <View style={styles.inlineCalendar}>
      <View style={styles.calendarHeader}>
        <Pressable
          style={styles.calendarNavButton}
          onPress={() => onMonthChange(addMonths(month, -1))}
        >
          <Text style={styles.calendarNavText}>‹</Text>
        </Pressable>
        <Text style={styles.calendarMonthText}>{monthLabel(month)}</Text>
        <Pressable
          style={styles.calendarNavButton}
          onPress={() => onMonthChange(addMonths(month, 1))}
        >
          <Text style={styles.calendarNavText}>›</Text>
        </Pressable>
      </View>
      <View style={styles.calendarWeekRow}>
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <Text key={day} style={styles.calendarWeekText}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {weeks.map((day) => {
          const inRange =
            rangeStart &&
            rangeEnd &&
            day.key >= rangeStart &&
            day.key <= rangeEnd;
          const selected = day.key === selectedDate;
          return (
            <Pressable
              key={day.key}
              disabled={!day.inMonth}
              onPress={() => onSelectDate(day.key)}
              style={[
                styles.calendarDay,
                selected ? styles.calendarDaySelected : null,
                inRange && !selected ? styles.calendarDayInRange : null,
                !day.inMonth ? styles.calendarDayMuted : null,
              ]}
            >
              <Text
                style={[
                  styles.calendarDayText,
                  selected ? styles.calendarDayTextSelected : null,
                  !day.inMonth ? styles.calendarDayTextMuted : null,
                ]}
              >
                {day.day}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MonthSpendCalendar({
  month,
  onMonthChange,
  selectedDate,
  onSelectDate,
  dailyTotals,
  trip,
}: {
  month: string;
  onMonthChange: (value: string) => void;
  selectedDate: string | null;
  onSelectDate: (value: string) => void;
  dailyTotals: Record<string, number>;
  trip: Trip;
}) {
  const weeks = calendarWeeks(month);
  return (
    <View style={styles.monthSpendCalendar}>
      <View style={styles.calendarHeader}>
        <Pressable
          style={styles.calendarNavButton}
          onPress={() => onMonthChange(addMonths(month, -1))}
        >
          <Text style={styles.calendarNavText}>‹</Text>
        </Pressable>
        <Text style={styles.calendarMonthText}>{monthLabel(month)}</Text>
        <Pressable
          style={styles.calendarNavButton}
          onPress={() => onMonthChange(addMonths(month, 1))}
        >
          <Text style={styles.calendarNavText}>›</Text>
        </Pressable>
      </View>
      <View style={styles.calendarWeekRow}>
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <Text key={day} style={styles.calendarWeekText}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.spendCalendarGrid}>
        {weeks.map((day) => {
          const amount = dailyTotals[day.key] ?? 0;
          const selected = day.key === selectedDate;
          return (
            <Pressable
              key={day.key}
              disabled={!day.inMonth}
              onPress={() => onSelectDate(day.key)}
              style={[
                styles.spendCalendarDay,
                selected ? styles.spendCalendarDaySelected : null,
                !day.inMonth ? styles.calendarDayMuted : null,
              ]}
            >
              <Text
                style={[
                  styles.calendarDayText,
                  selected ? styles.calendarDayTextSelected : null,
                  !day.inMonth ? styles.calendarDayTextMuted : null,
                ]}
              >
                {day.day}
              </Text>
              {amount > 0 ? (
                <Text
                  style={[
                    styles.spendCalendarAmount,
                    selected ? styles.spendCalendarAmountSelected : null,
                  ]}
                  numberOfLines={1}
                >
                  {formatMoney(amount, trip.base_currency)}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function LedgerRow({
  entry,
  trip,
  onPress,
  onDelete,
}: {
  entry: LedgerEntry;
  trip: Trip;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.expenseRow}>
      <Pressable style={styles.expenseMainPress} onPress={onPress}>
        <View style={styles.expenseTextArea}>
          <View style={styles.ledgerRowTitleLine}>
            <Text style={styles.expenseMemo} numberOfLines={1}>
              {entry.title}
            </Text>
            <Text
              style={[
                styles.ledgerKindBadge,
                entry.kind === "additional"
                  ? styles.ledgerKindAdditional
                  : null,
              ]}
            >
              {entry.kind === "fund" ? "회비" : "별도"}
            </Text>
          </View>
          <Text
            style={styles.expenseMeta}
          >{`${entry.date} · ${entry.categoryName ?? ""}${entry.paymentMethod ? ` · ${entry.paymentMethod === "card" ? "카드" : "현금"}` : ""}`}</Text>
        </View>
        <View style={styles.expenseAmountArea}>
          <MoneyDisplay
            baseAmount={entry.baseAmount}
            trip={trip}
            variant="row"
            align="right"
          />
          <Text style={styles.expenseOriginal}>탭하여 수정</Text>
        </View>
      </Pressable>
      <Pressable style={styles.rowDeleteButton} onPress={onDelete}>
        <Text style={styles.rowDeleteButtonText}>삭제</Text>
      </Pressable>
    </View>
  );
}

function DetailTabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.detailTabButton,
        active ? styles.detailTabButtonActive : null,
      ]}
    >
      <Text
        style={[
          styles.detailTabText,
          active ? styles.detailTabTextActive : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CurrencyChoices({
  value,
  onChange,
  allowNone = false,
  disabledCurrency,
  currencies = CURRENCIES.map((item) => item.code),
}: {
  value: Currency | null;
  onChange: (value: Currency | null) => void;
  allowNone?: boolean;
  disabledCurrency?: Currency;
  currencies?: Currency[];
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {allowNone ? (
        <ChoiceChip
          label="사용 안 함"
          selected={value === null}
          onPress={() => onChange(null)}
        />
      ) : null}
      {currencies.map((currency) => (
        <ChoiceChip
          key={currency}
          label={`${symbolOf(currency)} ${currency}`}
          selected={value === currency}
          disabled={disabledCurrency === currency}
          onPress={() => onChange(currency)}
        />
      ))}
    </ScrollView>
  );
}

function ChoiceChip({
  label,
  selected,
  onPress,
  disabled = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.chip,
        selected ? styles.chipSelected : null,
        disabled ? styles.chipDisabled : null,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          selected ? styles.chipTextSelected : null,
          disabled ? styles.chipTextDisabled : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      style={[styles.primaryButton, disabled ? styles.buttonDisabled : null]}
      onPress={onPress}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.secondaryButton} onPress={onPress}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SheetModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  // 닫힌 모달은 DOM에 남기지 않습니다. iPhone 웹앱에서 투명 레이어가
  // 하단 저장 버튼의 터치를 가로채는 현상을 막습니다.
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.modalScroll}
          keyboardShouldPersistTaps="always"
        >
          <View style={styles.modalBox}>
            <View style={styles.modalTitleRow}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ModalActions({
  onCancel,
  onSave,
  saveLabel,
  saving,
}: {
  onCancel: () => void;
  onSave: () => void;
  saveLabel: string;
  saving: boolean;
}) {
  return (
    <View style={styles.modalActions}>
      <Pressable style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>취소</Text>
      </Pressable>
      <Pressable
        disabled={saving}
        style={[styles.saveButton, saving ? styles.buttonDisabled : null]}
        onPress={onSave}
      >
        {saving ? (
          <ActivityIndicator color={colors.bg} />
        ) : (
          <Text style={styles.saveButtonText}>{saveLabel}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  page: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 42,
    gap: 16,
    backgroundColor: colors.bg,
  },
  centerScreen: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  loadingText: { color: colors.muted, fontSize: 14, marginTop: 12 },
  errorTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
  },
  errorBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 12,
  },
  errorHint: {
    color: colors.amber,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 18,
  },
  eyebrow: {
    color: colors.amber,
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 1.8,
  },
  pageTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    marginTop: -5,
  },
  pageDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: -8,
  },
  stack: { gap: 10 },
  actionStack: { gap: 10, marginTop: 4 },
  groupsHero: {
    backgroundColor: colors.amber,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 19,
    paddingBottom: 18,
    marginBottom: 3,
    overflow: "hidden",
  },
  groupsHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  groupsHeroEyebrow: {
    color: "#BFD1EB",
    fontWeight: "900",
    fontSize: 10,
    letterSpacing: 1.7,
  },
  groupsHeroBadge: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  groupsHeroBadgeText: {
    color: "#E8F0FC",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  groupsHeroTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    lineHeight: 37,
    letterSpacing: -1,
    fontWeight: "900",
    marginTop: 14,
  },
  groupsHeroDescription: {
    color: "#C7D6EA",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 5,
  },
  groupsHeroRule: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.16)",
    marginTop: 16,
  },
  groupListSection: { gap: 10 },
  groupListHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  groupListTitle: {
    color: colors.text,
    fontSize: 15,
    letterSpacing: -0.2,
    fontWeight: "900",
  },
  groupListCount: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: "900",
  },
  emptyCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 22,
    alignItems: "center",
    gap: 7,
  },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  emptyBody: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  groupCard: {
    backgroundColor: colors.panel,
    borderColor: "#9DB3CF",
    borderWidth: 1,
    borderRadius: 18,
    padding: 17,
    gap: 13,
    overflow: "hidden",
    shadowColor: "#142C4B",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  groupCardAccent: {
    position: "absolute",
    left: 0,
    top: 17,
    bottom: 17,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: colors.amber,
  },
  groupCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingLeft: 5,
  },
  groupTextArea: { flex: 1, gap: 4 },
  groupName: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 25,
    letterSpacing: -0.45,
    fontWeight: "900",
  },
  groupMembers: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  arrow: {
    color: colors.amber,
    fontSize: 28,
    lineHeight: 28,
    fontWeight: "500",
  },
  currencyText: {
    color: colors.blue,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  groupFundBlock: {
    backgroundColor: "#EAF1F9",
    borderColor: "#AFC2DA",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    gap: 4,
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.amber,
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  primaryButtonText: { color: colors.bg, fontSize: 15, fontWeight: "900" },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 50,
    paddingHorizontal: 16,
  },
  secondaryButtonText: { color: colors.text, fontSize: 14, fontWeight: "800" },
  buttonDisabled: { opacity: 0.55 },
  detailTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  backButton: { paddingVertical: 7, paddingHorizontal: 2 },
  backButtonText: { color: colors.muted, fontSize: 14, fontWeight: "700" },
  headerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 7,
    flex: 1,
    marginLeft: 8,
  },
  headerButton: {
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 9,
  },
  headerButtonText: { color: colors.amber, fontSize: 12, fontWeight: "800" },
  headerDangerButton: {
    borderColor: "#E9D0D4",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 9,
  },
  headerDangerButtonText: {
    color: colors.red,
    fontSize: 12,
    fontWeight: "800",
  },
  scheduleTabButton: {
    minHeight: 54,
    backgroundColor: "#EDF3FA",
    borderColor: "#9FB4CF",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scheduleTabInfo: { flex: 1, gap: 3 },
  scheduleTabLabel: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  scheduleTabDate: { color: colors.text, fontSize: 14, fontWeight: "900" },
  scheduleTabChevron: {
    color: colors.amber,
    fontSize: 24,
    fontWeight: "500",
    lineHeight: 24,
    marginLeft: 12,
  },
  tabBar: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: "#EAF0F8",
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
  },
  detailTabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 38,
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  detailTabButtonActive: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: "#9FB6D2",
  },
  detailTabText: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  detailTabTextActive: { color: colors.amber },
  summaryCard: {
    backgroundColor: colors.panel,
    borderColor: "#AFC1D8",
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: colors.amber,
    borderRadius: 16,
    padding: 17,
    gap: 14,
  },
  totalBudgetCard: {
    backgroundColor: "#F0F5FC",
    borderColor: colors.amber,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 16,
    padding: 17,
    gap: 13,
  },
  totalBudgetTitleArea: { flex: 1, gap: 4, paddingRight: 10 },
  totalBudgetHint: { color: colors.dim, fontSize: 10, lineHeight: 14 },
  totalBudgetValue: {
    color: colors.amber,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "right",
  },
  totalBudgetValueArea: { alignItems: "flex-end", gap: 5 },
  totalBudgetSpentInline: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    gap: 6,
  },
  totalBudgetSpentLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    paddingTop: 1,
  },
  totalBudgetPerPerson: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 17,
  },
  travelBudgetMetricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  travelBudgetMetric: {
    width: "48.5%",
    backgroundColor: colors.panelSoft,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  perPersonBudgetRows: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 8,
  },
  perPersonSpendDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginTop: 2,
    marginBottom: 2,
  },
  perPersonBudgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  perPersonBudgetLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    paddingTop: 1,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fundHeaderActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryLabel: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.15,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#E7F0EB",
  },
  statusNormal: { backgroundColor: "#E7F0EB" },
  statusOver: { backgroundColor: "#F7ECEE" },
  statusText: { fontWeight: "900", fontSize: 11 },
  statusTextNormal: { color: colors.green, fontWeight: "900", fontSize: 11 },
  statusTextOver: { color: colors.red },
  summaryNumbers: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#C5D3E5",
    marginVertical: 2,
  },
  summaryNumber: { flex: 1, gap: 4 },
  summaryNumberLabel: { color: colors.dim, fontSize: 10, fontWeight: "700" },
  summaryNumberValue: { color: colors.text, fontSize: 14, fontWeight: "900" },
  summarySecondary: { color: colors.dim, fontSize: 9, lineHeight: 13 },
  moneyDisplay: { gap: 1 },
  moneyDisplayRight: { alignItems: "flex-end" },
  moneyHeadline: { color: colors.text, fontSize: 17, fontWeight: "900" },
  moneySummary: { color: colors.text, fontSize: 14, fontWeight: "900" },
  moneyBody: { color: colors.text, fontSize: 13, fontWeight: "800" },
  moneySmall: { color: colors.text, fontSize: 11, fontWeight: "800" },
  moneyRow: { color: colors.text, fontSize: 13, fontWeight: "900" },
  moneySecondary: {
    color: colors.blue,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 14,
  },
  moneySecondaryRight: { textAlign: "right" },
  progressTrack: {
    backgroundColor: colors.line,
    height: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  progressTrackSmall: {
    marginHorizontal: 15,
    backgroundColor: colors.line,
    height: 8,
    borderRadius: 7,
    overflow: "hidden",
  },
  progressValue: { height: "100%", borderRadius: 8 },
  progressNormal: { backgroundColor: colors.amber },
  progressOver: { backgroundColor: colors.red },
  percentText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "right",
    marginTop: -8,
  },
  rateRow: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  rateText: { color: colors.dim, fontSize: 11, flex: 1, lineHeight: 16 },
  rateRefresh: { color: colors.amber, fontSize: 11, fontWeight: "800" },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.amber,
    paddingLeft: 9,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    letterSpacing: -0.35,
    fontWeight: "900",
  },
  subSectionText: {
    color: colors.dim,
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },
  countText: { color: colors.dim, fontSize: 12, fontWeight: "700" },
  categoryCard: {
    backgroundColor: colors.panel,
    borderColor: "#B2C3D8",
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: "#587AA5",
    borderRadius: 14,
    overflow: "hidden",
    gap: 11,
    paddingTop: 4,
  },
  categoryOpenHint: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "right",
    paddingHorizontal: 15,
    paddingBottom: 12,
    marginTop: -5,
  },
  personalCategoryCard: {
    backgroundColor: colors.panel,
    borderColor: "#B2C3D8",
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: "#587AA5",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  personalCategoryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  personalCategoryTitleArea: { flex: 1, gap: 3, paddingTop: 1 },
  personalCategoryBudgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
    backgroundColor: colors.panelSoft,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 11,
  },
  personalCategoryBudgetLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    paddingBottom: 1,
  },
  personalCategoryTotals: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    paddingTop: 1,
  },
  personalCategoryMetric: { flex: 1, gap: 1 },
  cardActionRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardEditButton: {
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 9,
    minWidth: 42,
    alignItems: "center",
  },
  cardEditButtonText: { color: colors.amber, fontSize: 11, fontWeight: "900" },
  cardDeleteButton: {
    borderColor: "#E9D0D4",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 9,
    minWidth: 42,
    alignItems: "center",
  },
  cardDeleteButtonText: { color: colors.red, fontSize: 11, fontWeight: "900" },
  categoryDetailSummaryCard: {
    backgroundColor: "#F1F6FC",
    borderColor: colors.amber,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 16,
    padding: 17,
    gap: 14,
  },
  categoryDeleteHeaderButton: {
    borderColor: "#E9D0D4",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  categoryDeleteHeaderText: {
    color: colors.red,
    fontSize: 12,
    fontWeight: "800",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 11,
  },
  categoryTitleArea: { flex: 1, gap: 3 },
  categoryName: { color: colors.text, fontSize: 16, fontWeight: "800" },
  categoryBudget: { color: colors.dim, fontSize: 11, lineHeight: 15 },
  categoryToggle: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: "800",
    paddingLeft: 10,
  },
  categoryTotals: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 15,
    paddingBottom: 13,
  },
  categoryTotalText: { color: colors.muted, fontSize: 11 },
  categoryTotalLabel: { color: colors.muted, fontSize: 10, marginBottom: 2 },
  categoryTotalRight: { alignItems: "flex-end" },
  categoryUsageCard: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 12,
    padding: 13,
    gap: 10,
  },
  categoryUsageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryUsageTitle: { color: colors.text, fontSize: 13, fontWeight: "900" },
  categoryUsagePercent: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: "900",
  },
  categoryUsageNumbers: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  progressTrackSmallWide: {
    backgroundColor: colors.line,
    height: 8,
    borderRadius: 7,
    overflow: "hidden",
  },
  categoryUsageCaption: {
    color: colors.dim,
    fontSize: 10,
    lineHeight: 14,
    marginTop: -2,
  },
  greenText: { color: colors.green },
  redText: { color: colors.red },
  categoryDetail: {
    backgroundColor: colors.panelSoft,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    padding: 13,
    gap: 8,
  },
  inlineActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 7,
    marginBottom: 2,
  },
  smallAction: {
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 7,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  smallActionText: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  smallDangerAction: {
    borderColor: "#E9D0D4",
    borderWidth: 1,
    borderRadius: 7,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  smallDangerText: { color: colors.red, fontSize: 11, fontWeight: "800" },
  noneText: {
    color: colors.dim,
    fontSize: 13,
    lineHeight: 19,
    paddingVertical: 5,
  },
  additionalTotalCard: {
    backgroundColor: colors.panel,
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  additionalTotalTitleArea: { flex: 1, gap: 4 },
  additionalTotalLabel: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: "900",
  },
  additionalTotalHint: { color: colors.dim, fontSize: 10, lineHeight: 14 },
  additionalPerPersonCard: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  additionalSummaryText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  additionalCard: {
    backgroundColor: colors.panel,
    borderColor: "#B2C3D8",
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: "#587AA5",
    borderRadius: 12,
    padding: 14,
    gap: 9,
  },
  additionalCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  additionalTop: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    paddingTop: 2,
  },
  additionalName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
  },
  additionalScope: { color: colors.amber, fontSize: 11, fontWeight: "800" },
  additionalOriginal: { color: colors.text, fontSize: 13, fontWeight: "700" },
  additionalBottom: { flexDirection: "row", justifyContent: "space-between" },
  ledgerCard: {
    backgroundColor: colors.panel,
    borderColor: "#B2C3D8",
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: "#587AA5",
    borderRadius: 14,
    overflow: "hidden",
  },
  ledgerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  ledgerBody: {
    backgroundColor: colors.panelSoft,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    padding: 14,
    gap: 8,
  },
  chipRow: { flexDirection: "row", gap: 7, paddingVertical: 1 },
  chip: {
    borderColor: "#AABDD4",
    borderWidth: 1,
    backgroundColor: "#F9FBFE",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 11,
  },
  chipSelected: { borderColor: colors.amber, backgroundColor: "#DDE9F7" },
  chipDisabled: { opacity: 0.38 },
  chipText: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  chipTextSelected: { color: colors.amber },
  chipTextDisabled: { color: colors.dim },
  scopeRow: { flexDirection: "row", gap: 7, flexWrap: "wrap" },
  dateRow: { flexDirection: "row", gap: 8 },
  dateInputArea: { flex: 1, gap: 0 },
  ledgerSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 5,
    paddingBottom: 2,
  },
  ledgerTotalArea: { alignItems: "flex-end", gap: 2 },
  expenseRow: {
    backgroundColor: "#F8FAFD",
    borderColor: "#B4C5D9",
    borderWidth: 1,
    borderRadius: 9,
    minHeight: 54,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  expenseMainPress: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  rowDeleteButton: {
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: 7,
    paddingVertical: 6,
    paddingHorizontal: 9,
    alignSelf: "center",
  },
  rowDeleteButtonText: { color: colors.red, fontSize: 11, fontWeight: "900" },
  categoryCardMainPress: { flex: 1 },
  additionalCardMainPress: { flex: 1 },
  expenseTextArea: { flex: 1, gap: 3 },
  expenseMemo: { color: colors.text, fontSize: 13, fontWeight: "700" },
  expenseMeta: { color: colors.dim, fontSize: 10 },
  expenseAmountArea: { alignItems: "flex-end", gap: 2 },
  expenseAmount: { color: colors.text, fontSize: 13, fontWeight: "900" },
  expenseOriginal: { color: colors.dim, fontSize: 10 },
  deleteGroupLink: { alignSelf: "center", paddingVertical: 12, marginTop: 3 },
  deleteGroupText: {
    color: colors.red,
    fontSize: 12,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalScroll: { flexGrow: 1, justifyContent: "flex-end" },
  modalBox: {
    backgroundColor: colors.panel,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 3,
    borderTopColor: colors.amber,
    padding: 20,
    paddingBottom: 34,
    gap: 9,
  },
  modalTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  modalTitle: { color: colors.text, fontSize: 21, fontWeight: "900" },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.panelSoft,
  },
  closeButtonText: { color: colors.muted, fontSize: 23, lineHeight: 25 },
  modalDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  inputLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },
  input: {
    backgroundColor: "#F9FBFE",
    borderColor: "#9FB4CF",
    borderWidth: 1,
    color: colors.text,
    borderRadius: 10,
    minHeight: 46,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  helperText: {
    color: colors.dim,
    fontSize: 11,
    lineHeight: 17,
    marginTop: -1,
  },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 16 },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 10,
  },
  cancelButtonText: { color: colors.muted, fontSize: 14, fontWeight: "900" },
  saveButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    backgroundColor: colors.amber,
    borderRadius: 10,
  },
  saveButtonText: { color: colors.bg, fontSize: 14, fontWeight: "900" },
  inviteCodeBox: {
    backgroundColor: colors.bg,
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginVertical: 4,
  },
  inviteCodeText: {
    color: colors.amber,
    letterSpacing: 3,
    fontSize: 26,
    fontWeight: "900",
  },
  converterResult: {
    backgroundColor: colors.bg,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginTop: 5,
  },
  converterResultText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  scheduleStrip: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scheduleStripLabel: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  scheduleStripValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 3,
  },
  scheduleStripAction: { color: colors.amber, fontSize: 12, fontWeight: "900" },
  fundManageActionRow: { flexDirection: "row", gap: 8, marginTop: 2 },
  fundManageEditButton: {
    flex: 1,
    minHeight: 38,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fundManageEditButtonText: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: "900",
  },
  fundManageDeleteButton: {
    flex: 1,
    minHeight: 38,
    borderColor: "#E9D0D4",
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fundManageDeleteButtonText: {
    color: colors.red,
    fontSize: 12,
    fontWeight: "900",
  },
  paymentBalanceRow: { flexDirection: "row", gap: 9 },
  paymentBalanceCard: {
    flex: 1,
    backgroundColor: colors.panelSoft,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 12,
    padding: 11,
    gap: 6,
  },
  paymentBalanceCardPressable: { borderColor: "#C2CDD9" },
  paymentBalanceCardPressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  paymentBalanceTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 5,
  },
  paymentBalanceLabel: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  paymentBalancePercent: {
    color: colors.amber,
    fontSize: 10,
    fontWeight: "900",
  },
  paymentBalancePendingText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
  },
  paymentBalanceMetrics: { flexDirection: "row", gap: 6, paddingTop: 1 },
  paymentBalanceMetric: { flex: 1, gap: 2 },
  paymentBalanceMetricRight: { flex: 1, alignItems: "flex-end", gap: 2 },
  paymentBalanceMetricLabel: {
    color: colors.dim,
    fontSize: 9,
    fontWeight: "800",
  },
  paymentBalanceRemainingRow: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 5,
  },
  paymentBalanceRemainingLabel: {
    fontSize: 10,
    fontWeight: "900",
    paddingTop: 2,
  },
  paymentBalanceCurrencyLines: { alignItems: "flex-end", gap: 1, flex: 1 },
  paymentBalanceCurrencyPrimary: {
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
  },
  paymentBalanceCurrencySecondary: {
    fontSize: 10,
    fontWeight: "800",
    textAlign: "right",
    opacity: 0.9,
  },
  paymentBalanceHint: { color: colors.dim, fontSize: 9, lineHeight: 13 },
  paymentBalanceActionHint: {
    color: colors.blue,
    fontSize: 9,
    fontWeight: "800",
    marginTop: 1,
  },
  paymentTrack: {
    height: 6,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: colors.line,
    marginTop: 2,
  },
  progressLine: { gap: 7, paddingVertical: 2 },
  progressLineCompact: { gap: 6 },
  progressLineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLineLabel: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  percentPill: {
    backgroundColor: "#EBEEF3",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  percentPillOver: { backgroundColor: "#F7ECEE" },
  percentPillText: { color: colors.amber, fontSize: 10, fontWeight: "900" },
  percentPillTextOver: { color: colors.red },
  progressLineMoney: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  progressLineCaption: { color: colors.dim, fontSize: 9, paddingBottom: 1 },
  progressLineRemaining: { marginLeft: "auto" },
  additionalDateText: { color: colors.dim, fontSize: 10, marginTop: -2 },
  travelPhaseCard: {
    backgroundColor: colors.panel,
    borderColor: "#B2C3D8",
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: "#587AA5",
    borderRadius: 14,
    padding: 14,
    gap: 11,
  },
  travelPhaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  travelPhaseTitle: { color: colors.text, fontSize: 14, fontWeight: "900" },
  travelPhaseDate: {
    color: colors.amber,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "right",
    flex: 1,
  },
  travelPhaseNumbers: { flexDirection: "row", gap: 10 },
  travelPhaseHint: { color: colors.dim, fontSize: 11, lineHeight: 17 },
  usageStatsCard: {
    backgroundColor: colors.panel,
    borderColor: "#B2C3D8",
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: "#587AA5",
    borderRadius: 14,
    padding: 14,
    gap: 9,
  },
  usageStatsTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  usageStatsDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 2,
  },
  categorySpendChartCard: {
    backgroundColor: colors.panel,
    borderColor: "#B2C3D8",
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: "#587AA5",
    borderRadius: 14,
    padding: 14,
    gap: 14,
  },
  categorySpendChartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  categorySpendChartHint: {
    color: colors.dim,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
    maxWidth: 220,
  },
  categorySpendTotalArea: { alignItems: "flex-end", gap: 3 },
  categorySpendTotalLabel: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: "800",
  },
  categoryDonutContent: { flexDirection: "row", alignItems: "center", gap: 14 },
  categoryDonutWrap: {
    width: 164,
    height: 164,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryDonutCenter: {
    position: "absolute",
    alignItems: "center",
    maxWidth: 100,
  },
  categoryDonutCenterLabel: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: "800",
  },
  categoryDonutCenterValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 3,
    textAlign: "center",
  },
  categorySpendLegend: { flex: 1, gap: 9, minWidth: 0 },
  categorySpendLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  categorySpendLegendDot: { width: 9, height: 9, borderRadius: 99 },
  categorySpendLegendTextArea: { flex: 1, minWidth: 0 },
  categorySpendLegendName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  categorySpendLegendMoney: { color: colors.dim, fontSize: 9, marginTop: 2 },
  categorySpendLegendPercent: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: "900",
    minWidth: 32,
    textAlign: "right",
  },
  monthSpendCalendar: {
    backgroundColor: colors.bg,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 8,
    marginTop: 5,
  },
  inlineCalendar: {
    backgroundColor: colors.bg,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 8,
    marginTop: 4,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarNavButton: {
    width: 32,
    height: 30,
    borderRadius: 8,
    borderColor: colors.line,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarNavText: {
    color: colors.amber,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 22,
  },
  calendarMonthText: { color: colors.text, fontSize: 13, fontWeight: "900" },
  calendarWeekRow: { flexDirection: "row" },
  calendarWeekText: {
    width: "14.2857%",
    textAlign: "center",
    color: colors.dim,
    fontSize: 10,
    fontWeight: "800",
  },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  calendarDay: {
    width: "14.2857%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  calendarDayMuted: { opacity: 0.25 },
  calendarDaySelected: { backgroundColor: colors.amber },
  calendarDayInRange: { backgroundColor: "#EBEEF3" },
  calendarDayText: { color: colors.text, fontSize: 12, fontWeight: "800" },
  calendarDayTextSelected: { color: colors.bg },
  calendarDayTextMuted: { color: colors.dim },
  spendCalendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  spendCalendarDay: {
    width: "14.2857%",
    minHeight: 52,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 6,
    borderRadius: 7,
  },
  spendCalendarDaySelected: {
    backgroundColor: "#EBEEF3",
    borderColor: colors.amber,
    borderWidth: 1,
  },
  spendCalendarAmount: {
    color: colors.blue,
    fontSize: 7,
    fontWeight: "800",
    marginTop: 3,
    maxWidth: "95%",
  },
  spendCalendarAmountSelected: { color: colors.amber },
  ledgerSelectedHint: { color: colors.dim, fontSize: 9, marginTop: 3 },
  ledgerRowTitleLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  ledgerKindBadge: {
    color: colors.green,
    fontSize: 9,
    fontWeight: "900",
    backgroundColor: "#E7F0EB",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 6,
  },
  ledgerKindAdditional: { color: colors.blue, backgroundColor: "#E9EDF3" },
  datePickerButton: {
    minHeight: 46,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.bg,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  datePickerButtonText: { color: colors.text, fontSize: 15, fontWeight: "800" },
  datePickerIcon: { color: colors.amber, fontSize: 17, fontWeight: "900" },
  scheduleChoiceRow: { flexDirection: "row", gap: 7, flexWrap: "wrap" },
  fundHistoryCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  fundHistoryEmpty: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.line,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  fundHistoryItem: { paddingHorizontal: 14, paddingVertical: 12, gap: 4 },
  fundHistoryItemBorder: { borderTopColor: colors.line, borderTopWidth: 1 },
  fundHistoryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  fundHistoryTitleArea: { flex: 1, gap: 2 },
  fundHistoryTitle: { color: colors.text, fontSize: 13, fontWeight: "900" },
  fundHistoryDate: { color: colors.dim, fontSize: 10 },
  fundHistoryAmount: { fontSize: 13, fontWeight: "900", textAlign: "right" },
  fundHistoryMeta: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  fundHistoryAfter: { color: colors.dim, fontSize: 10, lineHeight: 15 },
  fundRoundGuide: {
    color: colors.dim,
    fontSize: 10,
    lineHeight: 15,
    marginTop: -4,
  },
  fundRoundActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 7,
    marginTop: 5,
  },
  fundRoundEditButton: {
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 7,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  fundRoundEditButtonText: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: "900",
  },
  fundRoundDeleteButton: {
    borderColor: "#E9D0D4",
    borderWidth: 1,
    borderRadius: 7,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  fundRoundDeleteButtonText: {
    color: colors.red,
    fontSize: 11,
    fontWeight: "900",
  },
  fundSplitTotalBox: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 3,
  },
  fundSplitSummaryBox: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 9,
    marginTop: 3,
  },
  fundSplitSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  fundSplitTotalLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    flex: 1,
  },
  fundSplitSummaryValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right",
  },
});

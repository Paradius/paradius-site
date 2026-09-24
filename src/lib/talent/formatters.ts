import type {
  AnonymousExperienceEntry,
  AnonymousProfile,
  Availability,
  DeveloperRole,
  Seniority,
  SpokenLanguage,
} from '../api';

const SENIORITY_LABELS: Record<Seniority, string> = {
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
  staff: 'Staff',
};

const ROLE_LABELS: Record<DeveloperRole, string> = {
  mobile: 'Mobile',
  backend: 'Backend',
  frontend: 'Frontend',
  fullstack: 'Full-stack',
  devops: 'DevOps',
  qa: 'QA',
  data: 'Data',
};

const AVAILABILITY_LABELS: Record<Availability, { label: string; modifier: string }> = {
  available: { label: 'Available now', modifier: 'badge--available' },
  soon: { label: 'Available soon', modifier: 'badge--soon' },
  unavailable: { label: 'Currently assigned', modifier: 'badge--unavailable' },
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
};

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** Human-readable seniority label. */
export function formatSeniority(seniority: Seniority): string {
  return SENIORITY_LABELS[seniority];
}

/** Human-readable developer role label. */
export function formatRole(role: DeveloperRole): string {
  return ROLE_LABELS[role];
}

/** Availability badge copy and CSS modifier. */
export function formatAvailability(availability: Availability): {
  label: string;
  modifier: string;
} {
  return AVAILABILITY_LABELS[availability];
}

/** Stack slug → display label (e.g. `ci-cd` → `ci cd`). */
const STACK_LABELS: Record<string, string> = {
  a11y: 'Accessibility',
  agora: 'Agora',
  airflow: 'Airflow',
  android: 'Android',
  angular: 'Angular',
  'api-testing': 'API testing',
  'argo-cd': 'Argo CD',
  aws: 'AWS',
  azure: 'Azure',
  bigquery: 'BigQuery',
  blazor: 'Blazor',
  bloc: 'BLoC',
  'c-sharp': 'C#',
  'ci-cd': 'CI/CD',
  'clean-architecture': 'Clean Architecture',
  'contract-testing': 'Contract testing',
  coroutines: 'Coroutines',
  css: 'CSS',
  cypress: 'Cypress',
  dagger: 'Dagger',
  'data-modeling': 'Data modeling',
  dbt: 'dbt',
  ddd: 'DDD',
  'design-tokens': 'Design tokens',
  docker: 'Docker',
  dotnet: '.NET',
  'event-driven': 'Event-driven',
  figma: 'Figma',
  firebase: 'Firebase',
  gcp: 'GCP',
  'github-actions': 'GitHub Actions',
  go: 'Go',
  grafana: 'Grafana',
  graphql: 'GraphQL',
  grpc: 'gRPC',
  helm: 'Helm',
  hilt: 'Hilt',
  hl7: 'HL7',
  java: 'Java',
  javascript: 'JavaScript',
  'jetpack-compose': 'Jetpack Compose',
  jwt: 'JWT',
  k6: 'k6',
  kafka: 'Kafka',
  kotlin: 'Kotlin',
  kubernetes: 'Kubernetes',
  linux: 'Linux',
  'load-testing': 'Load testing',
  microservices: 'Microservices',
  mvvm: 'MVVM',
  mysql: 'MySQL',
  nats: 'NATS',
  nestjs: 'NestJS',
  nextjs: 'Next.js',
  nodejs: 'Node.js',
  opentelemetry: 'OpenTelemetry',
  oracle: 'Oracle',
  'pl-sql': 'PL/SQL',
  playwright: 'Playwright',
  postgresql: 'PostgreSQL',
  prometheus: 'Prometheus',
  protobuf: 'Protobuf',
  python: 'Python',
  rabbitmq: 'RabbitMQ',
  react: 'React',
  'react-native': 'React Native',
  redis: 'Redis',
  redux: 'Redux',
  rest: 'REST',
  retrofit: 'Retrofit',
  room: 'Room',
  rxjava: 'RxJava',
  shopify: 'Shopify',
  snowflake: 'Snowflake',
  spark: 'Spark',
  'spring-boot': 'Spring Boot',
  sql: 'SQL',
  'sql-server': 'SQL Server',
  sqlite: 'SQLite',
  storybook: 'Storybook',
  stripe: 'Stripe',
  swiftui: 'SwiftUI',
  tailwind: 'Tailwind',
  'tcp-ip': 'TCP/IP',
  terraform: 'Terraform',
  typescript: 'TypeScript',
  vite: 'Vite',
  vtex: 'VTEX',
  wcag: 'WCAG',
  wcf: 'WCF',
  'web-api': 'Web API',
  zustand: 'Zustand',
};

export function formatStackTag(tag: string): string {
  const known = STACK_LABELS[tag];
  if (known) return known;
  const words = tag.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Spoken language with CEFR level. */
export function formatLanguage(language: SpokenLanguage): string {
  const name = LANGUAGE_NAMES[language.lang] ?? language.lang.toUpperCase();
  return `${name} (${language.level})`;
}

/** ISO date (`YYYY-MM`) → `Mon YYYY`. */
export function formatExperienceDate(isoDate: string): string {
  const [year, month] = isoDate.split('-');
  const monthIndex = Number.parseInt(month, 10) - 1;
  return `${MONTH_LABELS[monthIndex] ?? month} ${year}`;
}

/** Experience entry date range. */
export function formatExperienceRange(entry: AnonymousExperienceEntry): string {
  const start = formatExperienceDate(entry.startDate);
  const end = entry.endDate ? formatExperienceDate(entry.endDate) : 'Present';
  return `${start} to ${end}`;
}

export function formatExperienceYears(entry: AnonymousExperienceEntry): string {
  const start = entry.startDate.slice(0, 4);
  const end = entry.endDate ? entry.endDate.slice(0, 4) : 'now';
  return `${start} to ${end}`;
}

/** Top N stack tags for compact displays. */
export function topStackTags(profile: AnonymousProfile, limit = 4): string[] {
  return profile.stack.slice(0, limit);
}

/** Remaining stack count beyond the visible slice. */
export function overflowStackCount(profile: AnonymousProfile, limit = 4): number {
  return Math.max(0, profile.stack.length - limit);
}

/** Unique roles across profiles, sorted for stable filter UI. */
export function collectRoles(profiles: readonly AnonymousProfile[]): DeveloperRole[] {
  const roles = new Set<DeveloperRole>();
  for (const profile of profiles) {
    for (const role of profile.roles) {
      roles.add(role);
    }
  }
  return [...roles].sort();
}

/** Unique stack tags across profiles, sorted alphabetically. */
export function collectStackTags(profiles: readonly AnonymousProfile[]): string[] {
  const tags = new Set<string>();
  for (const profile of profiles) {
    for (const tag of profile.stack) {
      tags.add(tag);
    }
  }
  return [...tags].sort();
}

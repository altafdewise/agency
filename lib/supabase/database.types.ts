export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "owner" | "project_lead" | "editor" | "viewer";
export type LeadStatus = "new" | "contacted" | "converted" | "lost";
export type ProjectStatus = "ongoing" | "on_hold" | "delivered" | "closed";
export type BlogStatus = "draft" | "published";
export type FunnelAction = "entered" | "completed";

export interface ProfileRow {
  id: string;
  email: string;
  name: string | null;
  role: AppRole;
  last_active_at: string | null;
  created_at: string;
}

export interface LeadRow {
  id: string;
  name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  persona: string | null;
  needs: string[] | null;
  stage: string | null;
  brief_text: string | null;
  ai_tier: string | null;
  ai_price_low: number | null;
  ai_price_high: number | null;
  ai_summary: string | null;
  ai_included: string[] | null;
  status: LeadStatus;
  created_at: string;
}

export interface ProjectRow {
  id: string;
  client_name: string;
  service_type: string;
  value: number | null;
  status: ProjectStatus;
  assigned_to: string | null;
  deadline: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image_url: string | null;
  status: BlogStatus;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PageViewRow {
  id: string;
  path: string;
  viewed_at: string;
  referrer: string | null;
  session_id: string | null;
}

export interface FunnelEventRow {
  id: string;
  session_id: string;
  step_name: string;
  action: FunnelAction;
  created_at: string;
}

export interface PricingConfigRow {
  id: string;
  service_key: string;
  tier: "simple" | "medium" | "complex";
  price_low: number;
  price_high: number;
  label: string | null;
  updated_at: string;
}

export interface SiteSettingRow {
  key: string;
  value: Json;
  updated_at: string;
}

export interface BookingRow {
  id: string;
  created_at: string;
  date: string;
  time: string;
  timezone: string;
  contact_name: string | null;
  contact_email: string;
  contact_phone: string | null;
  note: string | null;
  brief: Json;
  estimate: Json | null;
}

export interface FeedbackRow {
  id: string;
  message: string;
  created_at: string;
}

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row & Record<string, unknown>;
  Insert: Insert & Record<string, unknown>;
  Update: Update & Record<string, unknown>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        Partial<ProfileRow> & Pick<ProfileRow, "id" | "email">,
        Partial<ProfileRow>
      >;
      leads: Table<
        LeadRow,
        Partial<LeadRow>,
        Partial<LeadRow>
      >;
      projects: Table<
        ProjectRow,
        Partial<ProjectRow> & Pick<ProjectRow, "client_name" | "service_type">,
        Partial<ProjectRow>
      >;
      blog_posts: Table<
        BlogPostRow,
        Partial<BlogPostRow> & Pick<BlogPostRow, "title" | "slug" | "content">,
        Partial<BlogPostRow>
      >;
      page_views: Table<PageViewRow, Partial<PageViewRow>, Partial<PageViewRow>>;
      funnel_events: Table<
        FunnelEventRow,
        Partial<FunnelEventRow> & Pick<FunnelEventRow, "session_id" | "step_name" | "action">,
        Partial<FunnelEventRow>
      >;
      pricing_config: Table<
        PricingConfigRow,
        Partial<PricingConfigRow> &
          Pick<PricingConfigRow, "service_key" | "tier" | "price_low" | "price_high">,
        Partial<PricingConfigRow>
      >;
      site_settings: Table<
        SiteSettingRow,
        Pick<SiteSettingRow, "key" | "value">,
        Partial<SiteSettingRow>
      >;
      bookings: Table<
        BookingRow,
        Partial<BookingRow> &
          Pick<BookingRow, "date" | "time" | "timezone" | "contact_email" | "brief">,
        Partial<BookingRow>
      >;
      feedback: Table<
        FeedbackRow,
        Partial<FeedbackRow> & Pick<FeedbackRow, "message">,
        Partial<FeedbackRow>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
      lead_status: LeadStatus;
      project_status: ProjectStatus;
      blog_status: BlogStatus;
      funnel_action: FunnelAction;
    };
    CompositeTypes: Record<string, never>;
  };
}

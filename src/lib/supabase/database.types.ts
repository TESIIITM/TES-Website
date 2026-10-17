
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "admin_users": {
                  Row: {
                    "created_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"announcements": {
                  Row: {
                    "created_at": string,"details": string | null,"id": string,"is_published": boolean,"label": string,"primary_label": string | null,"primary_url": string | null,"published_on": string,"secondary_label": string | null,"secondary_url": string | null,"summary": string,"title": string,"title_emphasis": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"details"?: string | null,"id"?: string,"is_published"?: boolean,"label"?: string,"primary_label"?: string | null,"primary_url"?: string | null,"published_on"?: string,"secondary_label"?: string | null,"secondary_url"?: string | null,"summary": string,"title": string,"title_emphasis"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"details"?: string | null,"id"?: string,"is_published"?: boolean,"label"?: string,"primary_label"?: string | null,"primary_url"?: string | null,"published_on"?: string,"secondary_label"?: string | null,"secondary_url"?: string | null,"summary"?: string,"title"?: string,"title_emphasis"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"applications": {
                  Row: {
                    "additional_info": string | null,"admin_notes": string | null,"admin_scores": NonNullable<Json>,"ai_error": string | null,"ai_evaluated_at": string | null,"ai_evaluation": Json | null,"ai_model": string | null,"ai_status": string,"auto_evidence": NonNullable<Json>,"auto_scores": NonNullable<Json>,"commitment": Database["public"]['Enums']["commitment_preference"],"contributions": string,"created_at": string,"department": string,"email": string,"email_error": string | null,"email_sent_at": string | null,"email_status": string,"id": string,"knowledge": string,"links": (string)[],"name": string,"plan": string,"resume_path": string | null,"role": string,"roll_number": string,"showcase": string,"status": Database["public"]['Enums']["application_status"],"updated_at": string,"weekly_hours": number,"year_of_study": string
                  }
                  ComputedFields: never
                  Insert: {
                    "additional_info"?: string | null,"admin_notes"?: string | null,"admin_scores"?: NonNullable<Json>,"ai_error"?: string | null,"ai_evaluated_at"?: string | null,"ai_evaluation"?: Json | null,"ai_model"?: string | null,"ai_status"?: string,"auto_evidence"?: NonNullable<Json>,"auto_scores"?: NonNullable<Json>,"commitment": Database["public"]['Enums']["commitment_preference"],"contributions": string,"created_at"?: string,"department": string,"email": string,"email_error"?: string | null,"email_sent_at"?: string | null,"email_status"?: string,"id"?: string,"knowledge": string,"links"?: (string)[],"name": string,"plan": string,"resume_path"?: string | null,"role": string,"roll_number": string,"showcase": string,"status"?: Database["public"]['Enums']["application_status"],"updated_at"?: string,"weekly_hours": number,"year_of_study": string
                  }
                  Update: {
                    "additional_info"?: string | null,"admin_notes"?: string | null,"admin_scores"?: NonNullable<Json>,"ai_error"?: string | null,"ai_evaluated_at"?: string | null,"ai_evaluation"?: Json | null,"ai_model"?: string | null,"ai_status"?: string,"auto_evidence"?: NonNullable<Json>,"auto_scores"?: NonNullable<Json>,"commitment"?: Database["public"]['Enums']["commitment_preference"],"contributions"?: string,"created_at"?: string,"department"?: string,"email"?: string,"email_error"?: string | null,"email_sent_at"?: string | null,"email_status"?: string,"id"?: string,"knowledge"?: string,"links"?: (string)[],"name"?: string,"plan"?: string,"resume_path"?: string | null,"role"?: string,"roll_number"?: string,"showcase"?: string,"status"?: Database["public"]['Enums']["application_status"],"updated_at"?: string,"weekly_hours"?: number,"year_of_study"?: string
                  }
                  Relationships: [
                    
                  ]
                },"domains": {
                  Row: {
                    "created_at": string,"detail": string,"id": string,"sort_order": number,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"detail": string,"id"?: string,"sort_order"?: number,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"detail"?: string,"id"?: string,"sort_order"?: number,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"github_repos": {
                  Row: {
                    "created_at": string,"description": string | null,"full_name": string,"headline": string | null,"headline_emphasis": string | null,"id": string,"is_featured": boolean,"is_published": boolean,"sort_order": number,"title": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"full_name": string,"headline"?: string | null,"headline_emphasis"?: string | null,"id"?: string,"is_featured"?: boolean,"is_published"?: boolean,"sort_order"?: number,"title"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"full_name"?: string,"headline"?: string | null,"headline_emphasis"?: string | null,"id"?: string,"is_featured"?: boolean,"is_published"?: boolean,"sort_order"?: number,"title"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"github_settings": {
                  Row: {
                    "contributors_heading": string,"contributors_intro": string | null,"hidden_logins": (string)[],"id": boolean,"max_contributors": number,"show_contributors": boolean,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "contributors_heading"?: string,"contributors_intro"?: string | null,"hidden_logins"?: (string)[],"id"?: boolean,"max_contributors"?: number,"show_contributors"?: boolean,"updated_at"?: string
                  }
                  Update: {
                    "contributors_heading"?: string,"contributors_intro"?: string | null,"hidden_logins"?: (string)[],"id"?: boolean,"max_contributors"?: number,"show_contributors"?: boolean,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"instagram_posts": {
                  Row: {
                    "caption": string | null,"created_at": string,"id": string,"image_url": string | null,"is_published": boolean,"posted_on": string,"updated_at": string,"url": string
                  }
                  ComputedFields: never
                  Insert: {
                    "caption"?: string | null,"created_at"?: string,"id"?: string,"image_url"?: string | null,"is_published"?: boolean,"posted_on": string,"updated_at"?: string,"url": string
                  }
                  Update: {
                    "caption"?: string | null,"created_at"?: string,"id"?: string,"image_url"?: string | null,"is_published"?: boolean,"posted_on"?: string,"updated_at"?: string,"url"?: string
                  }
                  Relationships: [
                    
                  ]
                },"members": {
                  Row: {
                    "created_at": string,"id": string,"is_published": boolean,"linkedin_url": string | null,"member_group": Database["public"]['Enums']["member_group"],"name": string,"portrait_url": string | null,"role": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"is_published"?: boolean,"linkedin_url"?: string | null,"member_group": Database["public"]['Enums']["member_group"],"name": string,"portrait_url"?: string | null,"role": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_published"?: boolean,"linkedin_url"?: string | null,"member_group"?: Database["public"]['Enums']["member_group"],"name"?: string,"portrait_url"?: string | null,"role"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"recruitment_criteria": {
                  Row: {
                    "guidance": string,"key": string,"label": string,"sort_order": number,"updated_at": string,"weight": number
                  }
                  ComputedFields: never
                  Insert: {
                    "guidance": string,"key": string,"label": string,"sort_order"?: number,"updated_at"?: string,"weight": number
                  }
                  Update: {
                    "guidance"?: string,"key"?: string,"label"?: string,"sort_order"?: number,"updated_at"?: string,"weight"?: number
                  }
                  Relationships: [
                    
                  ]
                },"recruitment_settings": {
                  Row: {
                    "departments": (string)[],"id": boolean,"is_open": boolean,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "departments"?: (string)[],"id"?: boolean,"is_open"?: boolean,"updated_at"?: string
                  }
                  Update: {
                    "departments"?: (string)[],"id"?: boolean,"is_open"?: boolean,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"site_settings": {
                  Row: {
                    "contact_email": string,"contribution_guide_url": string,"github_url": string,"hidden_medium_posts": (string)[],"id": boolean,"instagram_url": string,"linkedin_url": string,"medium_url": string,"repository_url": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "contact_email": string,"contribution_guide_url": string,"github_url": string,"hidden_medium_posts"?: (string)[],"id"?: boolean,"instagram_url": string,"linkedin_url": string,"medium_url": string,"repository_url": string,"updated_at"?: string
                  }
                  Update: {
                    "contact_email"?: string,"contribution_guide_url"?: string,"github_url"?: string,"hidden_medium_posts"?: (string)[],"id"?: boolean,"instagram_url"?: string,"linkedin_url"?: string,"medium_url"?: string,"repository_url"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"stories": {
                  Row: {
                    "category": string,"created_at": string,"id": string,"is_published": boolean,"published_on": string,"slug": string,"summary": string,"title": string,"updated_at": string,"url": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category": string,"created_at"?: string,"id"?: string,"is_published"?: boolean,"published_on": string,"slug": string,"summary": string,"title": string,"updated_at"?: string,"url": string
                  }
                  Update: {
                    "category"?: string,"created_at"?: string,"id"?: string,"is_published"?: boolean,"published_on"?: string,"slug"?: string,"summary"?: string,"title"?: string,"updated_at"?: string,"url"?: string
                  }
                  Relationships: [
                    
                  ]
                },"tech_news": {
                  Row: {
                    "created_at": string,"id": string,"image_url": string | null,"is_published": boolean,"sort_order": number,"source": string | null,"summary": string | null,"title": string,"updated_at": string,"url": string,"week_of": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"image_url"?: string | null,"is_published"?: boolean,"sort_order"?: number,"source"?: string | null,"summary"?: string | null,"title": string,"updated_at"?: string,"url": string,"week_of": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"image_url"?: string | null,"is_published"?: boolean,"sort_order"?: number,"source"?: string | null,"summary"?: string | null,"title"?: string,"updated_at"?: string,"url"?: string,"week_of"?: string
                  }
                  Relationships: [
                    
                  ]
                },"youtube_videos": {
                  Row: {
                    "channel": string | null,"created_at": string,"id": string,"is_published": boolean,"published_on": string,"thumbnail_url": string | null,"title": string,"updated_at": string,"video_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "channel"?: string | null,"created_at"?: string,"id"?: string,"is_published"?: boolean,"published_on"?: string,"thumbnail_url"?: string | null,"title": string,"updated_at"?: string,"video_id": string
                  }
                  Update: {
                    "channel"?: string | null,"created_at"?: string,"id"?: string,"is_published"?: boolean,"published_on"?: string,"thumbnail_url"?: string | null,"title"?: string,"updated_at"?: string,"video_id"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           }
          }
          Enums: {
            "application_status": "pending"|"shortlisted"|"selected"|"rejected","commitment_preference": "long_term"|"short_term"|"mixed","member_group": "faculty"|"student"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "application_status": ["pending", "shortlisted", "selected", "rejected"],"commitment_preference": ["long_term", "short_term", "mixed"],"member_group": ["faculty", "student"]
          }
        }
} as const

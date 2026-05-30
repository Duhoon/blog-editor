export interface TagModel {
  id: string,
  name: string,
  created_at: Date,
  updated_at: Date,
}

export interface TagPostLinksModel {
  post_id: number, 
  tag_id: number, 
  is_active: boolean
}
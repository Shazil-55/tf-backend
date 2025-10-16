export interface DataForToken {
  id: string;
}

export interface DefaultTable {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends DefaultTable {
  name: string;
  email: string;
  password?: string;
  pageName?: string;
  creatorName?: string;
  is18Plus?: boolean;
  profilePhoto?: string;
  bio?: string;
  coverPhoto?: string;
  introVideo?: string;
  themeColor?: string;
  socialLinks?: any; // JSON field
  tags?: string[];
  categoryId?: string;
}


export interface verifyOtp {
  id: string;
  userId: string;
  sessionToken: string;
  createdAt: string;
  updatedAt: string;
}

export enum s3Paths {
  profilePictures = 'profile-pictures/',
}

export interface Follower extends DefaultTable {
  userId: string;
  followerId: string;
}

export interface Category extends DefaultTable {
  name: string;
  parentId: string | null;
}

export interface Post extends DefaultTable {
  creatorId: string;
  title: string;
  content: string;
  accessType: string; // 'free' | 'paid' (or membership-based)
  tags?: string[] | null;
  totalLikes: number;
}

export interface PostMediaFile extends DefaultTable {
  postId: string;
  type: string; // image | video | audio | other
  url: string;
  name?: string | null;
  size?: number | null;
}

export interface PostComment extends DefaultTable {
  postId: string;
  userId: string;
  comment: string;
}

export interface Membership extends DefaultTable {
  creatorId: string;
  name: string;
  price: string;
  currency: string;
  description?: string;
}
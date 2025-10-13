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
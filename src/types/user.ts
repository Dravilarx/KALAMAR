export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserProfileInput extends Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> { }

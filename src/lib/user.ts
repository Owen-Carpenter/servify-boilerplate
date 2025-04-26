import { toast } from "@/components/ui/use-toast";

// User role
export type UserRole = 'user' | 'provider' | 'admin';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    darkMode: boolean;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  // Optional payment information (in a real app, this would be stored securely)
  paymentMethods?: Array<{
    id: string;
    type: string;
    lastFour: string;
    expiryDate: string;
    isDefault: boolean;
  }>;
}

// Helper function to create a valid date or fallback to current date
function createValidDate(dayOffset: number): Date {
  try {
    return new Date(Date.now() + 86400000 * dayOffset);
  } catch (error) {
    console.error("Error creating date with offset", dayOffset, error);
    return new Date(); // Fallback to current date
  }
}

// Sample user data (in a real app, this would be fetched from an API)
const mockUser: User = {
  id: "user-1",
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  role: "user",
  phone: "+1 (555) 123-4567",
  createdAt: createValidDate(-90), // 3 months ago
  lastLoginAt: createValidDate(-0.5), // 12 hours ago
  preferences: {
    notifications: true,
    emailUpdates: true,
    darkMode: false
  },
  address: {
    street: "123 Main St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    country: "USA"
  },
  paymentMethods: [
    {
      id: "pm-1",
      type: "visa",
      lastFour: "4242",
      expiryDate: "09/25",
      isDefault: true
    },
    {
      id: "pm-2",
      type: "mastercard",
      lastFour: "5678",
      expiryDate: "12/24",
      isDefault: false
    }
  ]
};

/**
 * Get the current user's profile
 * In a real app, this would fetch from an API with authentication
 */
export async function getUserProfile(): Promise<User> {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Ensure dates are valid before returning
      const validatedUser = {
        ...mockUser,
        createdAt: mockUser.createdAt instanceof Date && !isNaN(mockUser.createdAt.getTime())
          ? mockUser.createdAt
          : new Date(),
        lastLoginAt: mockUser.lastLoginAt instanceof Date && !isNaN(mockUser.lastLoginAt.getTime())
          ? mockUser.lastLoginAt
          : new Date()
      };
      
      resolve(validatedUser);
    }, 600);
  });
}

/**
 * Update the user's profile
 * @param userData Partial user data to update
 * @returns The updated user
 */
export async function updateUserProfile(userData: Partial<User>): Promise<User> {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Update the user data
      Object.assign(mockUser, userData);

      // Validate dates after update
      if (mockUser.createdAt && (!(mockUser.createdAt instanceof Date) || isNaN(mockUser.createdAt.getTime()))) {
        mockUser.createdAt = new Date();
      }
      
      if (mockUser.lastLoginAt && (!(mockUser.lastLoginAt instanceof Date) || isNaN(mockUser.lastLoginAt.getTime()))) {
        mockUser.lastLoginAt = new Date();
      }

      toast({
        variant: "success",
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });

      resolve(mockUser);
    }, 800);
  });
}

/**
 * Update user preferences
 * @param preferences User preferences to update
 * @returns The updated user
 */
export async function updateUserPreferences(
  preferences: Partial<User["preferences"]>
): Promise<User> {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Update only the preferences
      mockUser.preferences = {
        ...mockUser.preferences,
        ...preferences,
      };

      toast({
        variant: "success",
        title: "Preferences Updated",
        description: "Your preferences have been saved",
      });

      resolve(mockUser);
    }, 600);
  });
} 
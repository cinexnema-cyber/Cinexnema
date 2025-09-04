// MongoDB utilities removed - using only Supabase

export const validateMongoDBConnection = async (
  uri: string,
): Promise<{ success: boolean; error?: string }> => {
  return { success: false, error: "MongoDB not used - Supabase only" };
};

export const getMongoDBConnectionInfo = () => {
  return {
    message: "MongoDB removed - using Supabase for all database operations",
  };
};

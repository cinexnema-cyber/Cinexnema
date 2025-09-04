// Database configuration removed - using only Supabase
// All database operations are now handled through Supabase

export const connectDB = async () => {
  console.log("✅ Using Supabase for database operations");
};

export const disconnectDB = async () => {
  console.log("✅ Supabase connections managed automatically");
};

export const getConnectionStatus = () => {
  return {
    isConnected: true,
    readyState: 1,
    host: "supabase",
    name: "supabase",
  };
};

export default connectDB;

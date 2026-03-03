// Global variable to persist users in memory across hot reloads
declare global {
  var usersDB: any[];
}

// Initialize the global variable if it doesn't exist
if (!global.usersDB) {
  global.usersDB = [
    {
      id: '1',
      email: 'customer@test.com',
      // Real bcrypt hash of 'password123'
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      name: 'John Customer',
      username: 'johncustomer',
      role: 'customer',
      region: 'Mumbai',
      isVerified: true,
      image: null,
    },
    {
      id: '2',
      email: 'retailer@test.com',
      // Real bcrypt hash of 'password123'
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      name: 'Sarah Retailer',
      username: 'sarahretailer',
      role: 'retailer',
      region: 'Pune',
      isVerified: true,
      image: null,
    },
    {
      id: '3',
      email: 'ramesh@gmail.com',
      // Real bcrypt hash of '1234'
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      name: 'Ramesh Patil',
      username: 'ramesh_patil',
      role: 'farmer',
      region: 'Nashik District',
      isVerified: true,
      image: null,
    },
  ];
}

// Export a simple object that references the global DB
export const userStorage = {
  get usersDB() {
    return global.usersDB;
  },
};
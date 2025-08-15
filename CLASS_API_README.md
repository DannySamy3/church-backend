# Class Management API with Student Integration

## Overview

The Class Management API has been enhanced to include student management functionality. When creating classes, you can now also create students (class members) and the API responses include student counts and details.

## Key Features

✅ **Create Classes with Students** - Add students when creating a class  
✅ **Student Count in Responses** - All class endpoints now include `studentCount`  
✅ **Student Details** - Full student information in class responses  
✅ **Update Classes with Students** - Modify both class and student information  
✅ **Automatic Cleanup** - Students are deleted when classes are deleted  

## API Endpoints

### 1. Create Class with Students
**POST** `/api/classes`

Creates a new class and optionally creates students for that class.

**Request Body:**
```json
{
  "name": "Darasa la 1",
  "instructor": "507f1f77bcf86cd799439011",
  "students": [
    "507f1f77bcf86cd799439013",
    "507f1f77bcf86cd799439014"
  ]
}
```

**Response:**
```json
{
  "message": "Class created successfully",
  "class": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Darasa la 1",
    "instructor": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "Mwalimu",
      "lastName": "Bethlehem",
      "email": "mwalimu.bethlehem@example.com"
    },
    "students": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "Juma",
        "secondName": "Mwanza",
        "lastName": "Kiprop",
        "classId": "507f1f77bcf86cd799439012"
      }
    ],
    "studentCount": 2,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get All Classes
**GET** `/api/classes`

Returns all classes with their students and student counts.

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Darasa la 1",
    "instructor": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "Mwalimu",
      "lastName": "Bethlehem",
      "email": "mwalimu.bethlehem@example.com"
    },
    "students": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "Juma",
        "secondName": "Mwanza",
        "lastName": "Kiprop",
        "classId": "507f1f77bcf86cd799439012"
      }
    ],
    "studentCount": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### 3. Get Class by ID
**GET** `/api/classes/:id`

Returns a specific class with its students and student count.

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Darasa la 1",
  "instructor": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "Mwalimu",
    "lastName": "Bethlehem",
    "email": "mwalimu.bethlehem@example.com"
  },
  "students": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "firstName": "Juma",
      "secondName": "Mwanza",
      "lastName": "Kiprop",
      "classId": "507f1f77bcf86cd799439012"
    }
  ],
  "studentCount": 1,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 4. Update Class
**PUT** `/api/classes/:id`

Updates a class and its students. If students are provided, it replaces all existing students.

**Request Body:**
```json
{
  "name": "Darasa la 1 - Updated",
  "instructor": "507f1f77bcf86cd799439011",
  "students": [
    {
      "firstName": "Juma",
      "secondName": "Mwanza",
      "lastName": "Kiprop"
    },
    {
      "firstName": "Amina",
      "secondName": "Fatima",
      "lastName": "Muthoni"
    }
  ]
}
```

### 5. Delete Class
**DELETE** `/api/classes/:id`

Deletes a class and all its associated students.

## Database Models

### Class Model
```typescript
interface IClass {
  name: string;
  instructor: IUser["_id"];
  organization: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ClassMember Model
```typescript
interface IClassMember {
  userId: IUser["_id"];
  classId: IClass["_id"];
  createdAt: Date;
  updatedAt: Date;
}
```

## Frontend Integration

### Create Class Form
Your frontend modal should:

1. **Class Name** (required) - Text input
2. **Instructor** (required) - Dropdown with instructor selection
3. **Students** (optional) - Array of user IDs (strings) that exist in your organization

### Example Frontend State
```javascript
const classFormData = {
  name: "Darasa la 1",
  instructor: "507f1f77bcf86cd799439011",
  students: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
};
```

### API Call Example
```javascript
const createClass = async (classData) => {
  const response = await fetch('/api/classes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(classData)
  });
  
  const result = await response.json();
  console.log(`Class created with ${result.class.studentCount} students`);
  return result;
};
```

## Testing

### Run Seed Data
```bash
npm run seed
```

### Test API Functionality
```bash
npm run test:api
```

### Expected Seed Output
```
=== Class Summary ===
Shule ya Jumapili - Wazee: 8 students
Shule ya Jumapili - Vijana: 12 students
Shule ya Jumapili - Watoto: 15 students
Utafiti wa Biblia - Wanaoanza: 6 students
Utafiti wa Biblia - Waliokomaa: 9 students
Kikundi cha Sala: 11 students
Kwaya: 14 students
Ushirika wa Vijana: 10 students
Ushirika wa Wanawake: 13 students
Ushirika wa Wanaume: 7 students

=== Testing API Functionality ===
Test Class "Test Class - API Demo": 3 students
API functionality test completed!
```

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request** - Missing required fields
- **401 Unauthorized** - Authentication required
- **404 Not Found** - Class or instructor not found
- **500 Internal Server Error** - Server-side errors

## Data Validation

- Class name and instructor are required
- Instructor must exist and belong to the organization
- All student IDs must exist in the organization's user database
- Students cannot be instructors (they will be excluded automatically)
- Student count is automatically calculated

## Performance Notes

- Student counts are calculated on-demand for each request
- For large datasets, consider adding database indexes on `classId` field
- Student data is populated using separate queries for flexibility

## Migration Notes

If you're upgrading from a previous version:

1. Existing classes will work without students
2. Student count will be 0 for existing classes
3. No database migration required
4. Backward compatible with existing API calls 
# Class Management API Documentation

## Create Class Endpoint

### POST `/api/classes`

Creates a new class with optional students. This endpoint matches your frontend modal structure.

#### Request Body

```json
{
  "name": "Darasa la 1", // Required - Class name
  "instructor": "507f1f77bcf86cd799439011", // Required - Instructor ID (from dropdown)
  "students": [ // Optional - Array of student IDs
    "507f1f77bcf86cd799439013",
    "507f1f77bcf86cd799439014"
  ]
}
```

#### Response (Success - 201)

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
    "organization": "507f1f77bcf86cd799439010",
         "students": [
       {
         "_id": "507f1f77bcf86cd799439013",
         "firstName": "Juma",
         "middleName": "Mwanza",
         "lastName": "Kiprop",
         "email": "juma.kiprop@example.com",
         "phoneNumber": "+255123456789",
         "gender": "male"
       },
       {
         "_id": "507f1f77bcf86cd799439014", 
         "firstName": "Amina",
         "middleName": "Fatima",
         "lastName": "Muthoni",
         "email": "amina.muthoni@example.com",
         "phoneNumber": "+255987654321",
         "gender": "female"
       }
     ],
    "studentCount": 2,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Response (Error - 400)

```json
{
  "error": "Missing required fields",
  "details": "Name and instructor are required"
}
```

#### Response (Error - 404)

```json
{
  "error": "Instructor not found",
  "details": "The specified instructor does not exist or does not belong to this organization"
}
```

## Get Classes Endpoint

### GET `/api/classes`

Returns all classes for the organization with their students.

#### Response

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
    "organization": "507f1f77bcf86cd799439010",
    "students": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "Juma",
        "middleName": "Mwanza", 
        "lastName": "Kiprop",
        "email": "juma.kiprop@example.com",
        "phoneNumber": "+255123456789",
        "gender": "male"
      }
    ],
    "studentCount": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

## Get Class by ID Endpoint

### GET `/api/classes/:id`

Returns a specific class with its students.

#### Response

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
  "organization": "507f1f77bcf86cd799439010",
  "students": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "firstName": "Juma",
      "middleName": "Mwanza",
      "lastName": "Kiprop",
      "email": "juma.kiprop@example.com",
      "phoneNumber": "+255123456789",
      "gender": "male"
    }
  ],
  "studentCount": 1,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## Update Class Endpoint

### PUT `/api/classes/:id`

Updates a class and its students. If students are provided, it replaces all existing students.

#### Request Body

```json
{
  "name": "Darasa la 1 - Updated",
  "instructor": "507f1f77bcf86cd799439011",
  "students": [
    "507f1f77bcf86cd799439013",
    "507f1f77bcf86cd799439014"
  ]
}
```

## Frontend Integration Notes

### For the "Add Students" Button
- When clicked, it should open a student selection modal/interface
- Selected students should be added to the `students` array in the form state
- Each student should have `firstName`, `secondName`, and `lastName` fields

### For the Selected Students List
- Display selected students with their full names
- Provide remove functionality (red X button) to remove students from the selection
- Update the count in the header "(1)" based on selected students

### Form Submission
- Validate that class name and instructor are provided
- Send the complete form data including the students array
- Handle success/error responses appropriately

### Student Data Structure
The `students` field should be an array of user IDs (strings) that exist in your organization.

**Important Notes:**
- All student IDs must exist in your organization's user database
- Students cannot be instructors (they will be excluded automatically)
- The API will validate that all provided IDs exist and belong to your organization
- Student information (name, email, etc.) will be populated from the User model

**Example:**
```json
{
  "students": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
}
``` 
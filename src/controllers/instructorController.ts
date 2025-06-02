import { Request, Response } from "express";
import { User, IUser } from "../models/User";
import { auth } from "../middleware/auth";
import { checkRole } from "../middleware/roleAuth";
import { uploadImageToImgur } from "../utils/imgurUpload"; // Import the helper function

// Controller for managing instructors (users with role 'member' or a specific instructor flag)

// Create a new instructor
export const createInstructor = async (req: Request, res: Response) => {
  try {
    // Assuming instructor details are in req.body
    const { name, email, phoneNumber, address } = req.body;
    const userOrganization = (req.user as IUser).organization; // Get organization from logged-in user

    // Basic validation
    if (!name || !email || !phoneNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if image is provided for instructor creation
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Profile image is required for instructors" });
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    let profileImageUrl = undefined; // Initialize profile image URL

    // Upload image to Imgur
    profileImageUrl = await uploadImageToImgur(req.file);
    if (!profileImageUrl) {
      // Handle Imgur upload failure
      return res.status(500).json({ error: "Failed to upload image to Imgur" });
    }

    // Create the new user/instructor. Assuming 'instructor' is a valid role or you have a flag.
    const newInstructor = new User({
      name,
      email,
      phoneNumber,
      address,
      profileImageUrl, // Save the Imgur image URL
      role: "instructor", // Or set an isInstructor flag, depending on your User model
      organization: userOrganization, // Set the organization of the new instructor
      // Add other instructor-specific fields as per your User model
    });

    await newInstructor.save();

    res.status(201).json(newInstructor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get instructor details by ID
export const getInstructor = async (req: Request, res: Response) => {
  try {
    const instructorId = req.params.id;
    const userOrganization = (req.user as IUser).organization; // Get organization from logged-in user with type assertion

    // Find the instructor by ID, ensure they have the 'instructor' role/flag, and belong to the same organization
    const instructor = await User.findOne({
      _id: instructorId,
      organization: userOrganization, // Add organization filter
      $or: [{ role: "instructor" }, { isInstructor: true }], // Adjust based on your User model
    });

    if (!instructor) {
      return res
        .status(404)
        .json({ error: "Instructor not found in your organization" });
    }

    res.status(200).json(instructor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Edit instructor details by ID
export const editInstructor = async (req: Request, res: Response) => {
  try {
    const instructorId = req.params.id;
    const updates = req.body;

    // Find the instructor by ID and ensure they have the 'instructor' role or flag
    const instructor = await User.findOneAndUpdate(
      {
        _id: instructorId,
        $or: [{ role: "instructor" }, { isInstructor: true }], // Adjust based on your User model
      },
      updates,
      { new: true } // Return the updated document
    );

    if (!instructor) {
      return res.status(404).json({ error: "Instructor not found" });
    }

    res.status(200).json(instructor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete an instructor by ID
export const deleteInstructor = async (req: Request, res: Response) => {
  try {
    const instructorId = req.params.id;
    const userOrganization = (req.user as IUser).organization; // Get organization from logged-in user

    // Find and delete the instructor by ID and ensure they have the 'instructor' role or flag and belong to the same organization
    const instructor = await User.findOneAndDelete({
      _id: instructorId,
      organization: userOrganization, // Add organization filter
      $or: [{ role: "instructor" }, { isInstructor: true }], // Adjust based on your User model
    });

    if (!instructor) {
      return res
        .status(404)
        .json({ error: "Instructor not found in your organization" });
    }

    res.status(200).json({ message: "Instructor deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

import { Request, Response } from "express";
import { Organization } from "../models/Organization";

export const createOrganization = async (req: Request, res: Response) => {
  try {
    const { name, description, address, phoneNumber, email, website } =
      req.body;

    // Check if organization already exists
    const existingOrg = await Organization.findOne({ name });
    if (existingOrg) {
      return res.status(400).json({
        error: "Organization creation failed",
        details:
          "An organization with this name already exists. Please choose a different name for your organization.",
      });
    }

    const organization = new Organization({
      name,
      description,
      address,
      phoneNumber,
      email,
      website,
    });

    await organization.save();

    res.status(201).json({
      message: "Organization created successfully",
      organization,
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    res.status(500).json({
      error: "Organization creation failed",
      details:
        "An unexpected error occurred while creating the organization. Please try again later or contact support if the problem persists.",
    });
  }
};

export const getOrganizations = async (req: Request, res: Response) => {
  try {
    const organizations = await Organization.find().select("-__v");
    res.json(organizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({
      error: "Organizations retrieval failed",
      details:
        "An unexpected error occurred while fetching the organizations list. Please try again later or contact support if the problem persists.",
    });
  }
};

export const getOrganizationById = async (req: Request, res: Response) => {
  try {
    const organization = await Organization.findById(req.params.id).select(
      "-__v"
    );
    if (!organization) {
      return res.status(404).json({
        error: "Organization not found",
        details:
          "The requested organization could not be found. Please verify the organization ID and try again.",
      });
    }
    res.json(organization);
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({
      error: "Organization retrieval failed",
      details:
        "An unexpected error occurred while fetching the organization details. Please try again later or contact support if the problem persists.",
    });
  }
};

export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-__v");

    if (!organization) {
      return res.status(404).json({
        error: "Organization not found",
        details:
          "The organization you're trying to update could not be found. Please verify the organization ID and try again.",
      });
    }

    res.json({
      message: "Organization updated successfully",
      organization,
    });
  } catch (error) {
    console.error("Error updating organization:", error);
    res.status(500).json({
      error: "Organization update failed",
      details:
        "An unexpected error occurred while updating the organization. Please try again later or contact support if the problem persists.",
    });
  }
};

export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    const organization = await Organization.findByIdAndDelete(req.params.id);
    if (!organization) {
      return res.status(404).json({
        error: "Organization not found",
        details:
          "The organization you're trying to delete could not be found. Please verify the organization ID and try again.",
      });
    }

    res.json({ message: "Organization deleted successfully" });
  } catch (error) {
    console.error("Error deleting organization:", error);
    res.status(500).json({
      error: "Organization deletion failed",
      details:
        "An unexpected error occurred while deleting the organization. Please try again later or contact support if the problem persists.",
    });
  }
};

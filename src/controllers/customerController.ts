import { Request, Response } from "express";
import { Customer } from "../models/Customer";

export const createCustomer = async (req: Request, res: Response) => {
  try {
    if (!req.organization) {
      return res.status(401).json({
        error: "Authentication Error",
        details:
          "Please log in with an organization account to create customers.",
      });
    }

    const { firstName, lastName, email, phoneNumber, address } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      email,
      organization: req.organization,
    });

    if (existingCustomer) {
      return res.status(400).json({
        error: "Duplicate Entry",
        details: "A customer with this email already exists.",
      });
    }

    const customer = new Customer({
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      organization: req.organization,
    });

    await customer.save();

    res.status(201).json({
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to create customer. Please try again later.",
    });
  }
};

export const getCustomers = async (req: Request, res: Response) => {
  try {
    if (!req.organization) {
      return res.status(401).json({
        error: "Authentication Error",
        details:
          "Please log in with an organization account to view customers.",
      });
    }

    const customers = await Customer.find({ organization: req.organization });
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to fetch customers. Please try again later.",
    });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    if (!req.organization) {
      return res.status(401).json({
        error: "Authentication Error",
        details:
          "Please log in with an organization account to view customer details.",
      });
    }

    const customer = await Customer.findOne({
      _id: req.params.id,
      organization: req.organization,
    });

    if (!customer) {
      return res.status(404).json({
        error: "Not Found",
        details: "Customer not found in your organization.",
      });
    }

    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to fetch customer details. Please try again later.",
    });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    if (!req.organization) {
      return res.status(401).json({
        error: "Authentication Error",
        details:
          "Please log in with an organization account to update customers.",
      });
    }

    const customer = await Customer.findOne({
      _id: req.params.id,
      organization: req.organization,
    });

    if (!customer) {
      return res.status(404).json({
        error: "Not Found",
        details: "Customer not found in your organization.",
      });
    }

    const { firstName, lastName, email, phoneNumber, address } = req.body;

    // Check if email is being changed and if it's already in use
    if (email && email !== customer.email) {
      const existingCustomer = await Customer.findOne({
        email,
        organization: req.organization,
      });

      if (existingCustomer) {
        return res.status(400).json({
          error: "Duplicate Entry",
          details: "A customer with this email already exists.",
        });
      }
    }

    customer.firstName = firstName || customer.firstName;
    customer.lastName = lastName || customer.lastName;
    customer.email = email || customer.email;
    customer.phoneNumber = phoneNumber || customer.phoneNumber;
    customer.address = address || customer.address;

    await customer.save();

    res.json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to update customer. Please try again later.",
    });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    if (!req.organization) {
      return res.status(401).json({
        error: "Authentication Error",
        details:
          "Please log in with an organization account to delete customers.",
      });
    }

    const customer = await Customer.findOne({
      _id: req.params.id,
      organization: req.organization,
    });

    if (!customer) {
      return res.status(404).json({
        error: "Not Found",
        details: "Customer not found in your organization.",
      });
    }

    await customer.deleteOne();

    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to delete customer. Please try again later.",
    });
  }
};

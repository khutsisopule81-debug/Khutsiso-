import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';

// Types
interface RegistrationData {
  playerName: string;
  dateOfBirth: string;
  position: string;
  school: string;
  ageCategory: string;
  parentName: string;
  contactNumber: string;
  alternativeNumber: string;
  email: string;
  needsTransport: string;
  medicalConditions: string;
}

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Validate environment variables
function validateEnv() {
  const required = ['EMAIL_USER', 'EMAIL_PASSWORD', 'REGISTRATION_EMAIL'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

// Save uploaded file
async function saveFile(file: File): Promise<string> {
  const uploadsDir = join(process.cwd(), 'public', 'uploads', 'proofs');

  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name}`;
  const filepath = join(uploadsDir, filename);

  await writeFile(filepath, buffer);

  return `/uploads/proofs/${filename}`;
}

// Send confirmation email to parent
async function sendParentEmail(data: RegistrationData & { proofPath: string }) {
  const emailContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to bottom, #fbbf24, #000); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #fff; margin: 0;">STARS OF AFRICA</h1>
            <p style="color: #fbbf24; margin: 10px 0 0 0;">Football Academy</p>
          </div>

          <div style="background: #000; color: #fff; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #fbbf24;">Registration Confirmed!</h2>
            <p>Dear ${data.parentName},</p>

            <p>Thank you for registering <strong>${data.playerName}</strong> for the Stars of Africa Football Academy trials. We're excited to see your young talent on the field!</p>

            <h3 style="color: #fbbf24; margin-top: 30px;">Registration Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #fbbf24;">
                <td style="padding: 10px; font-weight: bold;">Player Name:</td>
                <td style="padding: 10px;">${data.playerName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #fbbf24;">
                <td style="padding: 10px; font-weight: bold;">Date of Birth:</td>
                <td style="padding: 10px;">${new Date(data.dateOfBirth).toLocaleDateString()}</td>
              </tr>
              <tr style="border-bottom: 1px solid #fbbf24;">
                <td style="padding: 10px; font-weight: bold;">Position:</td>
                <td style="padding: 10px;">${data.position}</td>
              </tr>
              <tr style="border-bottom: 1px solid #fbbf24;">
                <td style="padding: 10px; font-weight: bold;">Age Category:</td>
                <td style="padding: 10px;">${data.ageCategory}</td>
              </tr>
              <tr style="border-bottom: 1px solid #fbbf24;">
                <td style="padding: 10px; font-weight: bold;">School:</td>
                <td style="padding: 10px;">${data.school}</td>
              </tr>
              <tr style="border-bottom: 1px solid #fbbf24;">
                <td style="padding: 10px; font-weight: bold;">Transport:</td>
                <td style="padding: 10px;">${data.needsTransport}</td>
              </tr>
            </table>

            <h3 style="color: #fbbf24; margin-top: 30px;">Trial Details</h3>
            <ul style="line-height: 1.8;">
              <li><strong>Dates:</strong> 29 June – 3 July 2026</li>
              <li><strong>Venue:</strong> 72 Indra Street, Mayfair West, Johannesburg</li>
              <li><strong>Start Time:</strong> 08:00 AM Sharp</li>
              <li><strong>Registration Fee:</strong> R380 (Paid)</li>
            </ul>

            <h3 style="color: #fbbf24; margin-top: 30px;">Important Reminders</h3>
            <ul style="line-height: 1.8;">
              <li>✓ Please bring this confirmation email</li>
              <li>✓ Bring proof of payment</li>
              <li>✓ Parents/guardians must attend</li>
              <li>✓ We provide training kit, meals, and refreshments</li>
              <li>✓ Selected players may receive scholarship opportunities</li>
            </ul>

            <p style="margin-top: 30px; color: #fbbf24;"><strong>Need Help?</strong></p>
            <p>Contact us on WhatsApp: <strong>073 442 9023</strong></p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Stars of Africa Football Academy<br>
              72 Indra Street, Mayfair West, Johannesburg, 2092
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: data.email,
    subject: `Trial Registration Confirmed - ${data.playerName}`,
    html: emailContent,
  });
}

// Send admin notification
async function sendAdminEmail(data: RegistrationData & { proofPath: string }) {
  const emailContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h2>New Trial Registration Received</h2>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Player Name:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.playerName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Date of Birth:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date(data.dateOfBirth).toLocaleDateString()}</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Position:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.position}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Age Category:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.ageCategory}</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">School:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.school}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Parent/Guardian:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.parentName}</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Contact:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.contactNumber}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Alternative:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.alternativeNumber || 'N/A'}</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Email:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Transport:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.needsTransport}</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Medical Info:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.medicalConditions || 'None'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Registered:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.REGISTRATION_EMAIL,
    subject: `[NEW REGISTRATION] ${data.playerName} - ${data.ageCategory}`,
    html: emailContent,
  });
}

// Main handler
export async function POST(request: NextRequest) {
  try {
    validateEnv();

    const formData = await request.formData();

    // Extract form fields
    const data: RegistrationData = {
      playerName: formData.get('playerName') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      position: formData.get('position') as string,
      school: formData.get('school') as string,
      ageCategory: formData.get('ageCategory') as string,
      parentName: formData.get('parentName') as string,
      contactNumber: formData.get('contactNumber') as string,
      alternativeNumber: formData.get('alternativeNumber') as string,
      email: formData.get('email') as string,
      needsTransport: formData.get('needsTransport') as string,
      medicalConditions: formData.get('medicalConditions') as string,
    };

    // Validate required fields
    const requiredFields = ['playerName', 'dateOfBirth', 'position', 'school', 'ageCategory', 'parentName', 'contactNumber', 'email', 'needsTransport'];
    const missing = requiredFields.filter(field => !data[field as keyof RegistrationData]);

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Handle file upload
    const proofFile = formData.get('proofOfPayment') as File;
    if (!proofFile) {
      return NextResponse.json(
        { error: 'Proof of payment is required' },
        { status: 400 }
      );
    }

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(proofFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and PDF are allowed.' },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (proofFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Save file
    const proofPath = await saveFile(proofFile);

    // Save to database
    const registration = await prisma.registration.create({
      data: {
        playerName: data.playerName,
        dateOfBirth: data.dateOfBirth,
        position: data.position,
        school: data.school,
        ageCategory: data.ageCategory,
        parentName: data.parentName,
        contactNumber: data.contactNumber,
        alternativeNumber: data.alternativeNumber,
        email: data.email,
        needsTransport: data.needsTransport,
        medicalConditions: data.medicalConditions,
        proofPath,
      },
    });

    // Send emails
    await Promise.all([
      sendParentEmail({ ...data, proofPath }),
      sendAdminEmail({ ...data, proofPath }),
    ]);

    console.log('Registration saved:', registration);

    return NextResponse.json(
      {
        success: true,
        message: 'Registration submitted successfully! We will contact you soon.',
        registrationId: registration.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process registration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Tool Execution Engine
 * Pure backend functions for deterministic tool execution
 * Tools: check_availability, book_appointment, capture_lead, human_handoff, etc.
 */

import { db } from '../db';
import { eq, and, gte, lte, sql, not, or } from 'drizzle-orm';
import {
  appointments,
  availabilitySlots,
  leads,
  handoffQueue,
  agents,
  knowledgeBase,
} from '@shared/schema';
import { integrationService, type TriggerEvent } from '../integrations';
import type {
  ToolName,
  ToolInput,
  ToolResult,
  CheckAvailabilityInput,
  CheckAvailabilityResult,
  BookAppointmentInput,
  BookAppointmentResult,
  CaptureLeadInput,
  CaptureLeadResult,
  HumanHandoffInput,
  HumanHandoffResult,
  AvailableSlot,
} from './types';

export class ToolExecutionEngine {
  private tools: Map<ToolName, (input: any) => Promise<ToolResult>> = new Map();

  constructor() {
    // Register all tools
    this.tools.set('check_availability', this.checkAvailability.bind(this));
    this.tools.set('book_appointment', this.bookAppointment.bind(this));
    this.tools.set('cancel_appointment', this.cancelAppointment.bind(this));
    this.tools.set('reschedule_appointment', this.rescheduleAppointment.bind(this));
    this.tools.set('capture_lead', this.captureLead.bind(this));
    this.tools.set('human_handoff', this.humanHandoff.bind(this));
    this.tools.set('get_business_info', this.getBusinessInfo.bind(this));
    this.tools.set('search_knowledge', this.searchKnowledge.bind(this));
    this.tools.set('get_appointment_status', this.getAppointmentStatus.bind(this));
  }

  /**
   * Execute a tool by name
   */
  async execute(toolName: ToolName, input: ToolInput): Promise<ToolResult> {
    const tool = this.tools.get(toolName);
    
    if (!tool) {
      return {
        success: false,
        error: `Unknown tool: ${toolName}`,
        message: 'This action is not supported.',
      };
    }

    try {
      console.log(`[ToolEngine] Executing ${toolName} with input:`, JSON.stringify(input));
      const result = await tool(input);
      console.log(`[ToolEngine] ${toolName} result:`, JSON.stringify(result));
      return result;
    } catch (error) {
      console.error(`[ToolEngine] Error executing ${toolName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'An error occurred while processing your request. Please try again.',
      };
    }
  }

  /**
   * Check Availability
   * Returns available time slots for a given date
   */
  async checkAvailability(input: CheckAvailabilityInput): Promise<CheckAvailabilityResult> {
    const { agentId, date, serviceType } = input;

    if (!date) {
      return {
        success: false,
        error: 'Date is required',
        message: 'Please provide a date to check availability.',
      };
    }

    // Parse date
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // Get availability slots for this day
    const slots = await db
      .select()
      .from(availabilitySlots)
      .where(
        and(
          eq(availabilitySlots.agentId, agentId),
          eq(availabilitySlots.isAvailable, true),
          or(
            eq(availabilitySlots.dayOfWeek, dayOfWeek),
            eq(availabilitySlots.specificDate, new Date(date))
          ),
          serviceType ? eq(availabilitySlots.serviceType, serviceType) : sql`1=1`
        )
      );

    if (slots.length === 0) {
      // No slots configured, return default business hours
      const defaultSlots = this.getDefaultSlots(date);
      
      // Check which are already booked
      const bookedAppointments = await this.getBookedSlots(agentId, date);
      const availableSlots = defaultSlots.filter(
        (slot) => !bookedAppointments.some((b) => b.time === slot.time)
      );

      return {
        success: true,
        message: availableSlots.length > 0
          ? `Found ${availableSlots.length} available slots for ${date}`
          : `No available slots for ${date}`,
        data: {
          requestedDate: date,
          availableSlots,
          nextAvailableDates: availableSlots.length === 0 
            ? await this.findNextAvailableDates(agentId, date, 3)
            : undefined,
        },
      };
    }

    // Generate time slots from availability configuration
    const generatedSlots: AvailableSlot[] = [];
    
    for (const slot of slots) {
      const slotTimes = this.generateTimeSlots(
        slot.startTime!,
        slot.endTime!,
        slot.slotDuration || 30
      );
      
      for (const time of slotTimes) {
        generatedSlots.push({
          date,
          time,
          endTime: this.addMinutes(time, slot.slotDuration || 30),
          serviceType: slot.serviceType || undefined,
          available: true,
        });
      }
    }

    // Filter out already booked slots
    const bookedAppointments = await this.getBookedSlots(agentId, date, serviceType);
    const availableSlots = generatedSlots.filter(
      (slot) => !bookedAppointments.some(
        (b) => b.time === slot.time && (!serviceType || b.serviceType === serviceType)
      )
    );

    return {
      success: true,
      message: availableSlots.length > 0
        ? `Found ${availableSlots.length} available slots`
        : 'No available slots for the requested date',
      data: {
        requestedDate: date,
        availableSlots,
        nextAvailableDates: availableSlots.length === 0
          ? await this.findNextAvailableDates(agentId, date, 3)
          : undefined,
      },
    };
  }

  /**
   * Book Appointment
   * Atomic booking with concurrency safety
   */
  async bookAppointment(input: BookAppointmentInput): Promise<BookAppointmentResult> {
    const {
      agentId,
      conversationId,
      customerName,
      customerPhone,
      customerEmail,
      date,
      time,
      serviceType,
      notes,
    } = input;

    // Validate required fields
    if (!customerName || !customerPhone || !date || !time) {
      const missing = [];
      if (!customerName) missing.push('name');
      if (!customerPhone) missing.push('phone');
      if (!date) missing.push('date');
      if (!time) missing.push('time');
      
      return {
        success: false,
        error: 'Missing required fields',
        message: `Please provide your ${missing.join(', ')} to complete the booking.`,
      };
    }

    // Normalize phone number
    const normalizedPhone = this.normalizePhone(customerPhone);

    // Check if slot is still available (concurrency check)
    const existingBooking = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.agentId, agentId),
          eq(appointments.appointmentDate, new Date(date)),
          eq(appointments.appointmentTime, time),
          not(eq(appointments.status, 'cancelled'))
        )
      )
      .limit(1);

    if (existingBooking.length > 0) {
      // Slot is taken, find alternatives
      const availability = await this.checkAvailability({
        agentId,
        conversationId,
        date,
        serviceType,
      });

      return {
        success: false,
        error: 'Slot already booked',
        message: `Sorry, the ${time} slot on ${date} has just been booked. Would you like to choose another time?`,
        options: availability.data?.availableSlots?.slice(0, 5),
      };
    }

    // Calculate end time
    const endTime = this.addMinutes(time, 30); // Default 30 min appointments

    // Create the appointment (atomic insert with unique constraint)
    const appointmentId = crypto.randomUUID();
    
    try {
      await db.insert(appointments).values({
        id: appointmentId,
        agentId,
        conversationId,
        customerName,
        customerPhone: normalizedPhone,
        customerEmail,
        appointmentDate: new Date(date),
        appointmentTime: time,
        endTime,
        serviceType,
        status: 'confirmed',
        notes,
        metadata: {
          bookedAt: new Date().toISOString(),
          source: 'whatsapp',
        },
      });
    } catch (error: any) {
      // Handle duplicate key error (concurrent booking)
      if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate')) {
        const availability = await this.checkAvailability({
          agentId,
          conversationId,
          date,
          serviceType,
        });

        return {
          success: false,
          error: 'Slot already booked',
          message: 'Sorry, this slot was just booked by someone else. Please choose another time.',
          options: availability.data?.availableSlots?.slice(0, 5),
        };
      }
      throw error;
    }

    // Also capture as lead
    await this.captureLead({
      agentId,
      conversationId,
      name: customerName,
      phone: normalizedPhone,
      email: customerEmail,
      interest: serviceType || 'Appointment',
      notes: `Booked appointment for ${date} at ${time}`,
    });

    // Trigger integrations (Google Sheets, Webhooks, Email, etc.)
    this.triggerIntegration('appointment_booked', agentId, {
      appointmentId,
      customerName,
      customerPhone: normalizedPhone,
      customerEmail,
      date,
      time,
      endTime,
      serviceType,
      status: 'confirmed',
    });

    return {
      success: true,
      message: 'Appointment booked successfully!',
      data: {
        appointmentId,
        customerName,
        date,
        time,
        serviceType,
        status: 'confirmed',
        confirmationMessage: `Your appointment has been confirmed for ${date} at ${time}. We'll send you a reminder before your appointment.`,
      },
    };
  }

  /**
   * Cancel Appointment
   */
  async cancelAppointment(input: ToolInput & { appointmentId?: string; customerPhone?: string }): Promise<ToolResult> {
    const { agentId, appointmentId, customerPhone } = input;

    // Find appointment by ID or phone
    let appointment;
    
    if (appointmentId) {
      [appointment] = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.id, appointmentId),
            eq(appointments.agentId, agentId)
          )
        )
        .limit(1);
    } else if (customerPhone) {
      [appointment] = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.agentId, agentId),
            eq(appointments.customerPhone, this.normalizePhone(customerPhone)),
            not(eq(appointments.status, 'cancelled')),
            not(eq(appointments.status, 'completed'))
          )
        )
        .limit(1);
    }

    if (!appointment) {
      return {
        success: false,
        error: 'Appointment not found',
        message: 'I couldn\'t find your appointment. Could you please provide your booking reference or phone number?',
      };
    }

    // Cancel the appointment
    await db
      .update(appointments)
      .set({
        status: 'cancelled',
        metadata: {
          ...(appointment.metadata as any || {}),
          cancelledAt: new Date().toISOString(),
        },
      })
      .where(eq(appointments.id, appointment.id));

    // Trigger integrations for cancellation
    this.triggerIntegration('appointment_cancelled', agentId, {
      appointmentId: appointment.id,
      customerName: appointment.customerName,
      customerPhone: appointment.customerPhone,
      date: appointment.appointmentDate,
      time: appointment.appointmentTime,
      serviceType: appointment.serviceType,
    });

    return {
      success: true,
      message: `Your appointment on ${appointment.appointmentDate} at ${appointment.appointmentTime} has been cancelled. Would you like to reschedule?`,
      data: {
        appointmentId: appointment.id,
        date: appointment.appointmentDate,
        time: appointment.appointmentTime,
      },
    };
  }

  /**
   * Reschedule Appointment
   */
  async rescheduleAppointment(
    input: ToolInput & { appointmentId?: string; customerPhone?: string; newDate: string; newTime: string }
  ): Promise<ToolResult> {
    const { agentId, appointmentId, customerPhone, newDate, newTime } = input;

    // Find existing appointment
    let appointment;
    
    if (appointmentId) {
      [appointment] = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.id, appointmentId),
            eq(appointments.agentId, agentId)
          )
        )
        .limit(1);
    } else if (customerPhone) {
      [appointment] = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.agentId, agentId),
            eq(appointments.customerPhone, this.normalizePhone(customerPhone)),
            eq(appointments.status, 'confirmed')
          )
        )
        .limit(1);
    }

    if (!appointment) {
      return {
        success: false,
        error: 'Appointment not found',
        message: 'I couldn\'t find your appointment. Please provide your booking details.',
      };
    }

    // Check new slot availability
    const existingBooking = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.agentId, agentId),
          eq(appointments.appointmentDate, new Date(newDate)),
          eq(appointments.appointmentTime, newTime),
          not(eq(appointments.status, 'cancelled')),
          not(eq(appointments.id, appointment.id))
        )
      )
      .limit(1);

    if (existingBooking.length > 0) {
      return {
        success: false,
        error: 'New slot not available',
        message: `The ${newTime} slot on ${newDate} is not available. Would you like to check other times?`,
      };
    }

    // Update appointment
    await db
      .update(appointments)
      .set({
        appointmentDate: new Date(newDate),
        appointmentTime: newTime,
        metadata: {
          ...(appointment.metadata as any || {}),
          rescheduledAt: new Date().toISOString(),
          previousDate: appointment.appointmentDate,
          previousTime: appointment.appointmentTime,
        },
      })
      .where(eq(appointments.id, appointment.id));

    return {
      success: true,
      message: `Your appointment has been rescheduled to ${newDate} at ${newTime}.`,
      data: {
        appointmentId: appointment.id,
        newDate,
        newTime,
        previousDate: appointment.appointmentDate,
        previousTime: appointment.appointmentTime,
      },
    };
  }

  /**
   * Capture Lead
   */
  async captureLead(input: CaptureLeadInput): Promise<CaptureLeadResult> {
    const { agentId, conversationId, name, phone, email, interest, notes, customFields } = input;

    if (!phone) {
      return {
        success: false,
        error: 'Phone number is required',
        message: 'Please provide a phone number to continue.',
      };
    }

    const normalizedPhone = this.normalizePhone(phone);

    // Check if lead already exists
    const [existing] = await db
      .select()
      .from(leads)
      .where(
        and(
          eq(leads.agentId, agentId),
          eq(leads.phone, normalizedPhone)
        )
      )
      .limit(1);

    if (existing) {
      // Update existing lead
      await db
        .update(leads)
        .set({
          name: name || existing.name,
          email: email || existing.email,
          interest: interest || existing.interest,
          notes: notes ? `${existing.notes || ''}\n${notes}` : existing.notes,
          customFields: customFields 
            ? { ...(existing.customFields as any || {}), ...customFields }
            : existing.customFields,
          updatedAt: new Date(),
        })
        .where(eq(leads.id, existing.id));

      return {
        success: true,
        message: 'Lead information updated.',
        data: {
          leadId: existing.id,
          status: existing.status!,
        },
      };
    }

    // Create new lead
    const leadId = crypto.randomUUID();
    
    await db.insert(leads).values({
      id: leadId,
      agentId,
      conversationId,
      name,
      phone: normalizedPhone,
      email,
      source: 'whatsapp',
      status: 'new',
      interest,
      notes,
      customFields,
    });

    // Trigger integrations for new lead capture
    this.triggerIntegration('lead_captured', agentId, {
      leadId,
      name,
      phone: normalizedPhone,
      email,
      interest,
      notes,
      customFields,
      source: 'whatsapp',
    });

    return {
      success: true,
      message: 'Lead captured successfully.',
      data: {
        leadId,
        status: 'new',
      },
    };
  }

  /**
   * Human Handoff
   */
  async humanHandoff(input: HumanHandoffInput): Promise<HumanHandoffResult> {
    const { agentId, conversationId, reason, priority } = input;

    // Check if already in queue
    const [existing] = await db
      .select()
      .from(handoffQueue)
      .where(
        and(
          eq(handoffQueue.conversationId, conversationId),
          eq(handoffQueue.status, 'pending')
        )
      )
      .limit(1);

    if (existing) {
      return {
        success: true,
        message: 'You are already in queue to speak with a human representative.',
        data: {
          handoffId: existing.id,
        },
      };
    }

    // Add to queue
    const handoffId = crypto.randomUUID();
    
    await db.insert(handoffQueue).values({
      id: handoffId,
      agentId,
      conversationId,
      reason,
      priority: priority || 'normal',
      status: 'pending',
    });

    // Count queue position
    const queueCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(handoffQueue)
      .where(
        and(
          eq(handoffQueue.agentId, agentId),
          eq(handoffQueue.status, 'pending')
        )
      );

    const position = queueCount[0]?.count || 1;

    return {
      success: true,
      message: `I've added you to the queue to speak with a human representative. You are number ${position} in the queue. Someone will be with you shortly.`,
      data: {
        handoffId,
        queuePosition: position,
        estimatedWait: position <= 3 ? 'A few minutes' : '10-15 minutes',
      },
    };
  }

  /**
   * Get Business Info
   */
  async getBusinessInfo(input: ToolInput): Promise<ToolResult> {
    const { agentId } = input;

    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      return {
        success: false,
        error: 'Agent not found',
        message: 'Business information not available.',
      };
    }

    const businessInfo = agent.businessInfo as any || {};

    return {
      success: true,
      message: 'Here is our business information:',
      data: {
        name: businessInfo.name || agent.name,
        phone: businessInfo.phone,
        email: businessInfo.email,
        address: businessInfo.address,
        workingHours: businessInfo.workingHours,
      },
    };
  }

  /**
   * Search Knowledge Base (RAG)
   */
  async searchKnowledge(input: ToolInput & { query: string }): Promise<ToolResult> {
    const { agentId, query } = input;

    if (!query) {
      return {
        success: false,
        error: 'Query required',
        message: 'Please specify what you would like to know.',
      };
    }

    // Simple keyword search (in production, use vector similarity search)
    const results = await db
      .select()
      .from(knowledgeBase)
      .where(
        and(
          eq(knowledgeBase.agentId, agentId),
          sql`LOWER(${knowledgeBase.content}) LIKE LOWER(${'%' + query + '%'})`
        )
      )
      .limit(5);

    if (results.length === 0) {
      return {
        success: true,
        message: 'No relevant information found.',
        data: { results: [] },
      };
    }

    // Combine relevant content
    const relevantContent = results
      .map((r) => `${r.title || 'Information'}:\n${r.content}`)
      .join('\n\n');

    return {
      success: true,
      message: 'Found relevant information.',
      data: {
        results: results.map((r) => ({
          title: r.title,
          content: r.content,
          source: r.sourceUrl,
        })),
        combinedContext: relevantContent,
      },
    };
  }

  /**
   * Get Appointment Status
   */
  async getAppointmentStatus(
    input: ToolInput & { appointmentId?: string; customerPhone?: string }
  ): Promise<ToolResult> {
    const { agentId, appointmentId, customerPhone } = input;

    let appointment;

    if (appointmentId) {
      [appointment] = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.id, appointmentId),
            eq(appointments.agentId, agentId)
          )
        )
        .limit(1);
    } else if (customerPhone) {
      [appointment] = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.agentId, agentId),
            eq(appointments.customerPhone, this.normalizePhone(customerPhone))
          )
        )
        .limit(1);
    }

    if (!appointment) {
      return {
        success: false,
        error: 'Appointment not found',
        message: 'I couldn\'t find your appointment. Could you provide your phone number or booking reference?',
      };
    }

    return {
      success: true,
      message: `Your appointment status: ${appointment.status}`,
      data: {
        appointmentId: appointment.id,
        date: appointment.appointmentDate,
        time: appointment.appointmentTime,
        status: appointment.status,
        serviceType: appointment.serviceType,
      },
    };
  }

  // ========== HELPER METHODS ==========

  /**
   * Get booked slots for a date
   */
  private async getBookedSlots(
    agentId: string,
    date: string,
    serviceType?: string
  ): Promise<Array<{ time: string; serviceType?: string }>> {
    const booked = await db
      .select({
        time: appointments.appointmentTime,
        serviceType: appointments.serviceType,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.agentId, agentId),
          eq(appointments.appointmentDate, new Date(date)),
          not(eq(appointments.status, 'cancelled'))
        )
      );

    return booked.map((b) => ({
      time: b.time!,
      serviceType: b.serviceType || undefined,
    }));
  }

  /**
   * Find next available dates
   */
  private async findNextAvailableDates(
    agentId: string,
    fromDate: string,
    count: number
  ): Promise<string[]> {
    const availableDates: string[] = [];
    const startDate = new Date(fromDate);

    for (let i = 1; i <= 14 && availableDates.length < count; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(checkDate.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];

      // Skip weekends (optional, configurable)
      if (checkDate.getDay() === 0) continue;

      const booked = await this.getBookedSlots(agentId, dateStr);
      const defaultSlots = this.getDefaultSlots(dateStr);
      
      if (booked.length < defaultSlots.length) {
        availableDates.push(dateStr);
      }
    }

    return availableDates;
  }

  /**
   * Get default time slots (9 AM - 6 PM)
   */
  private getDefaultSlots(date: string): AvailableSlot[] {
    const slots: AvailableSlot[] = [];
    const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                   '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
                   '16:00', '16:30', '17:00', '17:30'];

    for (const time of times) {
      slots.push({
        date,
        time,
        endTime: this.addMinutes(time, 30),
        available: true,
      });
    }

    return slots;
  }

  /**
   * Generate time slots from start/end time
   */
  private generateTimeSlots(startTime: string, endTime: string, duration: number): string[] {
    const slots: string[] = [];
    let current = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    while (current + duration <= end) {
      slots.push(this.minutesToTime(current));
      current += duration;
    }

    return slots;
  }

  /**
   * Convert time string to minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes to time string
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Add minutes to time string
   */
  private addMinutes(time: string, minutes: number): string {
    return this.minutesToTime(this.timeToMinutes(time) + minutes);
  }

  /**
   * Normalize phone number
   */
  private normalizePhone(phone: string): string {
    return phone.replace(/[^\d+]/g, '');
  }

  /**
   * Trigger integration event (non-blocking)
   */
  private triggerIntegration(event: TriggerEvent, agentId: string, data: Record<string, any>): void {
    // Get userId from agent (non-blocking)
    db.select({ userId: agents.userId })
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1)
      .then(([agent]) => {
        if (agent) {
          integrationService.triggerEvent({
            event,
            agentId,
            userId: agent.userId,
            data,
            timestamp: new Date().toISOString(),
          });
        }
      })
      .catch(err => {
        console.error('[ToolEngine] Error triggering integration:', err);
      });
  }
}

// Export singleton instance
export const toolEngine = new ToolExecutionEngine();
